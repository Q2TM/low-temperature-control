from repositories.heater import HeaterRepository
from services.simulator_client import simulator_api
from simulator_client import SetHeaterOutputRequest


class HeaterMock(HeaterRepository):
    """Mock heater that delegates to the simulator API. Based on the GPIO mock pattern."""

    def __init__(self, gpio_pin: int):
        self._pin = gpio_pin
        self._power = 0.0

    def connect(self) -> None:
        print(f"[MockHeater] Connected on pin={self._pin}")

    def set_power(self, power: float) -> None:
        self._power = max(0.0, min(1.0, power))
        simulator_api.set_heater_output(
            self._pin, SetHeaterOutputRequest(value=self._power))
        print(f"[MockHeater] Set power to {self._power:.3f} on pin={self._pin}")

    def get_power(self) -> float:
        return self._power

    def disconnect(self) -> None:
        self.set_power(0.0)
        print(f"[MockHeater] Disconnected on pin={self._pin}")
