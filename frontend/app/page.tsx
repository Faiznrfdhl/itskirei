"use client";

import { useState } from "react";
import { uploadImage, upscaleImage } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageId, setImageId] = useState("");
  const [scale, setScale] = useState(2);
  const [result, setResult] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  // 1. Memproses file yang dipilih dan membuat preview di FE
  function handleFileSelected(selectedFile?: File) {
    if (!selectedFile) return;

    // Validasi format (cek MIME type atau ekstensi file)
    const isImage =
      selectedFile.type.startsWith("image/") ||
      /\.(jpe?g|png|webp)$/i.test(selectedFile.name);

    if (!isImage) {
      setError("Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WebP.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("Ukuran gambar maksimal adalah 15 MB.");
      return;
    }

    setError("");
    setResult("");
    setImageId("");
    setFile(selectedFile);

    // Gunakan FileReader agar preview data URL langsung tampil pasti di browser
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(selectedFile);

    // Otomatis unggah ke server agar imageId langsung siap
    autoUpload(selectedFile);
  }

  // Auto-upload saat gambar dipilih
  async function autoUpload(fileToUpload: File) {
    try {
      setUploading(true);
      setError("");
      const data = await uploadImage(fileToUpload);
      setImageId(data.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengunggah gambar ke backend.";
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelected(droppedFile);
  }

  // 3. Eksekusi Upscale dengan AI
  async function handleUpscale() {
    if (!file) {
      setError("Silakan pilih gambar terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let currentId = imageId;
      // Jika upload belum selesai/gagal, coba upload lagi
      if (!currentId) {
        setUploading(true);
        const data = await uploadImage(file);
        currentId = data.id;
        setImageId(data.id);
        setUploading(false);
      }

      const data = await upscaleImage(currentId, scale);
      setResult(`${API_BASE_URL}${data.result_url}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memproses AI upscale.";
      setError(message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  function resetAll() {
    setFile(null);
    setPreview("");
    setImageId("");
    setResult("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex justify-center p-6 md:p-12">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            ItsKirei <span className="text-purple-400">✨</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            AI-powered Image Super Resolution • Tingkatkan Kualitas & Ketajaman Foto
          </p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/80 border border-red-700 text-red-200 rounded-xl text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-200 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Workflow Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* LANGKAH 1 & 2: Upload Gambar & Preview di FE */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-purple-600/30 text-purple-300 text-xs px-2.5 py-1 rounded-full font-bold">1</span>
                Upload & Preview
              </h2>
              {file && (
                <button
                  onClick={resetAll}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  Ganti Gambar
                </button>
              )}
            </div>

            {/* Kotak Upload / Preview Image */}
            <label
              htmlFor="image-upload"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl h-72 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden p-3 text-center relative ${
                isDragging
                  ? "border-purple-500 bg-purple-950/30"
                  : preview
                  ? "border-neutral-700 bg-neutral-950"
                  : "border-neutral-700 hover:border-neutral-500 bg-neutral-950/50"
              }`}
            >
              {preview ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <img
                    src={preview}
                    alt="Preview Asli"
                    className="max-h-60 max-w-full object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute bottom-1 bg-black/70 backdrop-blur-sm text-neutral-300 text-xs px-3 py-1 rounded-full">
                    Pratinjau Gambar Asli
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-neutral-400 p-6">
                  <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center text-2xl">
                    📁
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-200">Klik untuk upload gambar</p>
                    <p className="text-xs text-neutral-400 mt-1">atau seret (drag & drop) gambar ke sini</p>
                  </div>
                  <span className="text-[11px] text-neutral-500 border border-neutral-800 px-3 py-1 rounded-full">
                    JPG, PNG, atau WebP (Maks. 15 MB)
                  </span>
                </div>
              )}
            </label>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files?.[0])}
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
            />

            {/* Informasi File & Status Backend */}
            {file && (
              <div className="mt-4 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <div className="truncate max-w-[220px]">
                  <p className="font-medium text-neutral-200 truncate">{file.name}</p>
                  <p className="text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div>
                  {uploading ? (
                    <span className="text-yellow-400 font-medium">⏳ Mengunggah...</span>
                  ) : imageId ? (
                    <span className="text-emerald-400 font-medium bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800">
                      ✓ Siap Diproses
                    </span>
                  ) : (
                    <span className="text-red-400">Gagal Simpan</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* LANGKAH 3: Upscale Gambar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-600/30 text-purple-300 text-xs px-2.5 py-1 rounded-full font-bold">2</span>
                <h2 className="text-xl font-semibold">Pengaturan Skala</h2>
              </div>

              <p className="text-sm text-neutral-400 mb-4">
                Pilih faktor perbesaran yang ingin diterapkan oleh model AI:
              </p>

              {/* Selector Skala */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setScale(2)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    scale === 2
                      ? "border-purple-500 bg-purple-950/40 text-white shadow-lg shadow-purple-950/50"
                      : "border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <p className="text-2xl font-bold">2x</p>
                  <p className="text-xs mt-1 text-neutral-400">Cepat & Tajam</p>
                </button>

                <button
                  type="button"
                  onClick={() => setScale(4)}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    scale === 4
                      ? "border-purple-500 bg-purple-950/40 text-white shadow-lg shadow-purple-950/50"
                      : "border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <p className="text-2xl font-bold">4x</p>
                  <p className="text-xs mt-1 text-neutral-400">Ultra High-Res</p>
                </button>
              </div>

              <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-400 space-y-1">
                <p>⚡ <b className="text-neutral-300">GPU Acceleration:</b> Didukung oleh Real-ESRGAN.</p>
                <p>🔍 Merekonstruksi detail tekstur dan menajamkan tepian piksel.</p>
              </div>
            </div>

            {/* Tombol Eksekusi Upscale */}
            <button
              onClick={handleUpscale}
              disabled={!file || loading || uploading}
              className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Memproses AI Super Resolution...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Upscale Gambar ({scale}x)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* LANGKAH 4 & 5: Preview Hasil Scaling & Download */}
        {result && (
          <div className="mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>🎉</span> Hasil Upscale Berhasil!
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Resolusi gambar telah ditingkatkan {scale}x lipat dengan teknologi AI.
                </p>
              </div>

              {/* Tombol Download Utama */}
              <a
                href={result}
                download={`itskirei_enhanced_${scale}x.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl transition-colors shadow-lg flex items-center gap-2"
              >
                <span>⬇️</span> Download Hasil Gambar
              </a>
            </div>

            {/* Container Preview Gambar Hasil */}
            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 flex justify-center items-center min-h-[300px]">
              <img
                src={result}
                alt="Hasil Upscale AI"
                className="max-h-[600px] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}