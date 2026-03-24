from repositories.heater import HeaterRepository
from repositories.psu import ProgrammablePowerSupplyRepository


MAX_CURRENT = 5.0


class PSUHeater(HeaterRepository):
    """HeaterRepository adapter that wraps ProgrammablePowerSupplyRepository (serial PSU)."""

    def __init__(self, port: str, voltage: float = 12.0):
        self._psu = ProgrammablePowerSupplyRepository(port=port)
        self._voltage = voltage
        self._power = 0.0

    def connect(self) -> None:
        self._psu.pc_connect()
        self._psu.power_on()
        self._psu.set_voltage(self._voltage)
        self._psu.set_current(0.0)

    def set_power(self, power: float) -> None:
        self._power = max(0.0, min(1.0, power))
        current = round(self._power * MAX_CURRENT, 3)
        self._psu.set_current(current)

    def get_power(self) -> float:
        return self._power

    def disconnect(self) -> None:
        self._power = 0.0
        self._psu.set_current(0.0)
        self._psu.set_voltage(0.0)
        self._psu.power_off()
        self._psu.pc_disconnect()
