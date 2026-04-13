from datetime import datetime
from typing import Optional

from pydantic import Field
from fastapi_camelcase import CamelModel


class TargetTemp(CamelModel):
    """
    Schema for target temperature.

    Used by GET and PUT /temp/target-temp endpoints
    to retrieve or update target temperature.
    """
    target: float


class ManualPower(CamelModel):
    """
    Schema for manual power control.

    Power is a normalized value between 0.0 and 1.0.
    """
    power: float


class StatusOut(CamelModel):
    """
    Schema for temperature status.

    Used by GET /temp/status endpoints
    to retrieve or update temperature status.
    """
    target: float
    power: float


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


class HeaterStatus(CamelModel):
    """
    Real-time heater output state.

    Reports the current power level and heater-type-specific metadata.
    """
    power: float = Field(
        description="Requested heater output level as a fraction (0.0 to 1.0). "
                    "Reflects the value set by PID or manual control.")
    power_watts: float = Field(
        description="Actual heater power in watts. "
                    "For PSU heaters this is measured via voltage × current; "
                    "for GPIO/Mock heaters it is calculated from the configured max power.")
    heater_type: str = Field(
        description="Heater type identifier: 'gpio', 'psu', or 'mock'.")
    heater_metadata: dict = Field(
        default={},
        description="Heater-type-specific metadata. "
                    "PSU: measured_voltage, measured_current, max_voltage, max_current, max_wattage. "
                    "GPIO/Mock: empty.")


class PidStatus(CamelModel):
    """
    PID controller state.

    Contains whether the PID loop is running, its target, tuning parameters,
    internal variables, timing information, and error statistics.
    """
    is_active: bool = Field(
        description="Whether the PID control loop is currently running.")
    target: float = Field(
        description="Target temperature in °C that the PID is tracking.")
    started_at: Optional[datetime] = Field(
        default=None,
        description="UTC timestamp when the PID loop was started. "
                    "Null if PID has never been started or was stopped.")
    running_for_seconds: Optional[float] = Field(
        default=None,
        description="Elapsed seconds since the PID loop was started. "
                    "Null when PID is not active.")
    parameters: Parameters = Field(
        description="Current PID tuning coefficients (Kp, Ki, Kd).")
    variables: PidVariables = Field(
        description="Internal PID state: integral accumulator, last error, "
                    "and last temperature measurement.")
    error_stats: ErrorStats = Field(
        description="Error counters for thermometer API read failures "
                    "over 1 min, 10 min, and since PID start.")


class ChannelStatusOut(CamelModel):
    """
    Comprehensive real-time status for a single heater channel.

    Combines channel identity, the current temperature reading,
    heater output state, and PID controller state into one response.
    """
    channel_id: int = Field(
        description="Unique channel identifier from configuration.")
    channel_name: str = Field(
        description="Human-readable channel name.")
    current_temp: Optional[float] = Field(
        default=None,
        description="Latest temperature reading in °C from the associated "
                    "Lakeshore thermometer channel. Null if no reading yet.")
    heater: HeaterStatus = Field(
        description="Real-time heater output state including power level, "
                    "measured watts, and type-specific metadata.")
    pid: PidStatus = Field(
        description="PID controller state including target, parameters, "
                    "internal variables, timing, and error statistics.")
