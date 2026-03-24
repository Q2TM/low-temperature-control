import yaml
from pathlib import Path
from typing import List
from schemas.channel import ChannelConfig
from schemas.app_config import AppConfig


class ConfigLoader:
    """Loads and validates application configuration from YAML file."""

    @staticmethod
    def load(config_path: str = "config.yaml") -> AppConfig:
        """
        Load full application configuration from YAML file.

        Args:
            config_path: Path to YAML configuration file

        Returns:
            AppConfig object with all settings (channels, pid, psu, gpio, server, otel)

        Raises:
            FileNotFoundError: If configuration file doesn't exist
            ValueError: If YAML is invalid or contains duplicate/invalid data
        """
        path = Path(config_path)
        if not path.exists():
            raise FileNotFoundError(
                f"Configuration file not found: {config_path}\n"
                f"Please create it from config.example.yaml"
            )

        with open(path, 'r') as f:
            data = yaml.safe_load(f)

        if not data or 'channels' not in data:
            raise ValueError("YAML file must contain 'channels' key")

        if not data['channels']:
            raise ValueError("At least one channel must be configured")

        app_config = AppConfig(**data)

        channel_ids = [ch.channel_id for ch in app_config.channels]
        if len(channel_ids) != len(set(channel_ids)):
            raise ValueError("Duplicate channel_id found in configuration")

        enabled_pins = [ch.gpio_pin for ch in app_config.channels if ch.enabled]
        if len(enabled_pins) != len(set(enabled_pins)):
            raise ValueError("Duplicate gpio_pin found in enabled channels")

        return app_config

    @staticmethod
    def load_channels(config_path: str = "config.yaml") -> List[ChannelConfig]:
        """Legacy method: load only channel configurations."""
        return ConfigLoader.load(config_path).channels
