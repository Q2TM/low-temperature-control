import json
from contextlib import asynccontextmanager
from pathlib import Path

@asynccontextmanager
async def lifespan(app):
    # write OpenAPI schema on startup
    docs_dir = Path(__file__).resolve().parent.parent / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)
    with open(docs_dir / "openapi.json", "w", encoding="utf-8") as f:
        json.dump(app.openapi(), f, indent=2)
    yield
