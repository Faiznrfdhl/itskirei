"use client";

import { useState } from "react";
import { uploadImage, upscaleImage } from "@/lib/api";
import UploadCard from "@/components/UploadCard";
import ScaleCard from "@/components/ScaleCard";
import ResultCard from "@/components/ResultCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [imageId, setImageId] = useState("");
  const [scale, setScale] = useState(2);
  const [result, setResult] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // 2. Eksekusi Upscale dengan AI
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
              className="text-red-400 hover:text-red-200 font-bold ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Workflow Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <UploadCard
            file={file}
            preview={preview}
            imageId={imageId}
            uploading={uploading}
            onFileSelected={handleFileSelected}
            onReset={resetAll}
          />

          <ScaleCard
            scale={scale}
            onSelectScale={setScale}
            onUpscale={handleUpscale}
            loading={loading}
            disabled={!file || loading || uploading}
          />
        </div>

        {/* Result & BeforeAfterSlider */}
        <ResultCard
          preview={preview}
          result={result}
          scale={scale}
        />
      </div>
    </main>
  );
}