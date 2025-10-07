from pydantic import Field
from fastapi_camelcase import CamelModel


class OperationResult(CamelModel):
    """Schema for API operation results indicating success/failure status.

    Used by endpoints that perform operations (like DELETE /factory-defaults)
    to return standardized success/error information.
    """

    is_success: bool = Field(...)
    message: str | None = Field(default=None)
    error: str | None = Field(default=None)
