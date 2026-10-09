from PIL import Image
import os


MODEL_PATH = "models/RealESRGAN_x4plus.pth"


def upscale_with_ai(
    input_path: str,
    scale: int
):

    print("Running AI Upscale...")
    print("Input:", input_path)
    print("Scale:", scale)

    # sementara test dulu
    image = Image.open(input_path)

    width, height = image.size

    output = image.resize(
        (
            width * scale,
            height * scale
        )
    )

    output_path = (
        f"storage/outputs/ai_{os.path.basename(input_path)}"
    )

    output.save(output_path)

    return output_path