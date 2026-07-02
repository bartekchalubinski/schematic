"use client";

import type { Palette } from "../actions/extract";

interface CodeViewProps {
  palette: Palette;
}

export function CodeView({ palette }: CodeViewProps) {
  const data = {
    extracted: {
      vibrant: palette.vibrant?.hex ?? null,
      darkVibrant: palette.darkVibrant?.hex ?? null,
      lightVibrant: palette.lightVibrant?.hex ?? null,
      muted: palette.muted?.hex ?? null,
      darkMuted: palette.darkMuted?.hex ?? null,
      lightMuted: palette.lightMuted?.hex ?? null,
    },
    applied: {
      darkMode: palette.darkModeColor,
      lightMode: palette.lightModeColor,
      lightModeSource: palette.lightModeIsDerived
        ? "derived — LightVibrant was null; fallback: hsl(H, 18%, 95%)"
        : "LightVibrant swatch",
    },
    pipeline: {
      step1: "Fetch image buffer",
      step2: "sharp.resize(150, 150) — reduces pixel count by ~95%",
      step3: "Vibrant.from(buffer).getPalette() via node-vibrant/node",
      step4: "Store { darkModeColor, lightModeColor } in DB alongside coin record",
      step5: "Every page load reads from DB — zero extraction overhead",
    },
  };

  return (
    <div className="rounded-xl border border-[#e8e8e8] bg-[#fafafa] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e8e8e8] flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-[#aaa] font-mono ml-1">palette-result.json</span>
      </div>
      <pre className="p-4 text-[11px] font-mono text-[#444] overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
