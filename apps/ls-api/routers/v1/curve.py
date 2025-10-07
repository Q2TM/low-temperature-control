from fastapi import APIRouter, Depends, HTTPException, Request
from schemas.curve import CurveDataPoint, CurveHeader, IndexQueryParam
from schemas.shared import ChannelQueryParam
from schemas.operations import OperationResult
from services.lakeshore import LakeshoreService
from schemas.curve import CurveDataPoints
from routers.dependencies import get_lakeshore_service

router = APIRouter(prefix="/curve")


@router.get("/{channel}/header", operation_id="getCurveHeader", response_model=CurveHeader)
def get_curve_header(
    request: Request,
    channel: int = ChannelQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> CurveHeader:
    return ls.get_curve_header(request, channel)


@router.put("/{channel}/header", operation_id="setCurveHeader")
def set_curve_header(
    request: Request,
    curve_header: CurveHeader,
    channel: int = ChannelQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> OperationResult:
    ls.set_curve_header(request, curve_header, channel)
    return OperationResult(is_success=True, message="Curve header updated successfully")


@router.get("/{channel}/data-point/{index}",
            operation_id="getCurveDataPoint", response_model=CurveDataPoint)
def get_curve_data_point(
    request: Request,
    channel: int = ChannelQueryParam,
    index: int = IndexQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> CurveDataPoint:
    return ls.get_curve_data_point(request, channel, index)


@router.get("/{channel}/data-points", operation_id="getAllCurveDataPoints", response_model=CurveDataPoints)
def get_curve_data_points(
    request: Request,
    channel: int = ChannelQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> CurveDataPoints:
    return ls.get_curve_data_points(request, channel)


@router.put("/{channel}/data-point/{index}", operation_id="setCurveDataPoint")
async def set_curve_data_point(
    request: Request,
    data_point: CurveDataPoint,
    channel: int = ChannelQueryParam,
    index: int = IndexQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> OperationResult:
    ls.set_curve_data_point(request, data_point, channel, index)
    return OperationResult(is_success=True, message="Curve data point updated successfully")


@router.delete("/{channel}", operation_id="deleteCurve")
def delete_curve(
    request: Request,
    channel: int = ChannelQueryParam,
    ls: LakeshoreService = Depends(get_lakeshore_service)
) -> OperationResult:
    ls.delete_curve(request, channel)
    return OperationResult(is_success=True, message="Curve deleted successfully")
