import os
import threading
import time
from collections import deque
from typing import Optional

from opentelemetry import metrics

from schemas.app_config import AppConfig, PidConfig
from schemas.temp_control import Parameters, PidVariables, ErrorStats, PidStatusOut
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
        sensor_channel: int,
        gpio_pin: int,
        max_heater_power_watts: float = 45.0,
        app_config: AppConfig | None = None,
    ):
        """Initialize temperature service for a specific channel."""
        self.channel_id = channel_id
        self.channel_name = channel_name
        self.sensor_channel = sensor_channel
        self.max_heater_power_watts = max_heater_power_watts

        pid_cfg = app_config.pid if app_config else PidConfig()
        self._pid_cfg = pid_cfg

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

        heater_mode = os.getenv("HEATER_MODE", "PSU")
        self.heater: HeaterRepository = create_heater(
            mode=heater_mode, gpio_pin=gpio_pin, app_config=app_config)

        self._running = False
        self._thread: threading.Thread | None = None

        self._error_timestamps: deque = deque()
        self._total_errors = 0
        self._last_error_message: Optional[str] = None
        self._current_temp: Optional[float] = None
        self._error_lock = threading.Lock()

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

    def get_pid_status(self) -> PidStatusOut:
        """Get comprehensive PID status including all internal variables."""
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

        return PidStatusOut(
            channel_id=self.channel_id,
            channel_name=self.channel_name,
            is_active=self._running,
            target=self._target,
            power=power,
            max_heater_power_watts=self.max_heater_power_watts,
            current_temp=self._current_temp,
            pid_parameters=pid_parameters,
            pid_variables=pid_variables,
            error_stats=error_stats
        )

    def start(self):
        """Start the temperature control loop in a background thread."""
        if self._running:
            return "Control loop already running."

        self._running = True
        self.heater.connect()

        self._thread = threading.Thread(target=self._control_loop, daemon=True)
        self._thread.start()
        return "Temperature control loop started."

    def stop(self):
        """Stop the temperature control loop and shut down heater."""
        if not self._running:
            return "Control loop is not running."

        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
        self.heater.set_power(0.0)
        self.heater.disconnect()
        return "Temperature control loop stopped and heater turned off."

    def _control_loop(self):
        """Internal method that runs in background to control temperature."""
        pid_cfg = self._pid_cfg
        output_range = pid_cfg.output_max - pid_cfg.output_min

        last_time = time.monotonic()
        while self._running:
            try:
                loop_start = time.monotonic()
                dt = loop_start - last_time
                if dt < pid_cfg.dt_min:
                    dt = pid_cfg.dt_min
                elif dt > pid_cfg.dt_max:
                    dt = pid_cfg.dt_max

                read_start = time.monotonic()
                current_temp = readingApi.get_monitor(
                    self.sensor_channel).kelvin - 273.15
                _thermo_api_read_duration.record(
                    (time.monotonic() - read_start) * 1000,
                    {"channel_id": self.channel_id},
                )
                self._current_temp = current_temp

                duty = self._pid.update(measurement=current_temp, dt=dt)
                power = max(0.0, min(1.0, (duty - pid_cfg.output_min) / output_range))
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
