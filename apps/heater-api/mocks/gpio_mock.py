from repositories.gpio import GPIORepository


class GPIORepositoryMock(GPIORepository):
    """Mock version for testing, no hardware interaction."""

    def __init__(self, gpio=None, pin: int = 0, frequency: float = 0.2, duty_cycle: float = 0.0) -> None:
        self.gpio = gpio
        self.pin = pin
        self.frequency = frequency
        self.duty_cycle = duty_cycle
        self.pwm = None

    def setup_pwm(self) -> None:
        self.pwm = True
        print(f"[Mock] Setup PWM at pin={self.pin}, freq={self.frequency}Hz")

    def set_duty_cycle(self, duty_cycle: float) -> None:
        if self.pwm is None:
            raise RuntimeError("PWM not set up. Call setup_pwm() first.")
        self.duty_cycle = max(0.0, min(100.0, duty_cycle))
        print(f"[Mock] Set duty cycle to {self.duty_cycle}% on pin={self.pin}")

    def get_duty_cycle(self) -> float:
        if self.pwm is None:
            raise RuntimeError("PWM not set up. Call setup_pwm() first.")
        return self.duty_cycle

    def cleanup(self) -> None:
        print(f"[Mock] Cleanup pin {self.pin}")
        self.pwm = None
