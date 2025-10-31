from repositories.gpio import GPIORepository


class GPIORepositoryMock(GPIORepository):
    """Mock implementation of GPIORepository for testing and development

    This mock maintains an in-memory state of GPIO pins and their configurations.
    """

    def __init__(self):
        """Initialize the mock with empty pin states"""
        self._pin_configs = {
            # Store pin configurations: {pin: {'frequency': float, 'duty_cycle': float}}
        }

    def setup_pwm(self, pin: int, frequency: float) -> None:
        """Setup a GPIO pin for PWM output

        Args:
            pin (int): GPIO pin number
            frequency (float): PWM frequency in Hz
        """
        if pin < 0:
            raise ValueError("Pin number must be non-negative")
        if frequency <= 0:
            raise ValueError("Frequency must be positive")

        self._pin_configs[pin] = {
            'frequency': frequency,
            'duty_cycle': 0.0  # Initialize with 0% duty cycle
        }
        print(f"Mock: Setup PWM on pin {pin} with frequency {frequency} Hz")

    def set_duty_cycle(self, pin: int, duty_cycle: float) -> None:
        """Set the duty cycle for a PWM pin

        Args:
            pin (int): GPIO pin number
            duty_cycle (float): Duty cycle percentage (0.0 to 100.0)
        """
        if pin not in self._pin_configs:
            raise ValueError(f"Pin {pin} has not been setup for PWM")
        if not 0.0 <= duty_cycle <= 100.0:
            raise ValueError("Duty cycle must be between 0.0 and 100.0")

        self._pin_configs[pin]['duty_cycle'] = duty_cycle
        print(f"Mock: Set duty cycle on pin {pin} to {duty_cycle}%")

    def get_duty_cycle(self, pin: int) -> float:
        """Get the current duty cycle for a PWM pin

        Args:
            pin (int): GPIO pin number
        Returns:
            float: Current duty cycle percentage
        """
        if pin not in self._pin_configs:
            raise ValueError(f"Pin {pin} has not been setup for PWM")

        duty_cycle = self._pin_configs[pin]['duty_cycle']
        print(f"Mock: Retrieved duty cycle for pin {pin}: {duty_cycle}%")
        return duty_cycle

    def get_pin_config(self, pin: int) -> dict:
        """Helper method to get the full configuration of a pin (for testing)

        Args:
            pin (int): GPIO pin number
        Returns:
            dict: Pin configuration containing frequency and duty_cycle
        """
        if pin not in self._pin_configs:
            raise ValueError(f"Pin {pin} has not been setup for PWM")
        return self._pin_configs[pin].copy()

    def reset_all_pins(self) -> None:
        """Helper method to reset all pin configurations (for testing)"""
        self._pin_configs.clear()
        print("Mock: All pins reset")
