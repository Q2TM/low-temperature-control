from fastapi import FastAPI
from routers import temp
from services.lifespan import lifespan

app = FastAPI(title="Heater API")
app.include_router(temp.router, prefix="/api")
app.router.lifespan_context = lifespan

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8001, workers=1)
    # uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
