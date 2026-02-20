import yaml
from pathlib import Path
from typing import List
from schemas.channel import ChannelConfig


class ConfigLoader:
    """Loads and validates channel configurations from YAML file."""

    @staticmethod
    def load_channels(config_path: str = "config.yaml") -> List[ChannelConfig]:
        """
        Load channel configurations from YAML file.

        Args:
            config_path: Path to YAML configuration file

        Returns:
            List of ChannelConfig objects

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

        channels = [ChannelConfig(**ch) for ch in data['channels']]

        # Validate unique channel_ids
        channel_ids = [ch.channel_id for ch in channels]
        if len(channel_ids) != len(set(channel_ids)):
            raise ValueError("Duplicate channel_id found in configuration")

        # Validate unique gpio_pins among enabled channels
        enabled_pins = [ch.gpio_pin for ch in channels if ch.enabled]
        if len(enabled_pins) != len(set(enabled_pins)):
            raise ValueError("Duplicate gpio_pin found in enabled channels")

        return channels
