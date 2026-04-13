from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Optional

from schemas.channel import ChannelConfig


class PidConfig(BaseModel):
    """PID controller tuning and loop parameters."""

    default_target: float = Field(
        default=30.0, description="Initial target temperature in °C")
    loop_interval_seconds: float = Field(
        default=5.0, gt=0, description="Sleep between PID loop iterations in seconds")
    dt_min: float = Field(
        default=1.0, gt=0, description="Minimum dt clamp for PID update in seconds")
    dt_max: float = Field(
        default=15.0, gt=0, description="Maximum dt clamp for PID update in seconds")
    output_min: float = Field(
        default=0.0, description="Minimum PID output (duty percent)")
    output_max: float = Field(
        default=100.0, description="Maximum PID output (duty percent)")
    anti_windup_min: float = Field(
        default=-100.0, description="Anti-windup integral lower bound")
    anti_windup_max: float = Field(
        default=100.0, description="Anti-windup integral upper bound")


class PsuConfig(BaseModel):
    """Programmable power supply hardware parameters."""

    max_voltage: float = Field(
        default=12.0, gt=0, description="Maximum PSU output voltage in volts")
    max_wattage: float = Field(
        default=25.0, gt=0, description="Maximum PSU output wattage in watts (For n heaters, max_wattage = 25.0 * n)")
    baudrate: int = Field(
        default=9600, gt=0, description="Serial baud rate for PSU communication")


class GpioConfig(BaseModel):
    """GPIO PWM hardware parameters."""

    default_frequency: float = Field(
        default=0.2, gt=0, description="Default PWM frequency in Hz")


class ServerConfig(BaseModel):
    """Uvicorn server settings. Can be overridden by env vars HOST, PORT, WORKERS."""

    host: str = Field(default="0.0.0.0", description="Bind host address")
    port: int = Field(default=8001, gt=0, le=65535, description="Bind port")
    workers: int = Field(
        default=1, gt=0, description="Number of uvicorn workers")


class OtelConfig(BaseModel):
    """OpenTelemetry exporter settings. Can be overridden by env vars OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_INSECURE, OTEL_METRIC_EXPORT_INTERVAL."""

    endpoint: str = Field(
        default="http://localhost:4317", description="OTLP gRPC exporter endpoint")
    insecure: bool = Field(
        default=True, description="Use insecure (non-TLS) connection")
    metric_export_interval_millis: int = Field(
        default=15000, gt=0, description="Periodic metric export interval in milliseconds")


class AppConfig(BaseModel):
    """Top-level application configuration parsed from YAML."""

    channels: List[ChannelConfig]
    pid: PidConfig = Field(default_factory=PidConfig)
    psu: PsuConfig = Field(default_factory=PsuConfig)
    gpio: GpioConfig = Field(default_factory=GpioConfig)
    server: ServerConfig = Field(default_factory=ServerConfig)
    otel: OtelConfig = Field(default_factory=OtelConfig)
