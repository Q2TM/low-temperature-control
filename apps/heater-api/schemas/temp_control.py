from fastapi_camelcase import CamelModel


class TargetTemp(CamelModel):
    """
    Schema for target temperature.

    Used by GET and PUT /temp/target-temp endpoints
    to retrieve or update target temperature.
    """
    target: float


class StatusOut(CamelModel):
    """
    Schema for temperature status.

    Used by GET /temp/status endpoints
    to retrieve or update temperature status.
    """
    target: float
    duty_cycle: float


class Parameters(CamelModel):
    """
    Schema for temperature parameters.

    Used by GET and PUT /temp/parameters endpoints
    to retrieve or update temperature parameters.
    """
    kp: float = 1.0
    ki: float = 0.0
    kd: float = 0.0
