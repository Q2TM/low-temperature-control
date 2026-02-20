from typing import Dict
from schemas.channel import ChannelConfig, ChannelInfo, AllChannelsStatus
from services.temp_service import TempService
from services.config_loader import ConfigLoader


class ChannelManager:
    """Manages multiple temperature control channels loaded from configuration."""

    def __init__(self, config_path: str = "config.yaml"):
        """
        Initialize channel manager from YAML configuration.

        Args:
            config_path: Path to YAML configuration file (default: config.yaml)
        """
        self._channels: Dict[str, TempService] = {}
        self._configs: Dict[str, ChannelConfig] = {}
        self._initialize_channels(config_path)

    def _initialize_channels(self, config_path: str):
        """Load and initialize all channels from YAML configuration."""
        configs = ConfigLoader.load_channels(config_path)

        for config in configs:
            self._configs[config.channel_id] = config
            if config.enabled:
                # Only initialize enabled channels
                service = TempService(
                    channel_id=config.channel_id,
                    channel_name=config.name,
                    gpio_pin=config.gpio_pin,
                    sensor_channel=config.sensor_channel
                )
                self._channels[config.channel_id] = service
                print(
                    f"✓ Initialized channel: {config.channel_id} ({config.name}) "
                    f"on GPIO pin {config.gpio_pin}"
                )
            else:
                print(
                    f"⊘ Skipped disabled channel: {config.channel_id} ({config.name})"
                )

    def get_channel(self, channel_id: str) -> TempService:
        """
        Get a specific channel service instance.

        Args:
            channel_id: Unique channel identifier

        Returns:
            TempService instance for the channel

        Raises:
            ValueError: If channel not found or disabled
        """
        if channel_id not in self._channels:
            if channel_id in self._configs:
                raise ValueError(f"Channel '{channel_id}' is disabled")
            raise ValueError(
                f"Channel '{channel_id}' not found in configuration")
        return self._channels[channel_id]

    def list_channels(self) -> list[ChannelInfo]:
        """
        List all configured channels with their status.

        Returns:
            List of ChannelInfo objects
        """
        result = []
        for channel_id, config in self._configs.items():
            is_active = False
            if channel_id in self._channels:
                is_active = self._channels[channel_id]._running

            result.append(ChannelInfo(
                channel_id=config.channel_id,
                name=config.name,
                gpio_pin=config.gpio_pin,
                sensor_channel=config.sensor_channel,
                enabled=config.enabled,
                is_active=is_active
            ))
        return result

    def get_channel_info(self, channel_id: str) -> ChannelInfo:
        """
        Get info for a specific channel.

        Args:
            channel_id: Unique channel identifier

        Returns:
            ChannelInfo object

        Raises:
            ValueError: If channel not found
        """
        if channel_id not in self._configs:
            raise ValueError(f"Channel '{channel_id}' not found")

        config = self._configs[channel_id]
        is_active = False
        if channel_id in self._channels:
            is_active = self._channels[channel_id]._running

        return ChannelInfo(
            channel_id=config.channel_id,
            name=config.name,
            gpio_pin=config.gpio_pin,
            sensor_channel=config.sensor_channel,
            enabled=config.enabled,
            is_active=is_active
        )

    def get_all_status(self) -> AllChannelsStatus:
        """
        Get PID status for all enabled channels.

        Returns:
            AllChannelsStatus object with status dict
        """
        statuses = {}
        for channel_id, service in self._channels.items():
            statuses[channel_id] = service.get_pid_status()
        return AllChannelsStatus(channels=statuses)

    def cleanup_all(self):
        """Cleanup all channels on shutdown."""
        for service in self._channels.values():
            service.cleanup()
