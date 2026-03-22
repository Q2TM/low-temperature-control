import os

from repositories.heater import HeaterRepository


def create_heater(mode: str, gpio_pin: int) -> HeaterRepository:
    """Create a HeaterRepository based on the given mode."""
    mode = mode.upper()

    if mode == "MOCK":
        from mocks.heater_mock import HeaterMock
        return HeaterMock(gpio_pin=gpio_pin)

    if mode == "GPIO":
        import RPi.GPIO as GPIO  # type: ignore[import-untyped]
        from repositories.gpio_heater import GPIOHeater
        return GPIOHeater(gpio=GPIO, pin=gpio_pin)

    if mode == "PSU":
        from repositories.psu_heater import PSUHeater
        return PSUHeater(port=_detect_serial_port())

    raise ValueError(
        f"Unknown HEATER_MODE: '{mode}'. Expected one of: MOCK, GPIO, PSU"
    )


def _detect_serial_port() -> str:
    env_port = os.getenv("PSU_SERIAL_PORT") or os.getenv("POWER_SUPPLY_SERIAL_PORT")
    if env_port:
        return env_port

    try:
        from serial.tools import list_ports
    except Exception as exc:
        raise RuntimeError(
            "serial.tools is not available. Install pyserial and/or set PSU_SERIAL_PORT. "
            f"Error: {type(exc).__name__}: {exc}"
        )

    ports = list(list_ports.comports())
    if not ports:
        raise RuntimeError(
            "No serial ports detected. Connect CP2102 device or set PSU_SERIAL_PORT env var."
        )

    for p in ports:
        desc = (p.description or "").upper()
        if "CP210" in desc or "USB-TO-UART" in desc or "USB SERIAL" in desc:
            return p.device

    return ports[0].device
