from fastapi import APIRouter, Depends, Request
from services.temp_service import TempService
from schemas.temp_control import TargetTemp, StatusOut, Parameters

router = APIRouter(prefix="/temp")
_service = TempService()


def get_temp_service() -> TempService:
    return _service


@router.get("/target-temp", response_model=TargetTemp, operation_id="getTargetTemp")
def get_target_temp(
    service: TempService = Depends(get_temp_service)
) -> TargetTemp:
    """Get the current target temperature."""
    return TargetTemp(target=service.get_target())


@router.post("/target-temp", response_model=None, operation_id="setTargetTemp")
def set_target(
    payload: TargetTemp,
    service: TempService = Depends(get_temp_service)
) -> None:
    """Set a new target temperature."""
    service.set_target(payload.target)
    return None


@router.get("/status", response_model=StatusOut, operation_id="getStatus")
def get_status(
    service: TempService = Depends(get_temp_service)
) -> StatusOut:
    """Get the current temperature status."""
    return service.get_status()


@router.get("/parameters", response_model=Parameters, operation_id="getParameters")
def get_parameters(
    service: TempService = Depends(get_temp_service)
) -> Parameters:
    """Get the current temperature PID parameters."""
    return service.get_parameters()


@router.post("/parameters", response_model=Parameters, operation_id="setParameters")
def set_parameters(
    params: Parameters,
    service: TempService = Depends(get_temp_service)
) -> Parameters:
    """Update PID parameters."""
    return service.set_parameters(params)


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
