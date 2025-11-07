import threading
import time
from mocks.gpio_mock import GPIORepositoryMock
from repositories.gpio import GPIORepository
from schemas.temp_control import Parameters, StatusOut
from PID import PIDController
from lgg_client import ReadingApi, ApiClient, Configuration

config = Configuration(host="http://localhost:8000")
api_client = ApiClient(config)

readingApi = ReadingApi(api_client=api_client)


class TempService:
    def __init__(self):
        self._target = 30.0
        self._params = Parameters()
        self.pin = 18

        self._pid = PIDController(
            kp=self._params.kp,
            ki=self._params.ki,
            kd=self._params.kd,
            setpoint=self._target,
        )

        # Mock GPIO for development
        self.gpio: GPIORepository = GPIORepositoryMock()
        self.gpio.setup_pwm()

        # Real GPIO
        # import RPi.GPIO as GPIO
        # self.gpio: GPIORepository = GPIORepository(GPIO, pin=self.pin, frequency=0.2, duty_cycle=0.0)
        # self.gpio.setup_pwm()

        self._running = False
        self._thread: threading.Thread | None = None

    def get_target(self):
        return self._target

    def set_target(self, value: float):
        self._target = value
        self._pid.set_setpoint(value)

    def get_status(self):
        duty_cycle = self.gpio.get_duty_cycle()
        return StatusOut(target=self._target, duty_cycle=duty_cycle)

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

    def start(self):
        """Start the temperature control loop in a background thread."""
        if self._running:
            print("Control loop already running.")
            return

        self._running = True
        self._thread = threading.Thread(target=self._control_loop, daemon=True)
        self._thread.start()
        print("Temperature control loop started.")

    def stop(self):
        """Stop the temperature control loop and set duty cycle to zero."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2.0)
        self.gpio.set_duty_cycle(duty_cycle=0.0)
        print("Temperature control loop stopped and heater turned off.")

    def _control_loop(self):
        """Internal method that runs in background to control temperature."""
        while self._running:
            current_temp = readingApi.get_monitoring(1).kelvin - 273.15
            duty = self._pid.update(current_temp)
            self.gpio.set_duty_cycle(duty_cycle=duty)

            print(
                f"T={current_temp:.2f}°C | Target={self._target:.1f}°C | Duty={duty:.1f}%")

            time.sleep(5)

    def cleanup(self):
        self.gpio.cleanup()
