"use client";

import type { Palette, Swatch } from "../actions/extract";

interface SwatchGridProps {
  palette: Palette;
}

function SwatchCard({ swatch, label, role, derived }: { swatch: Swatch | null; label: string; role: string; derived?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 border border-black/5"
        style={{ background: swatch?.hex ?? "transparent" }}
      >
        {!swatch && (
          <div className="w-full h-full rounded-lg bg-[#f0f0f0] flex items-center justify-center">
            <span className="text-[10px] text-[#bbb]">—</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#333] leading-tight">{label}</span>
          {derived && <span className="text-[9px] text-[#aaa] border border-[#e0e0e0] px-1 rounded">derived</span>}
        </div>
        <div className="text-[10px] text-[#aaa] mt-0.5 leading-tight">{role}</div>
        {swatch && (
          <div className="text-[10px] font-mono text-[#888] mt-0.5">
            {swatch.hex.toUpperCase()}
            <span className="text-[#ccc] ml-1">
              {Math.round(swatch.hsl[0] * 360)}° {Math.round(swatch.hsl[1] * 100)}%S {Math.round(swatch.hsl[2] * 100)}%L
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SwatchGrid({ palette }: SwatchGridProps) {
  return (
    <div className="space-y-3">
      <SwatchCard swatch={palette.darkVibrant} label="Dark Vibrant" role="Dark mode header" />
      <SwatchCard swatch={palette.lightVibrant} label="Light Vibrant" role="Light mode header" derived={palette.lightModeIsDerived} />
    </div>
  );
}
