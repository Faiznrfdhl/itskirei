# ItsKirei - System Architecture Document 🏗️

Dokumen ini menjelaskan arsitektur teknis sistem **ItsKirei**, mencakup struktur komponen, pemilihan teknologi (*Tech Stack*), alur *pipeline* inferensi kecerdasan buatan (*AI Inference Pipeline*), pengelolaan memori perangkat keras, serta strategi *deployment* berbasis *cloud*.

---

## 1. Gambaran Umum Arsitektur (High-Level Architecture)

ItsKirei mengadopsi arsitektur terpisah (*Decoupled Client-Server Architecture*) yang memisahkan antarmuka pengguna (*Frontend*) dengan pemrosesan komputasi kecerdasan buatan (*Backend & AI Engine*). Pemisahan ini memastikan UI tetap responsif dan memungkinkan skalabilitas beban kerja inferensi secara mandiri.

```mermaid
flowchart TB
    subgraph ClientLayer ["1. Client / Presentation Layer"]
        WebBrowser["Web Browser (User)"]
        UI["Next.js / React Frontend<br/>- Upload Dropzone<br/>- Comparison Slider<br/>- Settings Selector"]
    end

    subgraph APILayer ["2. API & Application Layer"]
        APIGateway["FastAPI Gateway (Uvicorn ASGI)"]
        Validator["Request & File Validator<br/>(MIME, Size, Dimension)"]
        TaskHandler["Task & Inference Dispatcher"]
    end

    subgraph AIEngineLayer ["3. AI & Deep Learning Layer"]
        PreProcessor["Image Pre-processor<br/>(Color Space, Tensor Conversion, Tiling)"]
        ModelCore["Super Resolution Engine (PyTorch)<br/>- Real-ESRGAN / SwinIR<br/>- Weights: 2x / 4x Scale"]
        PostProcessor["Image Post-processor<br/>(De-tensor, Format Encoding)"]
    end

    subgraph StorageLayer ["4. Storage & Cache Layer"]
        TempDisk["Temporary Local / Cloud Storage<br/>(Retention TTL: 1 Jam)"]
        CleanupService["Auto-cleanup Background Worker"]
    end

    WebBrowser <-->|"HTTPS / REST API"| UI
    UI <-->|"Multipart Form / JSON"| APIGateway
    APIGateway --> Validator
    Validator --> TaskHandler
    TaskHandler --> PreProcessor
    PreProcessor --> ModelCore
    ModelCore --> PostProcessor
    PostProcessor --> TempDisk
    CleanupService -.->|"Hapus File Kedaluwarsa"| TempDisk
    TempDisk -.->|"Serve Image Output"| APIGateway
```

---

## 2. Pemilihan Teknologi (Tech Stack)

| Lapisan (Layer) | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Frontend** | **Next.js / React (TypeScript)** | Kinerja cepat, ekosistem UI kaya, penanganan interaktivitas modern (*client-side canvas/slider*). |
| **Styling** | **Tailwind CSS + Lucide Icons** | Desain fleksibel, modern, konsisten, dan ringan sesuai prinsip estetika *Kirei*. |
| **Backend API** | **Python FastAPI + Uvicorn** | Ekosistem native AI/Python, performa asinkron tinggi (ASGI), validasi otomatis via Pydantic, dokumentasi Swagger bawaan. |
| **Deep Learning Framework** | **PyTorch & TorchVision** | Standar industri untuk computer vision & deep learning, dukungan akselerasi CUDA, optimasi komputasi tensor. |
| **AI Model Super Resolution** | **Real-ESRGAN / SwinIR** | Menghasilkan rekonstruksi tekstur realistis pada gambar dunia nyata (*real-world images*) tanpa artefak berlebih. |
| **Image Processing Library** | **OpenCV (cv2) & Pillow (PIL)** | Manipulasi kanal warna (RGB/BGR/Alpha), resizing bicubic/lanczos, dan encoding kualitas tinggi. |
| **Deployment / Container** | **Docker & NVIDIA Container Toolkit** | Portabilitas antar lingkungan (lokal maupun cloud) dengan dukungan passthrough GPU CUDA. |

