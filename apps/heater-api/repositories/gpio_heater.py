from typing import Any

from repositories.gpio import RPiGPIORepository
from repositories.heater import HeaterRepository


class GPIOHeater(HeaterRepository):
    """HeaterRepository adapter that wraps RPiGPIORepository (PWM-based control)."""

    def __init__(self, gpio: Any, pin: int, frequency: float = 0.2, max_power_watts: float = 45.0):
        self._repo = RPiGPIORepository(gpio=gpio, pin=pin, frequency=frequency)
        self._max_power_watts = max_power_watts

    def connect(self) -> None:
        self._repo.setup_pwm()

    def set_power(self, power: float) -> None:
        self._repo.set_duty_cycle(power * 100.0)

    def get_power(self) -> float:
        return self._repo.get_duty_cycle() / 100.0

    def get_power_watts(self) -> float:
        return self.get_power() * self._max_power_watts

    def get_max_power_watts(self) -> float:
        return self._max_power_watts

    def disconnect(self) -> None:
        self._repo.cleanup()
