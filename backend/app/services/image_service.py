from app.services.ai_service import upscale_with_ai


def upscale_image(
    input_path: str,
    scale: int
):

    if scale not in [2, 4]:
        raise ValueError(
            "Scale must be 2 or 4"
        )

    output_path = upscale_with_ai(
        input_path,
        scale
    )

    return output_path