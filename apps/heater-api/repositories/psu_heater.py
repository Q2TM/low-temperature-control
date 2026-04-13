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
        self.max_voltage = max_voltage
        self.max_wattage = max_wattage
        self._max_current = round(self.max_wattage / self.max_voltage, 3)
        self._power = 0.0

    def connect(self) -> None:
        self._psu.pc_connect()
        self._psu.power_on()
        self._psu.set_voltage(0.0)
        self._psu.set_current(self._max_current)

    def set_power(self, duty: float) -> None:
        capped_duty = max(0.0, min(1.0, duty))
        self._power = self.max_wattage * capped_duty
        voltage = self.max_voltage * sqrt(capped_duty)
        self._psu.set_voltage(round(voltage, 3))

    def get_power(self) -> float:
        return self._power

    def disconnect(self) -> None:
        self._power = 0.0
        self._psu.set_current(0.0)
        self._psu.set_voltage(0.0)
        self._psu.power_off()
        self._psu.pc_disconnect()
