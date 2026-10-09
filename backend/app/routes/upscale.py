
from pathlib import Path
import re

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.services.image_service import upscale_image

router = APIRouter(prefix="/api", tags=["Upscale"])

BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "storage" / "uploads"
OUTPUT_DIR = BACKEND_DIR / "storage" / "outputs"

MAX_OUTPUT_SIZE = 100 * 1024 * 1024
IMAGE_ID_PATTERN = re.compile(r"^[0-9a-f]{32}$")
RESULT_PATTERN = re.compile(r"^[0-9a-f]{32}_x[24]\.png$")


class UpscaleRequest(BaseModel):
    image_id: str
    scale: int = Field(default=2, ge=2, le=4)


@router.post("/upscale")
def upscale(request: UpscaleRequest):
    if request.scale not in (2, 4):
        raise HTTPException(
            status_code=422,
            detail="Scale harus 2 atau 4.",
        )

    if not IMAGE_ID_PATTERN.fullmatch(request.image_id):
        raise HTTPException(status_code=400, detail="ID gambar tidak valid.")

    matches = list(UPLOAD_DIR.glob(f"{request.image_id}.*"))
    if not matches or not matches[0].is_file():
        raise HTTPException(status_code=404, detail="Gambar tidak ditemukan.")

    try:
        result_path = Path(
            upscale_image(str(matches[0]), request.scale)
        ).resolve()

        if result_path.parent != OUTPUT_DIR.resolve():
            raise RuntimeError("Lokasi output tidak valid.")

        if not result_path.is_file():
            raise RuntimeError("File hasil tidak ditemukan.")

        if result_path.stat().st_size > MAX_OUTPUT_SIZE:
            result_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=413,
                detail="Ukuran hasil melebihi batas 100 MB.",
            )

        return {
            "message": "Upscale success",
            "image_id": request.image_id,
            "scale": request.scale,
            "result": result_path.name,
            "result_url": f"/api/result/{result_path.name}",
            "size": result_path.stat().st_size,
        }

    except HTTPException:
        raise
    except Exception:
        # Log detail exception di server saat debugging.
        import logging
        logging.exception("Image upscaling failed")
        raise HTTPException(
            status_code=500,
            detail="Gagal memproses gambar. Silakan coba lagi.",
        )


@router.get("/result/{filename}")
def get_result(filename: str):
    if not RESULT_PATTERN.fullmatch(filename):
        raise HTTPException(status_code=400, detail="Nama hasil tidak valid.")

    file_path = (OUTPUT_DIR / filename).resolve()

    if file_path.parent != OUTPUT_DIR.resolve() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Hasil tidak ditemukan.")

    return FileResponse(
        path=file_path,
        media_type="image/png",
        headers={
            "Content-Disposition": "inline",
            "Cache-Control": "no-store",
        },
    )