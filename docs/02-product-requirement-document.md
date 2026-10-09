# ItsKirei - Product Requirement Document (PRD) 📋

Dokumen ini mendefinisikan seluruh kebutuhan fungsional dan non-fungsional, cakupan rilis, batasan teknis, serta metrik keberhasilan untuk platform **ItsKirei**.

---

## 1. Ruang Lingkup Produk (Product Scope)

### 1.1 Tahap 1: MVP (Minimum Viable Product)
Fokus pada alur peningkatan resolusi gambar tunggal secara mandiri tanpa kewajiban autentikasi akun:

| Fitur MVP | Deskripsi Fungsional | Status Pengembangan |
| :--- | :--- | :--- |
| **Upload Image** | Fasilitas pengunggahan berkas gambar tunggal | 🚧 In Development |
| **AI Upscaling** | Eksekusi model inferensi deep learning super resolution | 🚧 In Development |
| **2x / 4x Enhancement** | Opsi pemilihan perbesaran dimensi target | 📋 Planned |
| **Before & After Comparison** | Komponen komparasi visual interaktif split-slider | 📋 Planned |
| **Download Result** | Ekspor dan unduh berkas hasil beresolusi tinggi | 📋 Planned |

### 1.2 Tahap 2: Rencana Fitur Masa Depan (Post-MVP)
* **Face Restoration:** Rekonstruksi detail anatomi wajah subjek foto secara realistis.
* **Noise Reduction:** Mereduksi *sensor noise* dan *compression artifacts*.
* **Old Photo Restoration:** Memperbaiki goresan, bintik noda, dan degradasi warna foto kuno.
* **Batch Processing:** Mengunggah hingga 10 gambar sekaligus dan memprosesnya secara massal.
* **User Account & Processing History:** Sistem autentikasi pengguna dan penyimpanan arsip hasil di cloud.
* **Developer API Access:** Endpoint publik untuk integrasi pemrosesan via skrip eksternal atau aplikasi pihak ketiga.

---

## 2. Kebutuhan Fungsional (Functional Requirements)

| ID | Kategori | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Input** | Pengguna dapat mengunggah berkas gambar melalui dialog file atau metode *drag-and-drop*. | P0 (MVP) |
| **FR-02** | **Validasi** | Sistem memvalidasi format (JPG, JPEG, PNG, WEBP), ukuran maksimal berkas (10 MB), dan resolusi maksimal (2048x2048 px). Berkas yang tidak valid ditolak dengan pesan yang jelas. | P0 (MVP) |
| **FR-03** | **Konfigurasi** | Pengguna dapat memilih opsi peningkatan resolusi: **2x** atau **4x**. Sistem menampilkan estimasi dimensi output sebelum pemrosesan. | P0 (MVP) |
| **FR-04** | **AI Processing** | Sistem mengirim gambar ke backend dan menjalankan model Super Resolution yang sesuai dengan skala terpilih. | P0 (MVP) |
| **FR-05** | **Feedback UI** | Antarmuka menampilkan indikator pemrosesan real-time (loading spinner / progress bar) selama inferensi berjalan. | P0 (MVP) |
| **FR-06** | **Review Hasil** | Pengguna dapat melihat hasil sebelum dan sesudah dengan komponen *split slider* yang dapat digeser secara mulus. | P0 (MVP) |
| **FR-07** | **Download** | Pengguna dapat mengunduh gambar hasil perbaikan dalam kualitas penuh dan format standar (PNG/JPG). | P0 (MVP) |
| **FR-08** | **AI Tambahan** | Pengguna dapat mengaktifkan opsi restorasi wajah (*Face Restoration*) dan pembersihan noise (*Noise Reduction*). | P1 (Future) |
| **FR-09** | **Batch Upscale** | Pengguna dapat mengunggah antrean multi-gambar dan mengunduh seluruh hasilnya dalam format ZIP. | P1 (Future) |
| **FR-10** | **Autentikasi** | Pengguna dapat mendaftar dan masuk menggunakan email/password atau OAuth (Google/GitHub). | P2 (Future) |
| **FR-11** | **Cloud History** | Pengguna terdaftar dapat meninjau galeri riwayat gambar yang pernah diproses sebelumnya. | P2 (Future) |
| **FR-12** | **API Keys** | Pengembang dapat membuat *API Key* untuk mengakses endpoint inferensi secara terprogram. | P2 (Future) |

---

## 3. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 3.1 Performa & Latensi (Performance)
* **Waktu Inferensi:** Waktu pemrosesan rata-rata pada GPU standar (misal: NVIDIA T4 / RTX 3060) ditargetkan **< 8 detik** untuk skala 2x dan **< 15 detik** untuk skala 4x pada gambar input resolusi standar (hingga 1080p).
* **Responsivitas Antarmuka:** Interaksi slider perbandingan sebelum dan sesudah harus berjalan dengan kecepatan $\ge 60$ FPS tanpa jeda input.

### 3.2 Antarmuka & Aksesibilitas (UI/UX)
* Desain antarmuka minimalis, elegan, dan rapi sesuai filosofi *Kirei*.
* Tata letak sepenuhnya responsif pada perangkat desktop, tablet, dan smartphone.
* Kompatibel dengan seluruh peramban modern (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### 3.3 Keamanan & Privasi Data (Security & Privacy)
* **Kebijakan Retensi File:** Pada fase MVP, berkas gambar yang diunggah dan dihasilkan hanya disimpan secara sementara di disk server dan otomatis dihapus setelah 1 jam (*Time-To-Live / TTL*).
* **Sanitasi File:** Sistem melakukan verifikasi *Magic Bytes* berkas untuk memitigasi serangan eksekusi berkas berbahaya.
* **Koneksi Aman:** Seluruh transmisi data antara klien dan server dienkripsi melalui protokol HTTPS.

### 3.4 Skalabilitas & Arsitektur
* Arsitektur modular yang memisahkan frontend statis dengan backend inferensi AI mandiri.
* Kemampuan fallback ke mode komputasi CPU apabila akselerasi GPU tidak terdeteksi di lingkungan server.

---

## 4. Metrik Keberhasilan (Success Metrics & KPIs)

1. **Inference Success Rate:** Rasio pemrosesan gambar yang berhasil tanpa kegagalan server $\ge 95\%$.
2. **Download Conversion Rate:** Persentase pengguna yang mengunduh hasil setelah melihat perbandingan preview $\ge 70\%$.
3. **P95 Latency:** 95% permintaan inferensi selesai di bawah batas waktu 20 detik.
4. **User Engagement:** Jumlah gambar yang ditingkatkan kualitasnya per sesi kunjungan pengguna.

---

## 5. Batasan & Asumsi Teknis (Assumptions & Constraints)

* **Ketergantungan Hardware:** Performa inferensi terbaik memerlukan akselerasi perangkat keras GPU dengan dukungan CUDA.
* **Batas Memori Grafis (VRAM):** Untuk mencegah galat *CUDA Out-of-Memory (OOM)*, gambar dengan resolusi di atas batas ambang harus diproses menggunakan teknik pemecahan ubin (*tiling*) atau dibatasi dimensi inputnya pada 2048x2048 piksel.
* **Transparansi Gambar:** Preservasi kanal alfa (*alpha channel*) pada berkas PNG harus dipisah sebelum inferensi tensor dan digabungkan kembali saat tahap *post-processing*.

