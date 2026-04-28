import threading
import time
from collections import deque
from datetime import datetime, timezone
from typing import Optional

from opentelemetry import metrics

from schemas.app_config import AppConfig, PidConfig
from schemas.channel import HeaterConfig
from schemas.temp_control import Parameters, PidVariables, ErrorStats, ChannelStatusOut, HeaterStatus, PidStatus, PidStopReason
from .PID import PIDController
from repositories.heater import HeaterRepository
from .heater_factory import create_heater
from .lgg_client import readingApi

_meter = metrics.get_meter("heater-api")
_pid_loop_duration = _meter.create_histogram(
    "pid.loop.duration",
    description="Time per PID loop iteration",
    unit="ms",
)
_thermo_api_read_duration = _meter.create_histogram(
    "thermo_api.read_temp.duration",
    description="Duration of temperature reading API call to ls-api",
    unit="ms",
)


class TempService:
    def __init__(
        self,
        channel_id: int,
        channel_name: str,
        thermo_channel: int,
        heater_config: HeaterConfig,
        app_config: AppConfig | None = None,
        channel_max_temp: Optional[float] = None,
    ):
        """Initialize temperature service for a specific channel."""
        self.channel_id = channel_id
        self.channel_name = channel_name
        self.thermo_channel = thermo_channel

        pid_cfg = app_config.pid if app_config else PidConfig()
        self._pid_cfg = pid_cfg
        self._effective_max_temp = (
            channel_max_temp if channel_max_temp is not None else pid_cfg.max_temp_celsius
        )

        self._target = pid_cfg.default_target
        self._params = Parameters()

        self._pid = PIDController(
            kp=self._params.kp,
            ki=self._params.ki,
            kd=self._params.kd,
            setpoint=self._target,
            output_min=pid_cfg.output_min,
            output_max=pid_cfg.output_max,
            anti_windup_min=pid_cfg.anti_windup_min,
            anti_windup_max=pid_cfg.anti_windup_max,
        )

        self.heater: HeaterRepository = create_heater(
            config=heater_config, channel_id=channel_id)
        self._heater_type = heater_config.type

        self._running = False
        self._started_at: Optional[datetime] = None
        self._thread: threading.Thread | None = None

        self._error_timestamps: deque = deque()
        self._total_errors = 0
        self._last_error_message: Optional[str] = None
        self._current_temp: Optional[float] = None
        self._error_lock = threading.Lock()

        self._last_successful_read_monotonic: Optional[float] = None
        self._last_stop_reason: Optional[PidStopReason] = None
        self._last_stop_at: Optional[datetime] = None
        self._last_stop_detail: Optional[str] = None

    def get_target(self):
        return self._target

    def set_target(self, value: float):
        self._target = value
        self._pid.set_setpoint(value)

    def get_parameters(self):
        return self._params

    def set_parameters(self, params: Parameters):
        self._params = params
        self._pid.set_coefficients(
            kp=params.kp,
            ki=params.ki,
            kd=params.kd,
        )
        return self._params

    def _record_error(self, error_message: str):
        """Record an error with timestamp for tracking."""
        with self._error_lock:
            current_time = time.time()
            self._error_timestamps.append(current_time)
            self._total_errors += 1
            self._last_error_message = error_message

            cutoff_time = current_time - 600  # 10 minutes
            while self._error_timestamps and self._error_timestamps[0] < cutoff_time:
                self._error_timestamps.popleft()

    def _get_error_stats(self) -> ErrorStats:
        """Get error statistics for different time periods."""
        with self._error_lock:
            current_time = time.time()

            one_min_ago = current_time - 60
            errors_1m = sum(
                1 for ts in self._error_timestamps if ts >= one_min_ago)

            errors_10m = len(self._error_timestamps)

            return ErrorStats(
                errors_last_1m=errors_1m,
                errors_last_10m=errors_10m,
                errors_since_start=self._total_errors,
                last_error_message=self._last_error_message
            )

    def get_channel_status(self) -> ChannelStatusOut:
        """Get comprehensive channel status including heater state and PID variables."""
        power = self.heater.get_power()
        pid_state = self._pid.get_state()

        pid_parameters = Parameters(
            kp=pid_state["Kp"],
            ki=pid_state["Ki"],
            kd=pid_state["Kd"]
        )

        pid_variables = PidVariables(
            integral=pid_state["integral"],
            last_error=pid_state["last_error"],
            last_measurement=self._current_temp
        )

        error_stats = self._get_error_stats()

        started_at = self._started_at
        running_for_seconds = None
        if started_at is not None:
            running_for_seconds = (datetime.now(
                timezone.utc) - started_at).total_seconds()

        heater_status = HeaterStatus(
            power=power,
            power_watts=self.heater.get_power_watts(),
            heater_type=self._heater_type,
            heater_metadata=self.heater.get_metadata(),
        )

        pid_status = PidStatus(
            is_active=self._running,
            target=self._target,
            started_at=started_at,
            running_for_seconds=running_for_seconds,
            parameters=pid_parameters,
            variables=pid_variables,
            error_stats=error_stats,
            last_stop_reason=self._last_stop_reason,
            last_stop_at=self._last_stop_at,
            last_stop_detail=self._last_stop_detail,
        )

        return ChannelStatusOut(
            channel_id=self.channel_id,
            channel_name=self.channel_name,
            current_temp=self._current_temp,
            heater=heater_status,
            pid=pid_status,
        )

    def start(self):
        """Start the temperature control loop in a background thread."""
        if self._running:
            return "Control loop already running."

        self._last_stop_reason = None
        self._last_stop_at = None
        self._last_stop_detail = None
        self._last_successful_read_monotonic = time.monotonic()

        self._running = True
        self._started_at = datetime.now(timezone.utc)
        self.heater.connect()
        self._pid._integral = 0.0
        self._pid._last_error = 0.0
        self._pid._last_measurement = None

        self._thread = threading.Thread(target=self._control_loop, daemon=True)
        self._thread.start()
        return "Temperature control loop started."

    def stop(self):
        """Stop the temperature control loop and shut down heater."""
        if not self._running:
            return "Control loop is not running."

        self._last_stop_reason = None
        self._last_stop_at = None
        self._last_stop_detail = None

        self._running = False
        self._started_at = None
        if self._thread:
            self._thread.join(timeout=2.0)
        self.heater.set_power(0.0)
        self.heater.disconnect()
        return "Temperature control loop stopped and heater turned off."

    def _auto_stop(self, reason: PidStopReason, detail: str):
        """Stop the loop from inside the loop thread due to a safety check.

        Must NOT join self — caller is on the loop thread and returns immediately
        afterwards so the thread exits cleanly.
        """
        self._last_stop_reason = reason
        self._last_stop_at = datetime.now(timezone.utc)
        self._last_stop_detail = detail
        self._running = False
        self._started_at = None
        try:
            self.heater.set_power(0.0)
        except Exception as e:
            print(f"[{self.channel_id}] auto-stop: failed to zero heater: {e}")
        try:
            self.heater.disconnect()
        except Exception as e:
            print(f"[{self.channel_id}] auto-stop: failed to disconnect heater: {e}")

    def set_manual_power(self, power: float):
        """Manually set heater power. Stops PID if running."""
        if power < 0.0 or power > 1.0:
            raise ValueError("Power must be between 0.0 and 1.0")

        was_running = self._running
        if was_running:
            self._running = False
            self._started_at = None
            if self._thread:
                self._thread.join(timeout=2.0)

        if not was_running:
            self.heater.connect()

        self.heater.set_power(power)
        return f"Manual power set to {power:.2f}" + (" (PID stopped)" if was_running else "")

    def _control_loop(self):
        """Internal method that runs in background to control temperature."""
        pid_cfg = self._pid_cfg
        output_range = pid_cfg.output_max - pid_cfg.output_min

        last_time = time.monotonic()
        while self._running:
            loop_start = time.monotonic()
            try:
                dt = loop_start - last_time
                if dt < pid_cfg.dt_min:
                    dt = pid_cfg.dt_min
                elif dt > pid_cfg.dt_max:
                    dt = pid_cfg.dt_max

                # Read temperature from thermometer API
                try:
                    read_start = time.monotonic()
                    current_temp = readingApi.get_monitor(
                        self.thermo_channel).kelvin - 273.15
                    _thermo_api_read_duration.record(
                        (time.monotonic() - read_start) * 1000,
                        {"channel_id": self.channel_id},
                    )
                    self._current_temp = current_temp
                    self._last_successful_read_monotonic = loop_start
                except Exception as e:
                    error_msg = f"Thermometer API read error: {type(e).__name__}: {str(e)}"
                    print(f"[{self.channel_id}] {error_msg}")
                    self._record_error(error_msg)
                    if self._last_successful_read_monotonic is not None:
                        elapsed = loop_start - self._last_successful_read_monotonic
                        if elapsed > pid_cfg.max_seconds_without_read:
                            detail = (
                                f"no successful read for {elapsed:.1f}s "
                                f"(limit {pid_cfg.max_seconds_without_read:.1f}s)"
                            )
                            print(f"[{self.channel_id}] SENSOR-TIMEOUT auto-stop: {detail}")
                            self._auto_stop(PidStopReason.sensor_timeout, detail)
                            return
                    # Skip this PID iteration; maintain current heater power
                    last_time = loop_start
                    time.sleep(pid_cfg.loop_interval_seconds)
                    continue

                if current_temp > self._effective_max_temp:
                    detail = (
                        f"{current_temp:.2f}°C exceeded max "
                        f"{self._effective_max_temp:.2f}°C"
                    )
                    print(f"[{self.channel_id}] OVERHEAT auto-stop: {detail}")
                    self._auto_stop(PidStopReason.overheat, detail)
                    return

                duty = self._pid.update(measurement=current_temp, dt=dt)
                power = max(
                    0.0, min(1.0, (duty - pid_cfg.output_min) / output_range))
                self.heater.set_power(power)

                _pid_loop_duration.record(
                    (time.monotonic() - loop_start) * 1000,
                    {"channel_id": self.channel_id},
                )

                print(
                    f"[{self.channel_id}] T={current_temp:.2f}°C | "
                    f"Target={self._target:.1f}°C | Power={power:.3f}"
                )
            except Exception as e:
                error_msg = f"Error in PID control loop: {type(e).__name__}: {str(e)}"
                print(f"[{self.channel_id}] {error_msg}")
                self._record_error(error_msg)
                try:
                    self.heater.set_power(0.0)
                except Exception:
                    pass

            last_time = loop_start
            time.sleep(pid_cfg.loop_interval_seconds)

    def cleanup(self):
        self.heater.disconnect()
