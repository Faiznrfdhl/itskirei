# ItsKirei - UI/UX Design System & Layout Document 🎨

Dokumen ini menetapkan spesifikasi desain antarmuka (*UI Design System*), panduan token visual, interaksi komponen, tata letak (*layout wireframe*), serta perilaku responsif untuk aplikasi web **ItsKirei**.

---

## 1. Filosofi Desain (Design Philosophy)

Sesuai filosofi namanya, **Kirei (きれい)** (*cantik, bersih, dan anggun*), antarmuka ItsKirei mengedepankan:
* **Clutter-free & Focused:** Tata letak minimalis tanpa elemen visual yang mengalihkan perhatian dari tujuan utama: peningkatan kualitas gambar.
* **Modern AI Aesthetics:** Memadukan tema gelap elegan (*Dark Canvas*) dengan aksen gradasi neon ungu-indigo yang lembut untuk memberi kesan teknologi AI mutakhir.
* **Instant Gratification:** Umpan balik visual yang cepat, transisi halus (*smooth micro-interactions*), dan perbandingan instan yang memperlihatkan keajaiban super resolution.

---

## 2. Token Desain (Design Tokens)

### 2.1 Palet Warna (Color Palette)

| Kategori | Hex Code | Kelas Tailwind | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#0B0F19` | `bg-slate-950` | Latar belakang utama halaman aplikasi |
| **Surface Card** | `#131C2E` | `bg-slate-900/90` | Panel kartu komponen upload & pratinjau |
| **Surface Elevated** | `#1E293B` | `bg-slate-800` | Komponen tombol sekunder, toggle pill |
| **Border / Divider** | `#334155` | `border-slate-700` | Garis batas dropzone dan garis pembatas |
| **Primary Accent** | `#6366F1` | `bg-indigo-500` | Tombol CTA utama, status aktif, sorotan |
| **Secondary Accent** | `#8B5CF6` | `bg-purple-500` | Gradasi aksen AI, ikon kilauan (*sparkles*) |
| **Text Primary** | `#F8FAFC` | `text-slate-50` | Judul utama (*Heading*) dan teks penting |
| **Text Secondary** | `#94A3B8` | `text-slate-400` | Deskripsi, petunjuk bantuan, label metadata |
| **Success Status** | `#10B981` | `text-emerald-500` | Notifikasi proses berhasil, status siap unduh |
| **Error / Alert** | `#F43F5E` | `text-rose-500` | Pesan validasi salah, kegagalan unggah |

### 2.2 Tipografi (Typography)
* **Font Family:** `Inter`, `Plus Jakarta Sans`, atau `sans-serif` sistem modern.
* **Hierarki Teks:**
  * **Brand / Hero Title:** `text-3xl font-extrabold tracking-tight` (Desktop: `text-4xl`)
  * **Section Heading:** `text-xl font-bold text-slate-100`
  * **Body Text:** `text-base font-normal text-slate-300 leading-relaxed`
  * **Caption / Meta:** `text-xs font-medium text-slate-400`

### 2.3 Efek Permukaan (Elevation & Glassmorphism)
* **Glass Card:** `backdrop-blur-md bg-slate-900/70 border border-slate-800/80 shadow-2xl`
* **Glow Effect (CTA Button):** `shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all`

---

## 3. Spesifikasi Komponen Inti (Key UI Components)

### 3.1 Dropzone Unggah Gambar (Upload Dropzone)
* **Bentuk:** Kontainer dengan border putus-putus (`border-dashed border-2 border-slate-700 hover:border-indigo-500`).
* **Kondisi Drag-Over:** Berubah warna latar menjadi semburat indigo transparan (`bg-indigo-500/10`) dengan animasi denyut halus.
* **Isi Dropzone:**
  * Ikon awan unggah (`UploadCloud` dari Lucide Icons) dengan lingkaran gradasi.
  * Teks ajakan: *"Seret dan lepas gambar di sini, atau klik untuk memilih"*.
  * Teks petunjuk format: *"Mendukung JPG, PNG, WEBP (Maks 10MB)"*.

### 3.2 Pemilih Skala (Scale Selector Segmented Control)
* **Komponen:** Tombol kapsul berdampingan (*segmented pill*).
  * Opsi 1: `[ 2x Standard ]` (Direkomendasikan untuk pemrosesan cepat).
  * Opsi 2: `[ 4x Ultra Kirei ]` (Hasil resolusi maksimal untuk cetak/detail mikro).
* **Feedback:** Efek visual aktif dengan latar gradasi indigo-violet dan indikator resolusi output (contoh: `640x480` $\rightarrow$ `2560x1920`).

### 3.3 Indikator Status Pemrosesan (Processing / Loading State)
* Komponen animasi lingkaran berputar (*spinner*) dikombinasikan dengan efek kilau (*pulsing glow*).
* Teks tahapan yang dinamis:
  * `[1/3] Mengunggah berkas gambar...`
  * `[2/3] Menerapkan AI Super Resolution...`
  * `[3/3] Menyelesaikan detail akhir...`

