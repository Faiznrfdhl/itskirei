
from app.services.ai_service import upscale_with_ai


def upscale_image(input_path: str, scale: int) -> str:
    if scale not in (2, 4):
        raise ValueError("Scale harus 2 atau 4.")

    return upscale_with_ai(input_path, scale)