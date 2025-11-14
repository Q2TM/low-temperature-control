from fastapi_camelcase import CamelModel
from typing import Optional


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


class PidVariables(CamelModel):
    """
    Schema for PID internal variables.

    Contains the interval variables used in PID calculations.
    """
    integral: float
    last_error: float
    last_measurement: Optional[float]


class ErrorStats(CamelModel):
    """
    Schema for error statistics.

    Tracks API call errors over different time periods.
    """
    errors_last_1m: int
    errors_last_10m: int
    errors_since_start: int
    last_error_message: Optional[str]


class ConfigAll(CamelModel):
    """
    Schema for all configuration data.

    Contains target temperature and PID parameters.
    """
    target_temp: float
    pid_parameters: Parameters


class PidStatusOut(CamelModel):
    """
    Schema for PID status output.

    Contains comprehensive information about PID controller state.
    """
    is_active: bool
    target: float
    duty_cycle: float
    current_temp: Optional[float]
    pid_parameters: Parameters
    pid_variables: PidVariables
    error_stats: ErrorStats