### 3.4 Slider Komparasi Interaktif (Interactive Comparison Slider)
* **Struktur:** Kontainer dua lapisan gambar dengan posisi bertumpuk (*absolute overlay*).
* **Handle Pemisah:** Garis vertikal putih setebal 2px dengan tombol pegangan bulat (*grab handle*) di tengah yang memiliki ikon panah kiri-kanan (`↔`).
* **Label Mengambang:**
  * Label kiri: Badge semitransparan *"Before (Original)"*.
  * Label kanan: Badge semitransparan *"After (Kirei 4x)"*.
* **Interaksi Pengguna:**
  * Mendukung drag mouse pada desktop dan *touch gesture swipe* pada perangkat layar sentuh.
  * Tombol kontrol pembantu: Fitur perbesaran (*Zoom/Inspect Mode*) dan tombol layar penuh (*Fullscreen*).

### 3.5 Action Bar & Ekspor
* **Tombol Utama (Primary):** Tombol penuh gaya gradasi indigo-purple dengan teks *"Download Enhanced Image (PNG)"*.
* **Tombol Sekunder (Secondary):** Tombol garis tipis (*ghost button*) *"Upload Gambar Lain"* dengan ikon putar balik (*Refresh*).

---

## 4. Rancang Tata Letak Halaman (Page Wireframe)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [✨ ItsKirei]                     Docs   GitHub   [Status: AI Online] │  <-- Navbar
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                       Transform Low-Res Images                         │
│                    Into Clear, Beautiful Visuals                       │  <-- Hero Header
│           Super-resolution AI technology to upscale by 2x & 4x         │
│                                                                        │
│        ┌──────────────────────────────────────────────────────┐        │
│        │                                                      │        │
│        │               [ ☁️ UploadCloud Icon ]                 │        │
│        │                                                      │        │
│        │         Seret & Lepas Gambar ke Sini                 │        │  <-- Active
│        │            atau Klik untuk Memilih                   │        │      Workspace
│        │                                                      │        │      / Dropzone
│        │        Format: JPG, PNG, WEBP • Maksimal 10MB        │        │
│        │                                                      │        │
│        └──────────────────────────────────────────────────────┘        │
│                                                                        │
│              [ Skala: (•) 2x Standard   ( ) 4x Ultra ]                 │  <-- Settings
│                                                                        │
│                    [ ✨ Enhance Image (Mulai Proses) ]                │  <-- CTA Button
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                     [ TAMPILAN SESUDAH PROSES ]                        │
│                                                                        │
│        ┌──────────────────────────┬───────────────────────────┐        │
│        │ [Before: 640x480]        │ [After: 2560x1920 ✨]     │        │  <-- Interactive
│        │                          │                           │        │      Split-Slider
│        │    (Original Pixelated)  │   (Reconstructed Sharp)   │        │
│        │                          │                           │        │
│        └──────────────────────────┴───────────────────────────┘        │
│                                   ▲                                    │
│                              [ <  │  > ]                               │
│                                                                        │
│            [ ⬇️ Download Enhanced Image ]   [ 🔄 Enhance Another ]     │  <-- Actions
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  ItsKirei ✨ • Powered by Deep Learning • Built with FastAPI & React  │  <-- Footer
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Tata Letak Responsif & Breakpoints (Responsive Layout)

* **Mobile Viewport (`< 640px`):**
  * Padding kontainer diperkecil menjadi `px-4`.
  * Ukuran dropzone menyesuaikan tinggi minimal layar sentuh (`min-h-[220px]`).
  * Slider perbandingan tetap responsif menggunakan event sentuh `onTouchMove`.
  * Tombol aksi tersusun vertikal (*stacked full-width buttons*).
* **Tablet Viewport (`640px - 1024px`):**
  * Dropzone memiliki lebar terpusat maksimal `max-w-xl`.
  * Tombol aksi sejajar horizontal.
* **Desktop Viewport (`> 1024px`):**
  * Lebar kontainer utama `max-w-4xl` atau `max-w-5xl`.
  * Slider perbandingan dapat menampilkan gambar ukuran besar dengan rasio aspek asli tanpa pemotongan (*contain object-fit*).

---

## 6. Aksesibilitas & Standar UI (Accessibility / A11y)

1. **Rasio Kontras:** Seluruh teks teks utama dan tombol aksi memenuhi standar **WCAG AA** dengan rasio kontras minimal 4.5:1 terhadap latar belakang gelap.
2. **Navigasi Keyboard:** Dropzone dapat difokuskan menggunakan tombol `Tab` dan dibuka dengan tombol `Enter` atau `Space`.
3. **Screen Reader Support:** Komponen slider menyertakan atribut `aria-label="Image comparison slider"` dan `aria-valuenow` untuk mengindikasikan posisi perbandingan.

