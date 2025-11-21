import threading
from typing import Optional


class PIDController:
    def __init__(self, kp: float, ki: float, kd: float, setpoint: float = 0.0):
        self.kp = float(kp)
        self.ki = float(ki)
        self.kd = float(kd)
        self.setpoint = float(setpoint)

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
            # derivative = 0.0 if self._last_measurement is None else (
            #     (error - self._last_error) / dt)
            
            # Using measurement derivative to avoid derivative kick
            derivative = 0.0 if self._last_measurement is None else -(measurement - self._last_measurement) / dt

            output = (
                (self.kp * error) +
                (self.ki * new_integral) +
                (self.kd * derivative)
            )

            self._last_error = error
            self._last_measurement = measurement

            # Anti-windup
            if 0.0 <= output <= 100.0:
                self._integral = new_integral
            else:
                output = max(0.0, min(100.0, output))
                self._integral = max(min(new_integral, 100.0), -100.0)

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
