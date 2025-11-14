from fastapi import APIRouter, Depends
from services.temp_service import TempService
from schemas.temp_control import PidStatusOut
from .dependencies import get_temp_service


router = APIRouter(prefix="/pid", tags=["PID"])


@router.post("/start", response_model=str, operation_id="startPID")
def start_pid(
    service: TempService = Depends(get_temp_service)
):
    """Start the PID controller."""
    return service.start()


@router.post("/stop", response_model=str, operation_id="stopPID")
def stop_pid(
    service: TempService = Depends(get_temp_service)
):
    """Stop the PID controller."""
    return service.stop()


@router.get("/status", response_model=PidStatusOut, operation_id="getPidStatus")
def get_pid_status(
    service: TempService = Depends(get_temp_service)
) -> PidStatusOut:
    """
    Get comprehensive PID status.

    Returns:
    - is_active: Whether PID controller is currently running
    - target: Target temperature
    - duty_cycle: Current PWM duty cycle
    - current_temp: Current temperature reading
    - pid_parameters: Current PID coefficients (Kp, Ki, Kd)
    - pid_variables: Internal PID variables (integral, last_error, last_measurement)
    - error_stats: Error statistics including counts for last 1m, 10m, and since start
    """
    return service.get_pid_status()
