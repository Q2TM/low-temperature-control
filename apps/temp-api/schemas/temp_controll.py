from pydantic import BaseModel

class TargetTempIn(BaseModel):
    target: float

class TargetTempOut(BaseModel):
    target: float

class StatusOut(BaseModel):
    current_temp: float
    target: float
    heating: bool

class Parameters(BaseModel):
    kp: float = 1.0
    ki: float = 0.0
    kd: float = 0.0