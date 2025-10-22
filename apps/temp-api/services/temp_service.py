from mocks.gpio_mock import GPIORepositoryMock
from schemas.temp_controll import Parameters

class TempService:
    def __init__(self, gpio=None):
        self.gpio = gpio or GPIORepositoryMock()
        self._target = 30.0
        self._params = Parameters()

    def get_target(self):
        return self._target

    def set_target(self, value: float):
        self._target = value

    def get_status(self):
        current = self.gpio.read_temperature()
        heating = current < self._target
        return {
            "current_temp": current,
            "target": self._target,
            "heating": heating
        }

    def get_parameters(self):
        return self._params

    def set_parameters(self, params: Parameters):
        self._params = params
        return self._params

    def shutdown(self):
        self.gpio.cleanup()
