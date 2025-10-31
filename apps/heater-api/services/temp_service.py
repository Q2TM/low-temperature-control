from mocks.gpio_mock import GPIORepositoryMock
from repositories.gpio import GPIORepository
from schemas.temp_control import Parameters, StatusOut


class TempService:
    def __init__(self):
        self.gpio: GPIORepository = GPIORepositoryMock()
        self.gpio.setup_pwm(pin=18, frequency=0.2)

        self._target = 30.0
        self._params = Parameters()
        self.pin = 18

    def get_target(self):
        return self._target

    def set_target(self, value: float):
        self._target = value

    def get_status(self):
        duty_cycle = self.gpio.get_duty_cycle(pin=self.pin)
        return StatusOut(target=self._target, duty_cycle=duty_cycle)

    def get_parameters(self):
        return self._params

    def set_parameters(self, params: Parameters):
        self._params = params
        return self._params

    def stop(self):
        self.gpio.set_duty_cycle(pin=self.pin, duty_cycle=0.0)

    def start(self):
        raise NotImplementedError("Start method not implemented yet")
