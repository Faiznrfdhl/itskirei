
from fastapi import FastAPI
from app.routes import upload, upscale

app = FastAPI(
    title="ItsKirei API",
    version="0.1.0",
)

app.include_router(upload.router)
app.include_router(upscale.router)


@app.get("/")
def root():
    return {"message": "ItsKirei API Running"}