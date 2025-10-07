from fastapi import Path

# Shared query parameter for channel validation across endpoints
# Used by endpoints that require a channel number (1-8)
ChannelQueryParam = Path(
    ..., ge=1, le=8, description="Channel must be between 1 and 8")
