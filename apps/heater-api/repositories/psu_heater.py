from typing import Any, Dict

from numpy import sqrt

from repositories.heater import HeaterRepository
from repositories.psu import ProgrammablePowerSupplyRepository


class PSUHeater(HeaterRepository):
    """HeaterRepository adapter that wraps ProgrammablePowerSupplyRepository (serial PSU)."""

    def __init__(
        self,
        port: str,
        max_voltage: float = 12.0,
        max_wattage: float = 25.0,
        baudrate: int = 9600,
    ):
        self._psu = ProgrammablePowerSupplyRepository(
            port=port, baudrate=baudrate)
        self._max_voltage = max_voltage
        self._max_wattage = max_wattage
        self._max_current = round(max_wattage / max_voltage, 3)
        self._power = 0.0  # normalized 0.0–1.0

    def connect(self) -> None:
        self._psu.pc_connect()
        self._psu.power_on()
        self._psu.set_voltage(0.0)
        self._psu.set_current(self._max_current)

    def set_power(self, power: float) -> None:
        self._power = max(0.0, min(1.0, power))
        voltage = self._max_voltage * sqrt(self._power)
        self._psu.set_voltage(round(voltage, 3))

        # PSU correct, wrong formula
        # voltage = self._max_voltage * self._power
        # self._psu.set_voltage(round(voltage, 3))

        # Wrong both (Old)
        # current = self._max_wattage / self._max_voltage * self._power
        # self._psu.set_voltage(round(12, 3))
        # self._psu.set_current(round(current, 3))

    def get_power(self) -> float:
        return self._power

    def get_power_watts(self) -> float:
        try:
            v = self._psu.read_voltage()
            i = self._psu.read_current()
            return round(v * i, 3)
        except Exception:
            return self._max_wattage * self._power

    def get_max_power_watts(self) -> float:
        return self._max_wattage

    def get_metadata(self) -> Dict[str, Any]:
        measured_voltage = None
        measured_current = None
        try:
            measured_voltage = self._psu.read_voltage()
            measured_current = self._psu.read_current()
        except Exception:
            pass
        return {
            "measured_voltage": measured_voltage,
            "measured_current": measured_current,
            "max_voltage": self._max_voltage,
            "max_current": self._max_current,
            "max_wattage": self._max_wattage,
        }

    def disconnect(self) -> None:
        self._power = 0.0
        self._psu.set_current(0.0)
        self._psu.set_voltage(0.0)
        self._psu.power_off()
        self._psu.pc_disconnect()
