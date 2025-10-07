from services.lakeshore import LakeshoreService


def get_lakeshore_service() -> LakeshoreService:
    """
    Dependency to get the LakeshoreService instance.
    This can be used in route handlers to access the service methods.
    """
    return LakeshoreService()