---

## 3. Pipeline Pemrosesan Citra AI (How It Works)

Bagian ini merinci alur kerja di balik layar (*How It Works*) ketika sebuah gambar diproses oleh sistem:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Browser)
    participant Front as Frontend (React)
    participant Back as Backend (FastAPI)
    participant Engine as AI Pipeline (PyTorch)
    participant Disk as Storage Sementara

    User->>Front: Upload Gambar & Pilih Skala (2x/4x)
    Front->>Back: POST /api/v1/upscale (file, scale)
    Back->>Back: Validasi Header, Format, & Batas Ukuran
    Back->>Engine: Inisialisasi Tensor & Pre-processing
    Note over Engine: Konversi RGB -> Tensor Normalisasi [0, 1]<br/>Penanganan Alpha Channel (Transparansi)
    Engine->>Engine: Inferensi Model Super Resolution (CUDA/CPU)
    Note over Engine: Eksekusi Model Real-ESRGAN x2 / x4<br/>Rekonstruksi Detail & Penajaman Piksel
    Engine->>Engine: Post-processing (Denormalisasi -> Output Matriks)
    Engine->>Disk: Simpan Hasil (UUID_output.png)
    Disk-->>Back: Path File Hasil
    Back-->>Front: 200 OK (JSON: image_url, original_res, target_res, process_time)
    Front->>User: Render Slider Interaktif Before/After
