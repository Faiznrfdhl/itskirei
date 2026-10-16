"use client";

import BeforeAfterSlider from "@/components/BeforeAfterSlider";

interface ResultCardProps {
  preview: string;
  result: string;
  scale: number;
}

export default function ResultCard({
  preview,
  result,
  scale,
}: ResultCardProps) {
  if (!result) return null;

  return (
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
          className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-bold rounded-xl transition-colors shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <span>⬇️</span> Download Hasil Gambar
        </a>
      </div>

      {/* Container Preview Gambar Hasil */}
      <div className="flex justify-center items-center">
        <BeforeAfterSlider
          before={preview}
          after={result}
          scale={scale}
        />
      </div>
    </div>
  );
}

