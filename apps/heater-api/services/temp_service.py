import os
import threading
import time
from collections import deque
from typing import Optional

# serial import is for flow detection only; if module lacks tools we fallback to env var
import serial
# from mocks.gpio_mock import GPIORepositoryMock
# from repositories.gpio import GPIORepository, RPiGPIORepository
from schemas.temp_control import Parameters, StatusOut, PidVariables, ErrorStats, PidStatusOut
from .PID import PIDController
from repositories.psu import ProgrammablePowerSupplyRepository
from .lgg_client import readingApi


class TempService:
    def __init__(
        self,
        channel_id: int,
        channel_name: str,
        sensor_channel: int
    ):
        """Initialize temperature service for a specific channel."""
        self.channel_id = channel_id
        self.channel_name = channel_name
        self.sensor_channel = sensor_channel

        self._target = 30.0
        self._params = Parameters()

        self._pid = PIDController(
            kp=self._params.kp,
            ki=self._params.ki,
            kd=self._params.kd,
            setpoint=self._target,
        )

        self.psu = ProgrammablePowerSupplyRepository(
            port=self._detect_serial_port(),
        )

        self._running = False
        self._thread: threading.Thread | None = None

        # Error tracking
        self._error_timestamps: deque = deque()
        self._total_errors = 0
        self._last_error_message: Optional[str] = None
        self._current_temp: Optional[float] = None
        self._error_lock = threading.Lock()

    def _detect_serial_port(self) -> str:
        # Priority: explicit environment override
        env_port = os.getenv("PSU_SERIAL_PORT") or os.getenv("POWER_SUPPLY_SERIAL_PORT")
        if env_port:
            return env_port

        # Try PySerial list_ports if available
        try:
            from serial.tools import list_ports
        except Exception as exc:
            raise RuntimeError(
                "serial.tools is not available. Install pyserial and/or set PSU_SERIAL_PORT. "
                f"Error: {type(exc).__name__}: {exc}"
            )

        ports = list(list_ports.comports())
        if not ports:
            raise RuntimeError(
                "No serial ports detected. Connect CP2102 device or set PSU_SERIAL_PORT env var."
            )

        # Prefer CP2102/USB-UART on Raspberry Pi
        for p in ports:
            desc = (p.description or "").upper()
            if "CP210" in desc or "USB-TO-UART" in desc or "USB SERIAL" in desc:
                return p.device

        # Fallback to first detected port
        return ports[0].device

    def get_target(self):
        return self._target

    def set_target(self, value: float):
        self._target = value
        self._pid.set_setpoint(value)

    def get_status(self):
        current = self.psu.get_current()
        return StatusOut(target=self._target, current=current)  

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

            # Clean up old timestamps (older than 10 minutes)
            cutoff_time = current_time - 600  # 10 minutes
            while self._error_timestamps and self._error_timestamps[0] < cutoff_time:
                self._error_timestamps.popleft()

    def _get_error_stats(self) -> ErrorStats:
        """Get error statistics for different time periods."""
        with self._error_lock:
            current_time = time.time()

            # Count errors in last 1 minute
            one_min_ago = current_time - 60
            errors_1m = sum(
                1 for ts in self._error_timestamps if ts >= one_min_ago)

            # Count errors in last 10 minutes (all in deque)
            errors_10m = len(self._error_timestamps)

            return ErrorStats(
                errors_last_1m=errors_1m,
                errors_last_10m=errors_10m,
                errors_since_start=self._total_errors,
                last_error_message=self._last_error_message
            )

    def get_pid_status(self) -> PidStatusOut:
        """Get comprehensive PID status including all internal variables."""
        current = self.psu.get_current()

        # Get PID internal state
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
            current=current,
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
        self.psu.pc_connect()
        self.psu.power_on()
        self.psu.set_voltage(12.0)  # Set a default voltage, can be adjusted as needed
        self.psu.set_current(0.0)

        self._thread = threading.Thread(target=self._control_loop, daemon=True)
        self._thread.start()
        return "Temperature control loop started."

    def stop(self):
        """Stop the temperature control loop and set duty cycle to zero."""

        if not self._running:
            return "Control loop is not running."

        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
        self.psu.set_current(0.0)
        self.psu.set_voltage(0.0)
        self.psu.power_off()
        self.psu.pc_disconnect()
        return "Temperature control loop stopped and heater turned off."

    def _control_loop(self):
        """Internal method that runs in background to control temperature."""
        last_time = time.monotonic()
        loop_start = time.monotonic()
        while self._running:
            try:
                loop_start = time.monotonic()
                dt = loop_start - last_time
                if dt < 1.0:
                    dt = 1.0
                elif dt > 15.0:
                    dt = 15.0

                current_temp = readingApi.get_monitor(
                    self.sensor_channel).kelvin - 273.15
                self._current_temp = current_temp

                duty = self._pid.update(measurement=current_temp, dt=dt)
                current = round((duty / 100.0) * 5, 3)  # 0–100% → 0–5A with 3 decimal precision
                self.psu.set_current(current)

                print(
                    f"[{self.channel_id}] T={current_temp:.2f}°C | "
                    f"Target={self._target:.1f}°C | Current={current:.2f}A"
                )
            except Exception as e:
                error_msg = f"Error in PID control loop: {type(e).__name__}: {str(e)}"
                print(f"[{self.channel_id}] {error_msg}")
                self._record_error(error_msg)
                try:
                    self.psu.set_current(0.0)  # HARD STOP
                except Exception:
                    pass
                # Continue running despite errors

            last_time = loop_start
            time.sleep(5)

    def cleanup(self):
        self.psu.cleanup()
