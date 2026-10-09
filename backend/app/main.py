
import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI

from app.routes import upload, upscale
from app.services.cleanup_service import cleanup_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    cleanup_task = asyncio.create_task(cleanup_loop())

    try:
        yield
    finally:
        cleanup_task.cancel()
        with suppress(asyncio.CancelledError):
            await cleanup_task


app = FastAPI(
    title="ItsKirei API",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(upload.router)
app.include_router(upscale.router)


@app.get("/")
def root():
    return {"message": "ItsKirei API Running"}