from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers import router_v1
from services.lakeshore import LakeshoreService as ls
from exceptions.lakeshore import LakeshoreError

app = FastAPI(
    title="Lakeshore Management API",
    description="API for Lakeshore Model240 temperature controller",
    version="0.1.0",
    lifespan=ls.lifespan,
)

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, workers=1)
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
