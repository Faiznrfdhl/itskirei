from fastapi import APIRouter
from app.services.image_service import upscale_image


router = APIRouter(
    prefix="/api",
    tags=["Upscale"]
)


@router.post("/upscale")
def upscale(
    input_path: str,
    scale: int = 2
):

    result = upscale_image(
        input_path,
        scale
    )

    return {
        "message": "Upscale success",
        "result": result
    }