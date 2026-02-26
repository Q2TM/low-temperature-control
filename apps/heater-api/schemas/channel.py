from __future__ import annotations

from pydantic import Field
from fastapi_camelcase import CamelModel
from schemas.temp_control import PidStatusOut


class ChannelConfig(CamelModel):
    """Channel configuration loaded from YAML file."""
    channel_id: int = Field(...,
                            description="Unique identifier for the channel")
    name: str = Field(..., description="Human-readable name")
    gpio_pin: int = Field(..., ge=0, le=40, description="GPIO BCM pin number")
    sensor_channel: int = Field(..., ge=1,
                                description="Lakeshore sensor channel")
    enabled: bool = Field(
        default=True, description="Whether channel is enabled")


class ChannelInfo(CamelModel):
    """Channel information with runtime status."""
    channel_id: int
    name: str
    gpio_pin: int
    sensor_channel: int
    enabled: bool
    is_active: bool = Field(
        default=False, description="Whether PID controller is currently active")


class ChannelListResponse(CamelModel):
    """List of all configured channels."""
    channels: list[ChannelInfo]


class AllChannelsStatus(CamelModel):
    """Status of all channels at once."""
    channels: list[PidStatusOut]
