from typing import Dict
from schemas.channel import ChannelConfig, ChannelInfo, AllChannelsStatus, GpioHeaterConfig, PsuHeaterConfig, MockHeaterConfig
from schemas.app_config import AppConfig
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
        self._channels: Dict[int, TempService] = {}
        self._configs: Dict[int, ChannelConfig] = {}
        self.app_config: AppConfig = ConfigLoader.load(config_path)
        self._initialize_channels()

    def _initialize_channels(self):
        """Initialize all channels from loaded configuration."""
        for config in self.app_config.channels:
            self._configs[config.channel_id] = config
            if config.enabled:
                service = TempService(
                    channel_id=config.channel_id,
                    channel_name=config.name,
                    thermo_channel=config.thermo_channel,
                    heater_config=config.heater,
                    app_config=self.app_config,
                )
                self._channels[config.channel_id] = service
                print(
                    f"✓ Initialized channel: {config.channel_id} ({config.name}) "
                    f"heater_type={config.heater.type}"
                )
            else:
                print(
                    f"⊘ Skipped disabled channel: {config.channel_id} ({config.name})"
                )

    def get_channel(self, channel_id: int) -> TempService:
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
                thermo_channel=config.thermo_channel,
                heater_type=config.heater.type,
                enabled=config.enabled,
                max_power_watts=_get_max_power_watts(config),
                is_active=is_active
            ))
        return result

    def get_channel_info(self, channel_id: int) -> ChannelInfo:
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
            thermo_channel=config.thermo_channel,
            heater_type=config.heater.type,
            enabled=config.enabled,
            max_power_watts=_get_max_power_watts(config),
            is_active=is_active
        )

    def get_all_status(self) -> AllChannelsStatus:
        """
        Get PID status for all enabled channels.

        Returns:
            AllChannelsStatus object with status list
        """
        statuses = [
            service.get_pid_status()
            for service in self._channels.values()
        ]
        return AllChannelsStatus(channels=statuses)

    def cleanup_all(self):
        """Cleanup all channels on shutdown."""
        for service in self._channels.values():
            service.cleanup()


def _get_max_power_watts(config: ChannelConfig) -> float:
    """Compute max power watts from a channel's heater config."""
    heater = config.heater
    if isinstance(heater, PsuHeaterConfig):
        return heater.max_wattage
    # GpioHeaterConfig and MockHeaterConfig both have max_power_watts
    return heater.max_power_watts
