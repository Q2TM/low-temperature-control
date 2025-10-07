from lakeshore.model_240_enums import Model240Enums
from fastapi_camelcase import CamelModel


class MonitorResp(CamelModel):
    """Schema for temperature and sensor monitoring data.

    Used by GET /monitor/{channel} endpoint to return current readings.
    Currently returns kelvin temperature and raw sensor value.
    """

    kelvin: float
    sensor: float


class InputParameter(CamelModel):
    """Schema for input channel configuration parameters.

    Used by GET /input/{channel} endpoint to return channel settings.
    All fields reflect the current configuration of the temperature input channel.
    """

    sensor_name: str | None = None  # Optional sensor name, None if not configured
    sensor_type: Model240Enums.SensorTypes
    temperature_unit: Model240Enums.Units
    auto_range_enable: bool
    current_reversal_enable: bool
    input_enable: bool
    input_range: int
    filter: str | None = None  # Optional filter setting, None if not applicable
