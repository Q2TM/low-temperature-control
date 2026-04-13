from repositories.heater import HeaterRepository
from services.simulator_client import simulator_api
from simulator_client import SetHeaterOutputRequest


class HeaterMock(HeaterRepository):
    """Mock heater that delegates to the simulator API."""

    def __init__(self, channel_id: int, max_power_watts: float = 45.0):
        self._channel_id = channel_id
        self._max_power_watts = max_power_watts
        self._power = 0.0

    def connect(self) -> None:
        print(f"[MockHeater] Connected channel_id={self._channel_id}")

    def set_power(self, power: float) -> None:
        self._power = max(0.0, min(1.0, power))
        simulator_api.set_heater_output(
            self._channel_id, SetHeaterOutputRequest(value=self._power))
        print(
            f"[MockHeater] Set power to {self._power:.3f} on channel_id={self._channel_id}")

    def get_power(self) -> float:
        return self._power

    def get_power_watts(self) -> float:
        return self._power * self._max_power_watts

    def get_max_power_watts(self) -> float:
        return self._max_power_watts

    def disconnect(self) -> None:
        self.set_power(0.0)
        print(f"[MockHeater] Disconnected channel_id={self._channel_id}")
