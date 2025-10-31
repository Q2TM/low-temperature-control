from abc import ABC, abstractmethod


class GPIORepository(ABC):
    """Repository for controlling a GPIO port as PWM output
    """

    @abstractmethod
    def setup_pwm(self, pin: int, frequency: float) -> None:
        """Setup a GPIO pin for PWM output

        Args:
            pin (int): GPIO pin number
            frequency (float): PWM frequency in Hz
        """
        pass

    @abstractmethod
    def set_duty_cycle(self, pin: int, duty_cycle: float) -> None:
        """Set the duty cycle for a PWM pin

        Args:
            pin (int): GPIO pin number
            duty_cycle (float): Duty cycle percentage (0.0 to 100.0)
        """
        pass

    @abstractmethod
    def get_duty_cycle(self, pin: int) -> float:
        """Get the current duty cycle for a PWM pin

        Args:
            pin (int): GPIO pin number
        Returns:
            float: Current duty cycle percentage
        """
        pass
