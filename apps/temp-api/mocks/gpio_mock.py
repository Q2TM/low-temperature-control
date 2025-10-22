import random

class GPIORepository:
    """Interface for GPIO operations"""
    def read_temperature(self) -> float:
        raise NotImplementedError

    def set_heater(self, on: bool) -> None:
        raise NotImplementedError

    def cleanup(self) -> None:
        raise NotImplementedError


class GPIORepositoryMock(GPIORepository):
    """Mock implementation"""
    def __init__(self):
        self._temp = 25.0
        self._heater = False

    def read_temperature(self) -> float:
        # simple temp simulation
        self._temp += (0.1 if self._heater else -0.05) + (random.random() - 0.5) * 0.02
        return round(self._temp, 2)

    def set_heater(self, on: bool) -> None:
        self._heater = bool(on)

    def cleanup(self) -> None:
        self._heater = False
