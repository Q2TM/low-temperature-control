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


class SetCurveDataPointsRequest(CamelModel):
    """Schema for setting multiple curve data points at once.

    Accepts a list of data points (1 to 200). The existing curve is deleted first,
    then the supplied points are written starting at index 1. Any remaining slots
    (up to 200) are left at the device default of (0, 0).
    """

    data_points: list[CurveDataPoint] = Field(
        ...,
        min_length=1,
        max_length=200,
        description="List of curve data points to set (1 to 200). "
                    "Points are written starting at index 1 in the order provided."
    )


IndexQueryParam = Path(
    ..., ge=1, le=200, description="Index of the data point in the curve")
