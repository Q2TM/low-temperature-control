from __future__ import annotations

import os
from typing import TYPE_CHECKING

from repositories.heater import HeaterRepository

if TYPE_CHECKING:
    from schemas.channel import HeaterConfig


def create_heater(config: HeaterConfig, channel_id: int) -> HeaterRepository:
    """Create a HeaterRepository from a per-channel heater config."""
    from schemas.channel import GpioHeaterConfig, PsuHeaterConfig, MockHeaterConfig

    if isinstance(config, MockHeaterConfig):
        from mocks.heater_mock import HeaterMock
        return HeaterMock(
            channel_id=channel_id,
            max_power_watts=config.max_power_watts,
        )

    if isinstance(config, GpioHeaterConfig):
        import RPi.GPIO as GPIO  # type: ignore[import-untyped]
        from repositories.gpio_heater import GPIOHeater
        return GPIOHeater(
            gpio=GPIO,
            pin=config.gpio_pin,
            frequency=config.frequency,
            max_power_watts=config.max_power_watts,
        )

    if isinstance(config, PsuHeaterConfig):
        from repositories.psu_heater import PSUHeater
        port = config.serial_port or _detect_serial_port()
        return PSUHeater(
            port=port,
            max_voltage=config.max_voltage,
            max_wattage=config.max_wattage,
            baudrate=config.baudrate,
        )

    raise ValueError(f"Unknown heater config type: {type(config)}")


def _detect_serial_port() -> str:
    """Auto-detect a serial port for PSU communication."""
    try:
        from serial.tools import list_ports
    except Exception as exc:
        raise RuntimeError(
            "serial.tools is not available. Install pyserial or set serial_port in config. "
            f"Error: {type(exc).__name__}: {exc}"
        )

    ports = list(list_ports.comports())
    if not ports:
        raise RuntimeError(
            "No serial ports detected. Connect CP2102 device or set serial_port in config."
        )

    for p in ports:
        desc = (p.description or "").upper()
        if "CP210" in desc or "USB-TO-UART" in desc or "USB SERIAL" in desc:
            return p.device

    return ports[0].device
