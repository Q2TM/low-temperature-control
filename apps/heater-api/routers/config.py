from fastapi import APIRouter, Depends
from services.temp_service import TempService
from schemas.temp_control import TargetTemp, Parameters, ConfigAll
from .dependencies import get_temp_service


router = APIRouter(prefix="/config", tags=["Config"])


@router.get("/target-temp", response_model=TargetTemp, operation_id="getTargetTemp")
def get_target_temp(
    service: TempService = Depends(get_temp_service)
) -> TargetTemp:
    """Get the current target temperature."""
    return TargetTemp(target=service.get_target())


@router.post("/target-temp", response_model=None, operation_id="setTargetTemp")
def set_target_temp(
    payload: TargetTemp,
    service: TempService = Depends(get_temp_service)
) -> None:
    """Set a new target temperature."""
    service.set_target(payload.target)
    return None


@router.get("/pid-parameters", response_model=Parameters, operation_id="getPidParameters")
def get_pid_parameters(
    service: TempService = Depends(get_temp_service)
) -> Parameters:
    """Get the current PID parameters."""
    return service.get_parameters()


@router.post("/pid-parameters", response_model=Parameters, operation_id="setPidParameters")
def set_pid_parameters(
    params: Parameters,
    service: TempService = Depends(get_temp_service)
) -> Parameters:
    """Update PID parameters."""
    return service.set_parameters(params)


@router.get("/all", response_model=ConfigAll, operation_id="getAllConfig")
def get_all_config(
    service: TempService = Depends(get_temp_service)
) -> ConfigAll:
    """Get all configuration (target temperature and PID parameters)."""
    return ConfigAll(
        target_temp=service.get_target(),
        pid_parameters=service.get_parameters()
    )
