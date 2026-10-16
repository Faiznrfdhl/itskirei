"use client";

interface ScaleCardProps {
  scale: number;
  onSelectScale: (scale: number) => void;
  onUpscale: () => void;
  loading: boolean;
  disabled: boolean;
}

export default function ScaleCard({
  scale,
  onSelectScale,
  onUpscale,
  loading,
  disabled,
}: ScaleCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-purple-600/30 text-purple-300 text-xs px-2.5 py-1 rounded-full font-bold">
            2
          </span>
          <h2 className="text-xl font-semibold">Pengaturan Skala</h2>
        </div>

        <p className="text-sm text-neutral-400 mb-4">
          Pilih faktor perbesaran yang ingin diterapkan oleh model AI:
        </p>

        {/* Selector Skala */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => onSelectScale(2)}
            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
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
            onClick={() => onSelectScale(4)}
            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
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
          <p>
            ⚡ <b className="text-neutral-300">GPU Acceleration:</b> Didukung oleh Real-ESRGAN.
          </p>
          <p>🔍 Merekonstruksi detail tekstur dan menajamkan tepian piksel.</p>
        </div>
      </div>

      {/* Tombol Eksekusi Upscale */}
      <button
        type="button"
        onClick={onUpscale}
        disabled={disabled}
        className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
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
  );
}

