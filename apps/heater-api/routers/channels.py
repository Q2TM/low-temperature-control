from fastapi import APIRouter, Depends, HTTPException
from services.channel_manager import ChannelManager
from schemas.channel import ChannelInfo, ChannelListResponse, AllChannelsStatus
from schemas.temp_control import ChannelStatusOut
from .dependencies import get_channel_manager


router = APIRouter(prefix="/channels", tags=["Channels"])


@router.get("", response_model=ChannelListResponse, operation_id="listChannels")
def list_channels(
    manager: ChannelManager = Depends(get_channel_manager)
) -> ChannelListResponse:
    """
    List all configured channels from config.yaml.

    Returns information about all channels including their configuration
    and current runtime status (whether PID is active).
    """
    return ChannelListResponse(channels=manager.list_channels())


@router.get("/status/all", response_model=AllChannelsStatus, operation_id="getAllChannelsStatus")
def get_all_channels_status(
    manager: ChannelManager = Depends(get_channel_manager)
) -> AllChannelsStatus:
    """
    Get comprehensive status for all enabled channels at once.

    Returns detailed channel status including heater output state, PID controller
    state, temperature readings, and error statistics for each enabled channel.
    """
    return manager.get_all_status()


@router.get("/{channel_id}", response_model=ChannelInfo, operation_id="getChannelInfo")
def get_channel_info(
    channel_id: int,
    manager: ChannelManager = Depends(get_channel_manager)
) -> ChannelInfo:
    """
    Get information about a specific channel.

    Returns configuration and runtime status for the specified channel.
    """
    try:
        return manager.get_channel_info(channel_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{channel_id}/status", response_model=ChannelStatusOut, operation_id="getChannelStatus")
def get_channel_status(
    channel_id: int,
    manager: ChannelManager = Depends(get_channel_manager)
) -> ChannelStatusOut:
    """
    Get comprehensive real-time status for a specific channel.

    Returns:
    - channel_id, channel_name: Channel identity
    - current_temp: Latest temperature reading in °C
    - heater: Real-time heater output (power fraction, measured watts, type, metadata)
    - pid: PID controller state (active, target, parameters, variables, timing, errors)
    """
    try:
        service = manager.get_channel(channel_id)
        return service.get_channel_status()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
