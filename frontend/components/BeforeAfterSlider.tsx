"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from "react-compare-slider";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  scale?: number;
  className?: string;
}

export default function BeforeAfterSlider({
  before,
  after,
  scale,
  className = "",
}: BeforeAfterSliderProps) {
  if (!before) return null;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl group select-none ${className}`}
    >
      {/* Floating Badge: Before (Original) */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none select-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-neutral-300 border border-white/10 shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        <span>Original</span>
      </div>

      {/* Floating Badge: After (Enhanced AI) */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none select-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-950/70 backdrop-blur-md text-purple-200 border border-purple-500/40 shadow-lg shadow-purple-950/40">
        <span>✨</span>
        <span>AI Enhanced {scale ? `(${scale}x)` : ""}</span>
      </div>

      {/* Interactive Helper Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none px-3 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-neutral-300 border border-white/10 shadow-md transition-opacity duration-300 opacity-80 group-hover:opacity-100 flex items-center gap-1.5">
        <span>↔</span>
        <span>Geser untuk membandingkan</span>
      </div>

      {/* Compare Slider */}
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={before}
            alt="Original Image"
            style={{
              objectFit: "contain",
              maxHeight: "560px",
              width: "100%",
            }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={after}
            alt="AI Enhanced Image"
            style={{
              objectFit: "contain",
              maxHeight: "560px",
              width: "100%",
            }}
          />
        }
        handle={
          <ReactCompareSliderHandle
            buttonStyle={{
              width: "42px",
              height: "42px",
              border: "2px solid rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              backgroundColor: "rgba(18, 18, 24, 0.85)",
              boxShadow:
                "0 0 16px rgba(168, 85, 247, 0.4), 0 4px 12px rgba(0, 0, 0, 0.6)",
              color: "#ffffff",
              cursor: "ew-resize",
            }}
            linesStyle={{
              width: "2px",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              boxShadow: "0 0 8px rgba(168, 85, 247, 0.45)",
            }}
          />
        }
        className="w-full h-auto flex items-center justify-center max-h-[560px]"
      />
    </div>
  );
}