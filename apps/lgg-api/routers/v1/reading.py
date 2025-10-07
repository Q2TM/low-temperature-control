from fastapi import APIRouter, Depends, Request, HTTPException
from schemas.operations import OperationResult
from schemas.reading import MonitorResp
from schemas.shared import ChannelQueryParam
from services.lakeshore import LakeshoreService
from schemas.reading import InputParameter
from routers.dependencies import get_lakeshore_service

router = APIRouter(prefix="/reading")


@router.get("/input/{channel}", operation_id="getInputParameter", response_model=InputParameter)
def get_input_parameter(
    request: Request,
    channel: int = ChannelQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> InputParameter:
    return ls.get_input_parameter(request, channel)


@router.put("/input/{channel}", operation_id="setInputParameter")
def set_input_config(
        request: Request,
        input_param: InputParameter,
        channel: int = ChannelQueryParam,
        ls: LakeshoreService = Depends(get_lakeshore_service)) -> OperationResult:
    ls.set_input_config(request, input_param, channel)
    return OperationResult(is_success=True, message="Input configuration updated successfully")


@router.get("/monitor/{channel}", operation_id="getMonitor", response_model=MonitorResp)
def get_monitor(
    request: Request,
    channel: int = ChannelQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> MonitorResp:
    return ls.get_monitor(request, channel)
