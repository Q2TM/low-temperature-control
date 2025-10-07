from fastapi import APIRouter
from .v1.curve import router as curve
from .v1.device import router as device
from .v1.reading import router as reading

router_v1 = APIRouter(prefix="/api/v1")

# Include all route modules
router_v1.include_router(device, tags=["device"])
router_v1.include_router(reading, tags=["reading"])
router_v1.include_router(curve, tags=["curve"])

__all__ = ["router_v1"]
