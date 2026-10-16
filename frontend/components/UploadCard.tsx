"use client";

import { useState } from "react";

interface UploadCardProps {
  file: File | null;
  preview: string;
  imageId: string;
  uploading: boolean;
  onFileSelected: (file?: File) => void;
  onReset: () => void;
}

export default function UploadCard({
  file,
  preview,
  imageId,
  uploading,
  onFileSelected,
  onReset,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    onFileSelected(droppedFile);
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="bg-purple-600/30 text-purple-300 text-xs px-2.5 py-1 rounded-full font-bold">
            1
          </span>
          Upload & Preview
        </h2>
        {file && (
          <button
            onClick={onReset}
            className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
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
              alt="Pratinjau Gambar Asli"
              className="max-h-full max-w-full object-contain rounded-lg"
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
        onChange={(e) => onFileSelected(e.target.files?.[0])}
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
  );
}

