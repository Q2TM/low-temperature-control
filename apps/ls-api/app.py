from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import cast

from exceptions.lakeshore import LakeshoreError
from routers import router_v1
from services.lifespan import lifespan

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

trace.set_tracer_provider(
    TracerProvider(resource=Resource.create({SERVICE_NAME: "lingangu-api"}))
)

otlp_exporter = OTLPSpanExporter(
    endpoint="http://localhost:4317",
    insecure=True,
)

tracer_provider = cast(TracerProvider, trace.get_tracer_provider())
tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

app = FastAPI(
    title="Lakeshore Management API",
    description="API for Lakeshore Model240 temperature controller",
    version="0.1.0",
    lifespan=lifespan,
)

print("Instrumenting app")
FastAPIInstrumentor.instrument_app(app)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom Exception Handling
@app.exception_handler(LakeshoreError)
async def lakeshore_exception_handler(request: Request, exc: LakeshoreError) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"message": str(exc)},
    )

app.include_router(router_v1)
