"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/api";

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    try {
      setLoading(true);
      const data = await uploadImage(file);
      setResult(data);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
        }}
      />

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="px-4 py-2 rounded bg-black text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {result ? (
        <pre className="p-4 bg-neutral-900 rounded-lg overflow-x-auto text-sm text-neutral-200">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}