from fastapi import APIRouter, Depends, HTTPException
from services.channel_manager import ChannelManager
from schemas.temp_control import PidStatusOut
from .dependencies import get_channel_manager


router = APIRouter(prefix="/pid", tags=["PID"])


@router.post("/{channel_id}/start", response_model=str, operation_id="startPID")
def start_pid(
    channel_id: str,
    manager: ChannelManager = Depends(get_channel_manager)
):
    """Start the PID controller for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        return service.start()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{channel_id}/stop", response_model=str, operation_id="stopPID")
def stop_pid(
    channel_id: str,
    manager: ChannelManager = Depends(get_channel_manager)
):
    """Stop the PID controller for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        return service.stop()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{channel_id}/status", response_model=PidStatusOut, operation_id="getPidStatus")
def get_pid_status(
    channel_id: str,
    manager: ChannelManager = Depends(get_channel_manager)
) -> PidStatusOut:
    """
    Get comprehensive PID status for a specific channel.

    Returns:
    - channel_id: Channel identifier
    - channel_name: Channel name
    - is_active: Whether PID controller is currently running
    - target: Target temperature
    - duty_cycle: Current PWM duty cycle
    - current_temp: Current temperature reading
    - pid_parameters: Current PID coefficients (Kp, Ki, Kd)
    - pid_variables: Internal PID variables (integral, last_error, last_measurement)
    - error_stats: Error statistics including counts for last 1m, 10m, and since start
    """
    try:
        service = manager.get_channel(channel_id)
        return service.get_pid_status()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
