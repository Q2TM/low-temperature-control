from services.channel_manager import ChannelManager
import os

# Singleton channel manager loaded from config file
_manager: ChannelManager | None = None


def get_channel_manager() -> ChannelManager:
    """Get the singleton channel manager instance."""
    global _manager
    if _manager is None:
        raise RuntimeError("Channel manager not initialized")
    return _manager


def initialize_channel_manager(config_path: str | None = None):
    """
    Initialize channel manager from config file.

    Args:
        config_path: Path to config file. If None, uses CONFIG_PATH env var or defaults to config.yaml
    """
    global _manager
    if config_path is None:
        config_path = os.getenv("CONFIG_PATH", "config.yaml")
    _manager = ChannelManager(config_path)
