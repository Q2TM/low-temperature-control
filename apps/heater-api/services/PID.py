import threading
from typing import Optional


class PIDController:
    def __init__(
        self,
        kp: float,
        ki: float,
        kd: float,
        setpoint: float = 0.0,
        output_min: float = 0.0,
        output_max: float = 100.0,
        anti_windup_min: float = -150.0,
        anti_windup_max: float = 150.0,
    ):
        self.kp = float(kp)
        self.ki = float(ki)
        self.kd = float(kd)
        self.setpoint = float(setpoint)

        self._output_min = output_min
        self._output_max = output_max
        self._anti_windup_min = anti_windup_min
        self._anti_windup_max = anti_windup_max

        self._integral = 0.0
        self._last_error = 0.0
        self._last_measurement: Optional[float] = None
        self._lock = threading.Lock()

    # ----------------------
    # PID Logic
    # ----------------------
    def update(self, measurement: float, dt: float) -> float:
        with self._lock:
            error = self.setpoint - measurement
            new_integral = self._integral + error * dt

            # Using measurement derivative to avoid derivative kick
            derivative = 0.0 if self._last_measurement is None else - \
                (measurement - self._last_measurement) / dt

            output = (
                (self.kp * error) +
                (self.ki * new_integral) +
                (self.kd * derivative)
            )

            self._last_error = error
            self._last_measurement = measurement

            if self._output_min <= output <= self._output_max:
                self._integral = new_integral
            else:
                output = max(self._output_min, min(self._output_max, output))
                self._integral = max(
                    min(new_integral, self._anti_windup_max), self._anti_windup_min)

            return output

    # ----------------------
    # Tuning and Setpoint
    # ----------------------
    def set_coefficients(self, kp: float, ki: float, kd: float):
        with self._lock:
            self.kp = float(kp)
            self.ki = float(ki)
            self.kd = float(kd)

    def set_setpoint(self, new_setpoint: float):
        with self._lock:
            self.setpoint = float(new_setpoint)
            self._integral = 0.0
            self._last_error = 0.0

    def reset(self, setpoint: float):
        with self._lock:
            self.setpoint = float(setpoint)
            self._integral = 0.0
            self._last_error = 0.0
            self._last_measurement = None

    # ----------------------
    # Utility
    # ----------------------
    def get_state(self):
        with self._lock:
            return {
                "Kp": self.kp,
                "Ki": self.ki,
                "Kd": self.kd,
                "setpoint": self.setpoint,
                "integral": self._integral,
                "last_error": self._last_error,
            }
