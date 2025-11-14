from services.temp_service import TempService

# Singleton service instance shared across all routers
_service = TempService()


def get_temp_service() -> TempService:
    return _service
