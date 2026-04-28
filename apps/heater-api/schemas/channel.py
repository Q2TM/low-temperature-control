from __future__ import annotations

from typing import Annotated, Literal, Optional, Union

from pydantic import Field
from fastapi_camelcase import CamelModel
from schemas.temp_control import ChannelStatusOut


# ── Per-channel heater configuration (discriminated union) ──────────────


class GpioHeaterConfig(CamelModel):
    """Configuration for a GPIO PWM-controlled heater."""
    type: Literal["gpio"]
    gpio_pin: int = Field(..., ge=0, le=40, description="GPIO BCM pin number")
    frequency: float = Field(
        default=0.2, gt=0, description="PWM frequency in Hz")
    max_power_watts: float = Field(
        default=45.0, gt=0,
        description="Maximum heater power in watts (hardcoded; GPIO cannot read real power)")


class PsuHeaterConfig(CamelModel):
    """Configuration for a programmable power supply heater."""
    type: Literal["psu"]
    serial_port: Optional[str] = Field(
        default=None,
        description="Serial port path (e.g. /dev/ttyUSB0). Auto-detected if omitted.")
    baudrate: int = Field(
        default=9600, gt=0, description="Serial baud rate for PSU communication")
    max_voltage: float = Field(
        default=12.0, gt=0, description="Maximum PSU output voltage in volts")
    max_wattage: float = Field(
        default=25.0, gt=0,
        description="Maximum PSU output wattage in watts")


class MockHeaterConfig(CamelModel):
    """Configuration for a mock/simulated heater."""
    type: Literal["mock"]
    max_power_watts: float = Field(
        default=45.0, gt=0, description="Simulated maximum heater power in watts")


HeaterConfig = Annotated[
    Union[GpioHeaterConfig, PsuHeaterConfig, MockHeaterConfig],
    Field(discriminator="type"),
]


# ── Channel configuration ───────────────────────────────────────────────


class ChannelConfig(CamelModel):
    """Channel configuration loaded from YAML file."""
    channel_id: int = Field(...,
                            description="Unique identifier for the channel")
    name: str = Field(..., description="Human-readable name")
    thermo_channel: int = Field(..., ge=1,
                                description="Lakeshore thermometer channel number")
    enabled: bool = Field(
        default=True, description="Whether channel is enabled")
    heater: HeaterConfig = Field(...,
                                 description="Heater hardware configuration")
    max_temp_celsius: Optional[float] = Field(
        default=None,
        description="Per-channel override of pid.max_temp_celsius safety ceiling. "
                    "Falls back to the global default when omitted.")


class ChannelInfo(CamelModel):
    """Channel information with runtime status."""
    channel_id: int
    name: str
    thermo_channel: int
    heater_type: str = Field(
        description="Heater type: gpio, psu, or mock")
    enabled: bool
    max_power_watts: float = Field(
        description="Maximum heater power in watts")
    is_active: bool = Field(
        default=False, description="Whether PID controller is currently active")


class ChannelListResponse(CamelModel):
    """List of all configured channels."""
    channels: list[ChannelInfo]


class AllChannelsStatus(CamelModel):
    """Status of all channels at once."""
    channels: list[ChannelStatusOut]
