from fastapi import APIRouter, Depends, HTTPException
from services.channel_manager import ChannelManager
from schemas.temp_control import ManualPower
from .dependencies import get_channel_manager


router = APIRouter(prefix="/pid", tags=["PID"])


@router.post("/{channel_id}/start", response_model=str, operation_id="startPID")
def start_pid(
    channel_id: int,
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
    channel_id: int,
    manager: ChannelManager = Depends(get_channel_manager)
):
    """Stop the PID controller for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        return service.stop()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{channel_id}/manual-power", response_model=str, operation_id="setManualPower")
def set_manual_power(
    channel_id: int,
    body: ManualPower,
    manager: ChannelManager = Depends(get_channel_manager)
):
    """
    Manually set heater power for a specific channel.

    Stops the PID controller if it is currently running.
    Power is a normalized value between 0.0 and 1.0.
    """
    try:
        service = manager.get_channel(channel_id)
        return service.set_manual_power(body.power)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
