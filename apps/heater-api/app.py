import os
from typing import cast
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from routers import channels, config, pid
from services.lifespan import lifespan

from opentelemetry import trace, metrics
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

_otel_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
_otel_insecure = os.getenv("OTEL_EXPORTER_OTLP_INSECURE", "true").lower() == "true"
_otel_metric_interval = int(os.getenv("OTEL_METRIC_EXPORT_INTERVAL", "15000"))

otel_resource = Resource.create({SERVICE_NAME: "heater-api"})

trace.set_tracer_provider(TracerProvider(resource=otel_resource))

otlp_exporter = OTLPSpanExporter(
    endpoint=_otel_endpoint,
    insecure=_otel_insecure,
)

tracer_provider = cast(TracerProvider, trace.get_tracer_provider())
tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

metric_reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint=_otel_endpoint, insecure=_otel_insecure),
    export_interval_millis=_otel_metric_interval,
)
metrics.set_meter_provider(MeterProvider(resource=otel_resource, metric_readers=[metric_reader]))

app = FastAPI(
    title="Heater API (LT Capstone)",
    description="API Server that controls the Heater via GPIO with PID Logic.",
    version="0.1.0",
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "Channels",
            "description": "Channel information and management. Channels are configured in config.yaml.",
        },
        {
            "name": "Config",
            "description": "Configuration endpoints for managing target temperature and PID parameters per channel. These settings control the behavior of each PID controller.",
        },
        {
            "name": "PID",
            "description": "PID controller operations per channel for starting, stopping, and monitoring the temperature control loop. Includes comprehensive status information and error tracking.",
        },
    ],
)
print("Instrumenting app")
FastAPIInstrumentor.instrument_app(app)

app.include_router(channels.router)
app.include_router(config.router)
app.include_router(pid.router)

with open("./docs/index.html", "r") as f:
    docs_html = f.read()


@app.get("/scalar", response_class=HTMLResponse, include_in_schema=False)
def get_scalar_ui():
    return docs_html
