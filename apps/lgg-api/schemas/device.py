from pydantic import Field
from fastapi_camelcase import CamelModel


class IdentificationResp(CamelModel):
    """Schema for device identification information.

    Used by GET /identification endpoint to return device details.
    """

    manufacturer: str = Field(...)
    model: str = Field(...)
    serial_number: str = Field(...)
    firmware_version: str = Field(...)


class Brightness(CamelModel):
    """Schema for device display brightness configuration.

    Used by GET/PUT /brightness endpoints for brightness control.
    """

    brightness: int = Field(..., ge=0, le=100,
                            description="Brightness level between 0 and 100")


class StatusResp(CamelModel):
    """Schema for device channel status information.

    Used by GET /status/{channel} endpoint to return channel status flags.
    """

    invalid_reading: bool = Field(...)
    temp_under_range: bool = Field(...)
    temp_over_range: bool = Field(...)
    sensor_units_over_range: bool = Field(...)
    sensor_units_under_range: bool = Field(...)
