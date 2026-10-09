# ItsKirei - API Specification Document 🔌

Dokumen ini mendefinisikan spesifikasi antarmuka pemrograman aplikasi (**REST API**) untuk platform **ItsKirei**, mencakup konvensi request/response, rincian endpoint MVP, model data Pydantic/TypeScript, kode galat (*error codes*), serta spesifikasi API untuk fitur masa depan.

---

## 1. Konvensi & Standar API

* **Base URL:** `/api/v1`
* **Arsitektur:** RESTful API over HTTPS
* **Format Payload:**
  * Request data binary: `multipart/form-data`
  * Request & Response JSON: `application/json; charset=utf-8`
* **Format Envelope Response Standar:**
  Seluruh respons API dibungkus dalam format seragam:
  
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "timestamp": "2026-10-07T11:50:00Z"
  }
  ```

---

## 2. Endpoint MVP (Core API Endpoints)

### 2.1 AI Image Upscaling
Menerima berkas gambar dan mengeksekusi inferensi model Super Resolution.

* **URL:** `/api/v1/upscale`
* **Metode:** `POST`
* **Content-Type:** `multipart/form-data`

#### Request Parameters (Form Data):
| Parameter | Tipe | Wajib | Validasi / Nilai | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `file` | `binary (file)` | Ya | Max 10MB, MIME: `image/jpeg`, `image/png`, `image/webp` | Berkas gambar yang ingin ditingkatkan kualitasnya. |
| `scale` | `integer` | Ya | `2` atau `4` (Default: `2`) | Faktor perbesaran skala resolusi target. |

#### Respons Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "task_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "scale": 4,
    "original": {
      "filename": "vintage_photo.png",
      "width": 640,
      "height": 480,
      "size_bytes": 412890,
      "url": "/static/temp/9b1deb4d_original.png"
    },
    "enhanced": {
      "filename": "itskirei_vintage_photo_4x.png",
      "width": 2560,
      "height": 1920,
      "size_bytes": 3840192,
      "url": "/static/temp/9b1deb4d_kirei_4x.png"
    },
    "inference_time_ms": 2840,
    "created_at": "2026-10-07T11:50:05Z",
    "expires_at": "2026-10-07T12:50:05Z"
  },
  "error": null,
  "timestamp": "2026-10-07T11:50:05Z"
}
```

#### Respons Galat (Error Responses):

* **400 Bad Request (Format Berkas Tak Didukung):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "message": "Format berkas tidak didukung. Harap unggah gambar berekstensi .jpg, .png, atau .webp."
  },
  "timestamp": "2026-10-07T11:50:01Z"
}
```

* **413 Payload Too Large (Ukuran Berkas Melebihi Batas):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Ukuran berkas melebihi batas maksimal 10 MB."
  },
  "timestamp": "2026-10-07T11:50:01Z"
}
```

* **422 Unprocessable Entity (Resolusi Input Terlalu Besar):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "IMAGE_DIMENSIONS_EXCEEDED",
    "message": "Dimensi gambar (4000x3000) melebihi batas input aman maksimal 2048x2048 piksel."
  },
  "timestamp": "2026-10-07T11:50:01Z"
}
```

* **503 Service Unavailable (Kapasitas GPU Penuh / OOM):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "GPU_BUSY_OR_OOM",
    "message": "Server sedang memproses beban inferensi maksimal. Silakan coba kembali sesaat lagi."
  },
  "timestamp": "2026-10-07T11:50:01Z"
}
```

---

### 2.2 Health Check & Device Status
Memeriksa status ketersediaan backend, kesiapan GPU, dan model yang ter-load.

* **URL:** `/api/v1/health`
* **Metode:** `GET`

#### Respons Sukses (`200 OK`):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "ItsKirei AI Engine",
    "version": "1.0.0",
    "device": "cuda:0",
    "gpu_name": "NVIDIA GeForce RTX 4090",
    "vram": {
      "allocated_mb": 1820.45,
      "reserved_mb": 2450.00,
      "total_mb": 24576.00
    },
    "loaded_models": [
      "RealESRGAN_x2plus",
      "RealESRGAN_x4plus"
    ]
  },
  "error": null,
  "timestamp": "2026-10-07T11:50:00Z"
}
```

---

## 3. Spesifikasi Skema Data (Pydantic / TypeScript Models)

### Skema TypeScript (Frontend Integration):
```typescript
export interface ImageMeta {
  filename: string;
  width: number;
  height: number;
  size_bytes: number;
  url: string;
}

export interface UpscaleResultData {
  task_id: string;
  scale: 2 | 4;
  original: ImageMeta;
  enhanced: ImageMeta;
  inference_time_ms: number;
  created_at: string;
  expires_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}
```

### Skema Pydantic (Backend FastAPI):
```python
from pydantic import BaseModel, Field
from typing import Optional, List

class ImageMeta(BaseModel):
    filename: str
    width: int
    height: int
    size_bytes: int
    url: str

class UpscaleResponseData(BaseModel):
    task_id: str
    scale: int = Field(..., ge=2, le=4)
    original: ImageMeta
    enhanced: ImageMeta
    inference_time_ms: int
    created_at: str
    expires_at: str

class ErrorDetail(BaseModel):
    code: str
    message: str

class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[ErrorDetail] = None
    timestamp: str
```

---

## 4. Rencana Endpoint Masa Depan (Post-MVP API Roadmap)

### 4.1 Pemrosesan Massal (Batch Upscale)
* **URL:** `/api/v1/batch/upscale`
* **Metode:** `POST`
* **Payload:** `multipart/form-data` dengan list `files[]` dan parameter `scale`.
* **Deskripsi:** Menghasilkan antrean `batch_id` yang dapat dipantau statusnya via polling atau WebSocket `/api/v1/batch/ws/{batch_id}`.

### 4.2 Restorasi Khusus (Specialized Restoration)
* **URL:** `/api/v1/enhance/advanced`
* **Metode:** `POST`
* **Parameter Tambahan:**
  * `face_restore`: `boolean` (Default: `false`)
  * `denoise_level`: `float` (Rentang: `0.0` s/d `1.0`)

### 4.3 Developer API Access (Programmatic Integration)
* **Autentikasi:** Header `Authorization: Bearer <API_KEY>`
* **Rate Limiting:** Header respon mencakup:
  * `X-RateLimit-Limit: 100`
  * `X-RateLimit-Remaining: 98`
  * `X-RateLimit-Reset: 1728300000`

