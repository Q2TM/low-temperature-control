from abc import ABC, abstractmethod
from typing import Dict, Any


class HeaterRepository(ABC):
    """
    Hardware-agnostic heater interface.

    'Power' is a normalized value 0.0–1.0 representing heater output level,
    regardless of the underlying mechanism (duty cycle for GPIO, current for PSU).
    """

    @abstractmethod
    def connect(self) -> None:
        """Initialize hardware and prepare for operation."""
        ...

    @abstractmethod
    def set_power(self, power: float) -> None:
        """Set heater output power (0.0 to 1.0)."""
        ...

    @abstractmethod
    def get_power(self) -> float:
        """Get current heater output power (0.0 to 1.0)."""
        ...

    @abstractmethod
    def get_power_watts(self) -> float:
        """Get current heater output power in watts."""
        ...

    @abstractmethod
    def get_max_power_watts(self) -> float:
        """Get maximum heater power in watts."""
        ...

    def get_metadata(self) -> Dict[str, Any]:
        """Get heater-type-specific metadata (e.g. voltage/current for PSU). Empty by default."""
        return {}

    @abstractmethod
    def disconnect(self) -> None:
        """Shut down heater and release hardware resources."""
        ...
