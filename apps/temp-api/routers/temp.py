from fastapi import APIRouter
from services.temp_service import TempService
from schemas.temp_controll import TargetTempIn, TargetTempOut, StatusOut, Parameters

router = APIRouter(prefix="/temp")
_service = TempService()

@router.get("/target-temp", response_model=TargetTempOut)
def get_target_temp():
    return {"target": _service.get_target()}

@router.post("/target-temp")
def post_target_temp(payload: TargetTempIn):
    _service.set_target(payload.target)
    return None

@router.get("/status", response_model=StatusOut)
def get_status():
    return _service.get_status()

@router.get("/parameters", response_model=Parameters)
def get_parameters():
    return _service.get_parameters()

@router.post("/parameters", response_model=Parameters)
def post_parameters(params: Parameters):
    return _service.set_parameters(params)
