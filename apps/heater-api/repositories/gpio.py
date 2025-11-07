from abc import ABC, abstractmethod
import threading
from typing import Any, Optional


class GPIORepository(ABC):
    @abstractmethod
    def setup_pwm(self) -> None: ...
    @abstractmethod
    def set_duty_cycle(self, duty_cycle: float) -> None: ...
    @abstractmethod
    def get_duty_cycle(self) -> float: ...
    @abstractmethod
    def cleanup(self) -> None: ...


class RPiGPIORepository(GPIORepository):
    def __init__(self, gpio: Any, pin: int, frequency: float, duty_cycle: float = 0.0) -> None:
        self._lock: threading.Lock = threading.Lock()
        self.gpio = gpio
        self.pin: int = int(pin)
        self.frequency: float = float(frequency)
        self.duty_cycle: float = float(duty_cycle)
        self.pwm: Optional[Any] = None

        required_attrs = ("setmode", "BCM", "setup", "OUT", "PWM", "cleanup")
        missing = [
            attr for attr in required_attrs if not hasattr(self.gpio, attr)]
        if missing:
            raise RuntimeError(
                f"gpio object missing attributes: {', '.join(missing)}, gpio interface must have these methods and properties to function properly")

        # Configure and start PWM
        self.gpio.setmode(self.gpio.BCM)
        self.gpio.setup(self.pin, self.gpio.OUT)

    def setup_pwm(self) -> None:
        with self._lock:
            if self.pwm is not None:
                try:
                    self.pwm.stop()
                except Exception:
                    raise RuntimeError(
                        "Failed to stop existing PWM instance, could not reinitialize PWM")
            self.pwm = self.gpio.PWM(self.pin, self.frequency)
            self.pwm.start(self.duty_cycle)

    def set_duty_cycle(self, duty_cycle: float) -> None:
        dc = max(0.0, min(100.0, float(duty_cycle)))
        with self._lock:
            self.duty_cycle = dc
            if self.pwm is not None:
                # Due to Hardware using pull-up configuration
                dc = 100 - dc
                self.pwm.ChangeDutyCycle(dc)

    def get_duty_cycle(self) -> float:
        with self._lock:
            return self.duty_cycle

    def cleanup(self) -> None:
        with self._lock:
            if self.pwm is not None:
                try:
                    self.pwm.stop()
                except Exception:
                    raise RuntimeError(
                        "Failed to stop PWM instance during cleanup")
            try:
                self.gpio.cleanup(self.pin)
            except Exception:
                raise RuntimeError(
                    "Failed to cleanup GPIO pin during cleanup")