```

### Tahapan Detail Pipeline:
1. **Sanitasi & Validasi Input:**
   * Memeriksa *Magic Bytes* berkas untuk memverifikasi format gambar asli (mencegah eksploitasi file ekstensi palsu).
   * Verifikasi batas resolusi maksimum (maksimal input 2048x2048 px untuk menjaga stabilitas VRAM GPU).
2. **Pre-processing:**
   * Ekstraksi kanal transparansi (*Alpha Channel*) jika file berformat PNG transparan.
   * Konversi matriks piksel menjadi Tensor PyTorch dengan rentang float $[0, 1]$.
   * Jika gambar besar mendekati batas VRAM, sistem menerapkan teknik *Tiling* (membagi gambar menjadi beberapa patch kecil dengan overlap padding).
3. **Model Inference (Super Resolution):**
   * Pemilihan bobot model (*model weights*) sesuai parameter pengguna: `RealESRGAN_x2plus.pth` atau `RealESRGAN_x4plus.pth`.
   * Eksekusi komputasi menggunakan `torch.inference_mode()` untuk menghemat alokasi memori grafis.
4. **Post-processing:**
   * Penggabungan kembali hasil inferensi (*de-tiling/blending*).
   * Rekonstruksi kembali kanal alfa jika ada.
   * Encoding hasil akhir ke format lossless PNG atau high-quality JPEG.
5. **Storage & Delivery:**
   * File disimpan dengan penamaan berbasis UUID acak (`uploads/<uuid>_enhanced.png`).
   * Mengirimkan URL akses publik/sementara ke antarmuka klien.

---

## 4. Gambaran Kontrak API (API Contract Overview)

Sistem mengimplementasikan antarmuka REST API asinkron. Detail skema payload, kode respons, dan model data Pydantic didokumentasikan secara lengkap pada [04-api-specification.md](file:///d:/code/itskirei/docs/04-api-specification.md).

* **`POST /api/v1/upscale`:** Menerima multipart/form data (`file` dan `scale`), mengeksekusi inferensi AI, dan mengembalikan tautan serta metadata hasil.
* **`GET /api/v1/health`:** Endpoint pemantauan kesiapan GPU CUDA, pemakaian VRAM, dan status model AI.
* **`GET /static/temp/{filename}`:** Menyajikan berkas gambar hasil olahan dengan batas kedaluwarsa.

---

## 5. Manajemen Hardware & Optimasi Memori (VRAM Management)

Deep learning super resolution membutuhkan alokasi memori grafis (VRAM) yang intensif. Arsitektur ItsKirei menerapkan strategi proteksi berikut:

1. **Inference Mode & No Gradient:** Menggunakan `torch.no_grad()` / `torch.inference_mode()` untuk mencegah komputasi graf backward pass yang tidak diperlukan.
2. **Cache Flushing:** Memanggil `torch.cuda.empty_cache()` setelah inferensi selesai guna mengembalikan blok memori yang tidak terpakai ke sistem.
3. **Patch Tiling Mechanism:** Untuk gambar berdimensi tinggi, proses inferensi dipecah menjadi beberapa ubin kecil (*tiles*) berukuran misal $512 \times 512$ dengan padding agar tidak melebihi kapasitas VRAM 4GB/6GB/8GB.
4. **Fallback Mode (CPU Execution):** Apabila sistem dijalankan pada server tanpa dedicated GPU, sistem secara otomatis beralih ke backend CPU dengan peringatan estimasi waktu proses yang lebih tinggi.

---

## 6. Keamanan & Siklus Hidup File (Security & File Lifecycle)

* **Generasi Nama Unik (UUID):** Nama file asli yang diunggah oleh pengguna tidak disimpan langsung di sistem file server untuk mencegah *path traversal attacks*.
* **Isolasi Berkas:** Direktori penyimpanan sementara dipisahkan dari direktori kode sumber aplikasi.
* **Mekanisme Pembersihan Otomatis (*Auto-cleanup Cron*):**
  * Latar belakang worker menjalankan pengecekan setiap 15 menit.
  * Berkas sementara yang memiliki usia (*timestamp*) lebih dari 1 jam akan dihapus secara permanen dari disk.
* **CORS & Rate Limiting:** Pembatasan domain asal (*Allowed Origins*) dan pembatasan frekuensi pemanggilan request untuk mencegah eksploitasi beban GPU.

---

## 7. Desain Arsitektur Masa Depan (Post-MVP Roadmap)

```mermaid
flowchart LR
    subgraph Client ["Client Apps"]
        WebUI["Web App"]
        ThirdParty["Developer Third-Party"]
    end

    subgraph Gateway ["API Gateway"]
        AuthService["Auth & Rate Limiter<br/>(JWT & API Keys)"]
    end

    subgraph Queue ["Message Broker & Queue"]
        RedisQueue["Redis Task Queue"]
    end

    subgraph Workers ["Scalable AI Worker Nodes"]
        Worker1["GPU Worker 1<br/>(Super Resolution)"]
        Worker2["GPU Worker 2<br/>(Face Restoration / GFPGAN)"]
        Worker3["GPU Worker 3<br/>(Old Photo Restoration)"]
    end

    subgraph Storage ["Cloud Infrastructure"]
        S3Bucket["AWS S3 / Cloudflare R2"]
        DB["PostgreSQL (User & History)"]
    end

    Client --> Gateway
    Gateway --> Queue
    Queue --> Workers
    Workers --> Storage
```

1. **Secondary AI Pipelines:** Integrasi model **GFPGAN / CodeFormer** untuk fitur *Face Restoration*, dieksekusi berurutan setelah tahap super resolution.
2. **Distributed Queue (Celery / Redis):** Menghubungkan gateway dengan kumpulan worker GPU terpisah untuk mendukung pemrosesan massal (*Batch Processing*) tanpa memblokir request HTTP.
3. **Database & Cloud Storage:** Penggunaan PostgreSQL untuk menyimpan relasi akun dan riwayat proses, serta AWS S3/Cloudflare R2 untuk penyimpanan hasil gambar jangka panjang bagi pengguna terdaftar.

