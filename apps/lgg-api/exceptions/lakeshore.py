
class LakeshoreError(Exception):
    """Base class for all Lakeshore related errors."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class DeviceNotConnectedError(LakeshoreError):
    """Raised when the device is not connected but an operation is attempted."""

    def __init__(self, message: str = "Model240 device not connected") -> None:
        super().__init__(message)


class ConnectionError(LakeshoreError):
    """Raised when there is an error in connecting to the device."""

    def __init__(self, message: str = "Failed to connect to Model240 device") -> None:
        super().__init__(message)


class ChannelError(LakeshoreError):
    """Raised when an invalid channel is specified."""

    def __init__(self, channel: int, message: str = "Channel must be between 1 and 8") -> None:
        super().__init__(f"{message}. Provided channel: {channel}")
        self.channel = channel
