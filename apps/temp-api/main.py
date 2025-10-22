from fastapi import FastAPI
from routers import temp
from services.lifespan import lifespan

app = FastAPI(title="temp-api")
app.include_router(temp.router, prefix="/api")
app.router.lifespan_context = lifespan

# @app.get("/")
# async def root():
#     return {"status": "ok", "service": "temp-api"}
