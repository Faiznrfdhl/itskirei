
import os
import cv2
import torch
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet

MODEL_PATH = "models/RealESRGAN_x4plus.pth"
INPUT_IMAGE = "storage/uploads/test.jpg"
OUTPUT_IMAGE = "storage/outputs/test_upscaled.png"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Device:", device)

if not os.path.isfile(MODEL_PATH) or os.path.getsize(MODEL_PATH) == 0:
    raise FileNotFoundError(
        f"Model tidak ditemukan atau kosong: {MODEL_PATH}"
    )

if not os.path.isfile(INPUT_IMAGE):
    raise FileNotFoundError(
        f"Gambar input tidak ditemukan: {INPUT_IMAGE}"
    )

model = RRDBNet(
    num_in_ch=3,
    num_out_ch=3,
    num_feat=64,
    num_block=23,
    num_grow_ch=32,
    scale=4,
)

upsampler = RealESRGANer(
    scale=4,
    model_path=MODEL_PATH,
    model=model,
    tile=256,
    tile_pad=10,
    pre_pad=0,
    half=(device.type == "cuda"),
    device=device,
)

print("Model loaded!")

img = cv2.imread(INPUT_IMAGE, cv2.IMREAD_COLOR)
if img is None:
    raise ValueError(f"Gagal membaca gambar: {INPUT_IMAGE}")

# Model x4, tetapi output bisa diatur menjadi 2x atau 4x.
output, _ = upsampler.enhance(img, outscale=2)

os.makedirs(os.path.dirname(OUTPUT_IMAGE), exist_ok=True)

if not cv2.imwrite(OUTPUT_IMAGE, output):
    raise RuntimeError(f"Gagal menyimpan hasil: {OUTPUT_IMAGE}")

print("Done!")
print("Saved:", OUTPUT_IMAGE)
print("Input size:", img.shape[1], "x", img.shape[0])
print("Output size:", output.shape[1], "x", output.shape[0])