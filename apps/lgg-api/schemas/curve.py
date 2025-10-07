from fastapi import Path
from lakeshore.model_240_enums import Model240Enums
from pydantic import Field
from fastapi_camelcase import CamelModel


class CurveHeader(CamelModel):
    """Schema for curve header information containing metadata about a temperature sensor curve.

    Used by GET /curve/{channel}/header endpoint to return curve configuration.
    """

    curve_name: str
    serial_number: str
    curve_data_format: Model240Enums.CurveFormat
    temperature_limit: float
    coefficient: Model240Enums.Coefficients


class CurveDataPoint(CamelModel):
    """Schema for a single curve data point containing temperature and sensor value pair.

    Used by GET /curve/{channel}/data-point/{index} endpoint.
    """

    temperature: float
    sensor: float


class CurveDataPoints(CamelModel):
    """Schema for multiple curve data points containing arrays of temperature and sensor values.

    Used by GET /curve/{channel}/data-points endpoint to return all curve data.
    """

    channel: int
    temperatures: list[float] = Field(
        ...,
        description="List of temperature values")
    sensors: list[float] = Field(..., description="List of sensor values")


IndexQueryParam = Path(
    ..., ge=1, le=200, description="Index of the data point in the curve")
