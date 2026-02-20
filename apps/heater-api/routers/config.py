from fastapi import APIRouter, Depends, HTTPException
from services.channel_manager import ChannelManager
from schemas.temp_control import TargetTemp, Parameters, ConfigAll
from .dependencies import get_channel_manager


router = APIRouter(prefix="/config", tags=["Config"])


@router.get("/{channel_id}/target-temp", response_model=TargetTemp, operation_id="getTargetTemp")
def get_target_temp(
    channel_id: str,
    manager: ChannelManager = Depends(get_channel_manager)
) -> TargetTemp:
    """Get the current target temperature for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        return TargetTemp(target=service.get_target())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{channel_id}/target-temp", response_model=None, operation_id="setTargetTemp")
def set_target_temp(
    channel_id: str,
    payload: TargetTemp,
    manager: ChannelManager = Depends(get_channel_manager)
) -> None:
    """Set a new target temperature for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        service.set_target(payload.target)
        return None
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{channel_id}/pid-parameters", response_model=Parameters, operation_id="getPidParameters")
def get_pid_parameters(
    channel_id: str,
    manager: ChannelManager = Depends(get_channel_manager)
) -> Parameters:
    """Get the current PID parameters for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        return service.get_parameters()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{channel_id}/pid-parameters", response_model=Parameters, operation_id="setPidParameters")
def set_pid_parameters(
    channel_id: str,
    params: Parameters,
    manager: ChannelManager = Depends(get_channel_manager)
) -> Parameters:
    """Update PID parameters for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        return service.set_parameters(params)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{channel_id}/all", response_model=ConfigAll, operation_id="getAllConfig")
def get_all_config(
    channel_id: str,
    manager: ChannelManager = Depends(get_channel_manager)
) -> ConfigAll:
    """Get all configuration (target temperature and PID parameters) for a specific channel."""
    try:
        service = manager.get_channel(channel_id)
        return ConfigAll(
            target_temp=service.get_target(),
            pid_parameters=service.get_parameters()
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
