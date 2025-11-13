from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
import os
from fastapi.openapi.utils import get_openapi

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app) -> AsyncGenerator[None, None]:
    # write OpenAPI schema on startup

    if os.getenv("ENVIRONMENT") == "DEVELOPMENT":
        development_mode(app)

    yield


def development_mode(app: FastAPI):
    """Function to run when in development mode."""

    import json
    import yaml

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    with open("docs/openapi.json", "w") as json_file:
        json.dump(openapi_schema, json_file, indent=2)
    with open("docs/openapi.yaml", "w") as yaml_file:
        yaml.dump(openapi_schema, yaml_file, indent=2, sort_keys=False)

    print("📝 OpenAPI spec has been saved to docs/openapi.json and docs/openapi.yaml ✅")
    print(
        "📖 Swagger Page is available at \x1b[1mhttp://localhost:8001/docs\x1b[0m")
    print(
        "📖 Scalar Page is available at \x1b[1mhttp://localhost:8001/scalar\x1b[0m")
