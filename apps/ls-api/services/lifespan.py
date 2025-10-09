from threading import Lock
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.openapi.utils import get_openapi
import os

from .lakeshore import LakeshoreService
from .environment import mode, DEVELOPMENT_MODE


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager to handle application startup and shutdown.

    :param app: FastAPI application instance
    :type app: FastAPI
    :return: Lifespan context manager
    :rtype: AsyncGenerator[None, None]
    """

    app.state.lock = Lock()

    if mode == DEVELOPMENT_MODE:
        development_mode(app)

    yield
    LakeshoreService().disconnect()


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
