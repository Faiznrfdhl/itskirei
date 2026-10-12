
import threading
import uuid
from pathlib import Path

import cv2
import torch
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer


BACKEND_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BACKEND_DIR / "models" / "RealESRGAN_x4plus.pth"
OUTPUT_DIR = BACKEND_DIR / "storage" / "outputs"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_upsampler = None
_model_lock = threading.RLock()


def _get_upsampler() -> RealESRGANer:
    """Load model once and reuse it for subsequent requests."""
    global _upsampler

    if _upsampler is None:
        with _model_lock:
            if _upsampler is None:
                if not MODEL_PATH.is_file() or MODEL_PATH.stat().st_size == 0:
                    raise FileNotFoundError(
                        f"Model AI tidak ditemukan atau kosong: {MODEL_PATH}"
                    )

                print(f"[AI Service] Memuat model Real-ESRGAN ke {DEVICE}...")
                model = RRDBNet(
                    num_in_ch=3,
                    num_out_ch=3,
                    num_feat=64,
                    num_block=23,
                    num_grow_ch=32,
                    scale=4,
                )

                _upsampler = RealESRGANer(
                    scale=4,
                    model_path=str(MODEL_PATH),
                    model=model,
                    tile=256,
                    tile_pad=10,
                    pre_pad=0,
                    half=(DEVICE.type == "cuda"),
                    device=DEVICE,
                )
                print("[AI Service] Model berhasil dimuat!", flush=True)

    return _upsampler


def upscale_with_ai(input_path: str, scale: int) -> str:
    """Upscale an image by 2x or 4x using Real-ESRGAN."""
    if scale not in (2, 4):
        raise ValueError("Scale harus 2 atau 4.")

    input_file = Path(input_path).resolve()
    if not input_file.is_file():
        raise FileNotFoundError(f"Gambar input tidak ditemukan: {input_file}")

    img = cv2.imread(str(input_file), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError("File gambar tidak dapat dibaca.")

    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    h, w = img.shape[:2]
    print(f"[AI Service] Memproses upscale {scale}x untuk '{input_file.name}' (Resolusi asli: {w}x{h})...", flush=True)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"{uuid.uuid4().hex}_x{scale}.png"

    print("[1] Ambil model", flush=True)
    upsampler = _get_upsampler()

    print("[2] Mulai enhance", flush=True)
    output, _ = upsampler.enhance(
        img,
        outscale=scale
    )

    print("[3] Enhance selesai", flush=True)
    saved = cv2.imwrite(
        str(output_path),
        output
    )

    print("[4] cv2.imwrite:", saved, flush=True)
    if not saved:
        raise RuntimeError("Gagal menyimpan hasil upscale.")

    out_h, out_w = output.shape[:2]
    print(f"[5] Return file (Resolusi baru: {out_w}x{out_h}): {output_path.name}", flush=True)
    return str(output_path)