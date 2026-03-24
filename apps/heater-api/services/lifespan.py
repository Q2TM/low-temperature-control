from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
import os
from fastapi.openapi.utils import get_openapi

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app) -> AsyncGenerator[None, None]:
    # Initialize channel manager from config file on startup
    from routers.dependencies import initialize_channel_manager, get_channel_manager

    print("🔧 Initializing channels from config file...")
    try:
        initialize_channel_manager()
        print("✅ Channel initialization complete\n")
    except Exception as e:
        print(f"❌ Failed to initialize channels: {e}")
        raise

    # write OpenAPI schema on startup
    if os.getenv("ENVIRONMENT") == "DEVELOPMENT":
        development_mode(app)

    yield

    # Cleanup all channels on shutdown
    print("\n🛑 Shutting down channels...")
    try:
        manager = get_channel_manager()
        manager.cleanup_all()
        print("✅ All channels cleaned up")
    except Exception as e:
        print(f"⚠️  Error during cleanup: {e}")


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

    port = os.getenv("PORT", "8001")
    print("📝 OpenAPI spec has been saved to docs/openapi.json and docs/openapi.yaml ✅")
    print(
        f"📖 Swagger Page is available at \x1b[1mhttp://localhost:{port}/docs\x1b[0m")
    print(
        f"📖 Scalar Page is available at \x1b[1mhttp://localhost:{port}/scalar\x1b[0m")
