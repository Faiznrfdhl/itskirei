
from io import BytesIO
from pathlib import Path
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

router = APIRouter(prefix="/api", tags=["Upload"])

BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "storage" / "uploads"
MAX_UPLOAD_SIZE = 15 * 1024 * 1024
ALLOWED_FORMATS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    content = await file.read(MAX_UPLOAD_SIZE + 1)
    await file.close()

    if not content:
        raise HTTPException(status_code=400, detail="File kosong.")

    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Ukuran gambar maksimal 15 MB.",
        )

    try:
        with Image.open(BytesIO(content)) as image:
            image_format = image.format
            image.verify()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400,
            detail="File bukan gambar yang valid.",
        )

    if image_format not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=415,
            detail="Format yang didukung: JPEG, PNG, dan WebP.",
        )

    image_id = uuid.uuid4().hex
    filename = f"{image_id}{ALLOWED_FORMATS[image_format]}"

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_path = UPLOAD_DIR / filename
    file_path.write_bytes(content)

    return {
        "id": image_id,
        "filename": filename,
        "size": len(content),
        "message": "Upload success",
    }