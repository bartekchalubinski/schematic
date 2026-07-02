"use client";

interface HeaderPreviewProps {
  imageUrl: string;
  color: string | null;
  mode: "light" | "dark";
  isDerived: boolean;
}

export function HeaderPreview({
  imageUrl,
  color,
  mode,
  isDerived,
}: HeaderPreviewProps) {
  const baseBg = mode === "dark" ? "#0d0d0d" : "#ffffff";
  const textPrimary = mode === "dark" ? "#ffffff" : "#000000";
  const textSecondary = mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const chipBg = mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
  const chipText = mode === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)";
  const bodyBg = mode === "dark" ? "#111111" : "#f9f9f9";

  const headerStyle = color
    ? {
        background:
          mode === "dark"
            ? `linear-gradient(to bottom, ${color}cc, ${baseBg})`
            : `linear-gradient(to bottom, ${color}, ${baseBg})`,
      }
    : { background: baseBg };

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{
        borderColor: mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
        background: bodyBg,
      }}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-6" style={headerStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="coin"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: textSecondary }}>
              Coin
            </div>
            <div className="text-lg font-bold tracking-tight leading-none" style={{ color: textPrimary }}>
              COHERENCE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["12 Allocations", "8 Accepted", "$140.1M", "3d ago"].map((chip) => (
            <span
              key={chip}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: chipBg, color: chipText }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Body stub */}
      <div className="px-6 py-4">
        <div className="space-y-3">
          {[80, 65, 90].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{ background: mode === "dark" ? "#2a2a2a" : "#e8e8e8" }}
              />
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: `${w}%`,
                    background: mode === "dark" ? "#2a2a2a" : "#e8e8e8",
                  }}
                />
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${w * 0.6}%`,
                    background: mode === "dark" ? "#222" : "#f0f0f0",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Derived label */}
      {isDerived && (
        <div className="px-6 pb-3">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded"
            style={{
              background: mode === "dark" ? "rgba(255,200,0,0.1)" : "rgba(180,130,0,0.08)",
              color: mode === "dark" ? "rgba(255,200,0,0.7)" : "rgba(140,100,0,0.7)",
            }}
          >
            LightVibrant was null — fallback hue tint applied
          </span>
        </div>
      )}
    </div>
  );
}
