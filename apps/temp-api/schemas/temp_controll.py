from pydantic import BaseModel

class TargetTemp(BaseModel):
    """
    Schema for target temperature.

    Used by GET and PUT /temp/target-temp endpoints
    to retrieve or update target temperature.
    """
    target: float

class StatusOut(BaseModel):
    """
    Schema for temperature status.

    Used by GET /temp/status endpoints
    to retrieve or update temperature status.
    """
    current_temp: float
    target: float

class Parameters(BaseModel):
    """
    Schema for temperature parameters.
    
    Used by GET and PUT /temp/parameters endpoints
    to retrieve or update temperature parameters.
    """
    kp: float = 1.0
    ki: float = 0.0
    kd: float = 0.0