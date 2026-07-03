"use client";

interface HeaderPreviewProps {
  imageUrl: string;
  color: string | null;
  mode: "light" | "dark";
  isDerived: boolean;
}

const MESSAGES = [
  { user: "pixelpioneer", side: "left",  text: "My first objective is to win the race. My second objective is to corrupt the race", meta: "44.1M · 1.5x · to avagrace" },
  { user: "designmaven",  side: "left",  text: "Creating with purpose, inspiring a movement of change", meta: "27.4M · 1.8x · to moveforward" },
  { separator: "Tuesday" },
  { user: "avagrace",     side: "right", text: "Count me in! I'm excited to be part of this journey and can't wait to see what unfolds.", meta: "44.1M · 1.5x · from pixelpioneer" },
  { separator: "Wednesday" },
  { user: "codecrusader", side: "left",  text: "Innovation fuels my journey, disruption shapes my legacy", meta: "32.9M · 2.3x · to raceonfire" },
  { user: "designmuse",   side: "right", text: "Bringing vibrant creativity and fresh ideas to elevate our shared vision boldly.", meta: "29.9M · 1.8x · from artsyguru" },
  { user: "techtrailblz", side: "left",  text: "Breaking barriers, coding the future of innovation", meta: "50.2M · 2.0x · to nextgen" },
] as const;

export function HeaderPreview({ imageUrl, color, mode, isDerived }: HeaderPreviewProps) {
  const dk = mode === "dark";

  const tokens = {
    panelBg:         dk ? "#1a1a1a" : "#ffffff",
    containerBg:     dk ? "#262626" : "#f7f7f7",
    primary:         dk ? "#ffffff" : "#1a1a1a",
    secondary:       dk ? "#b2b2b2" : "#999999",
    tertiary:        dk ? "#6e6e6e" : "#c4c4c4",
    bubbleSelf:      dk ? "#262626" : "#f7f7f7",
    bubbleOther:     dk ? "#1a1a1a" : "#ffffff",
    bubbleBorderOth: dk ? "#262626" : "#f7f7f7",
    chipFill:        dk ? "rgba(255,255,255,0.2)"   : "rgba(242,242,242,0.5)",
    chipBorder:      dk ? "rgba(255,255,255,0.2)"   : "rgba(229,229,229,0.25)",
    subtitleColor:   dk ? "rgba(255,255,255,0.6)"   : "rgba(0,0,0,0.4)",
    fadeRgb:         dk ? "26,26,26"                : "255,255,255",
    avatarBg:        dk ? "#6e6e6e"                 : "#c4c4c4",
  };

  // Header gradient — radial glow from extracted color, fading into base
  const headerGradient = color
    ? `radial-gradient(ellipse 160% 280% at 55% -5%, ${color}cc 0%, ${color}55 35%, transparent 65%), ${tokens.panelBg}`
    : tokens.panelBg;

  // Top scroll-fade: solid bg at top → transparent at bottom (messages disappear under header)
  const topFade = `linear-gradient(to bottom, rgba(${tokens.fadeRgb},0.97) 0%, rgba(${tokens.fadeRgb},0.6) 60%, transparent 100%)`;

  // Bottom compose-fade: transparent at top → solid bg at bottom
  const bottomFade = `linear-gradient(to top, rgba(${tokens.fadeRgb},0.97) 0%, rgba(${tokens.fadeRgb},0.6) 60%, transparent 100%)`;

  return (
    <div
      className="relative rounded-[22px] overflow-hidden"
      style={{ background: tokens.panelBg, height: 520, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ─── SCROLLABLE CHAT FEED ─── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ paddingTop: 92, paddingBottom: 100, paddingLeft: 48, paddingRight: 48 }}
      >
        <div className="flex flex-col gap-4 pt-3">
          {MESSAGES.map((m, i) => {
            if ("separator" in m) {
              return (
                <div key={i} className="text-center text-[10px]" style={{ color: tokens.tertiary }}>
                  {m.separator}
                </div>
              );
            }
            const isLeft = m.side === "left";
            return (
              <div key={i} className={`flex gap-3 items-end ${isLeft ? "" : "flex-row-reverse"}`}>
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full shrink-0"
                  style={{ background: tokens.avatarBg }}
                />
                <div className={`flex flex-col gap-1.5 max-w-[55%] ${isLeft ? "items-start" : "items-end"}`}>
                  <div className="text-[10px]" style={{ color: tokens.secondary, paddingLeft: isLeft ? 10 : 0, paddingRight: isLeft ? 0 : 10 }}>
                    {m.user}
                  </div>
                  <div
                    className="px-3 py-2 rounded-[10px] text-[12px] leading-[16px]"
                    style={{
                      background: isLeft ? tokens.bubbleOther : tokens.bubbleSelf,
                      border: `1.2px solid ${isLeft ? tokens.bubbleBorderOth : tokens.containerBg}`,
                      color: tokens.primary,
                    }}
                  >
                    {m.text}
                  </div>
                  <div className="text-[10px] px-2.5" style={{ color: tokens.secondary }}>
                    {m.meta}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── TOP SCROLL FADE (header/content boundary) ─── */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-20"
        style={{ top: 0, height: 116, background: topFade }}
      />

      {/* ─── HEADER — layer 1: color gradient background ─── */}
      <div
        className="absolute top-0 left-0 right-0 z-30"
        style={{ height: 92, background: headerGradient }}
      />

      {/* ─── HEADER — layer 2: coin info ─── */}
      <div
        className="absolute top-0 left-0 right-0 z-40 flex items-center gap-3"
        style={{ padding: "18px 22px" }}
      >
        {/* Coin image */}
        <div className="shrink-0 rounded-[8px] overflow-hidden shadow-sm" style={{ width: 48, height: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="coin" className="w-full h-full object-cover" />
        </div>

        {/* Metadata */}
        <div className="flex flex-col justify-between" style={{ gap: 8 }}>
          {/* Top row: name + subtitle */}
          <div className="flex items-end gap-2">
            <span
              className="font-semibold leading-none"
              style={{ fontSize: 18, letterSpacing: -0.018, color: tokens.primary }}
            >
              COHERENCE
            </span>
            <span
              className="text-[11px] leading-none pb-px"
              style={{ color: tokens.subtitleColor }}
            >
              Catastrophic Dimensional Collapse
            </span>
          </div>

          {/* Bottom row: chips */}
          <div className="flex items-center gap-2">
            {["12 Allocations", "8 Accepted", "$140.1M", "Es9v...MFrz", "3d ago"].map((chip) => (
              <div
                key={chip}
                className="text-[10px] font-medium px-2 py-1 rounded-[7px]"
                style={{
                  background: tokens.chipFill,
                  border: `0.4px solid ${tokens.chipBorder}`,
                  color: tokens.secondary,
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  boxShadow: "0px 1px 1px rgba(0,0,0,0.05)",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM FADE ─── */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none z-20"
        style={{ height: 100, background: bottomFade }}
      />

      {/* ─── COMPOSE BAR ─── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex flex-col gap-2"
        style={{ padding: "10px 22px 14px" }}
      >
        <div className="flex gap-2">
          <div
            className="flex-1 h-[38px] rounded-[10px] flex items-center px-3"
            style={{
              background: tokens.chipFill,
              border: `0.4px solid ${tokens.chipBorder}`,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              boxShadow: "0px 1px 1px rgba(0,0,0,0.05)",
            }}
          >
            <span className="text-[11px]" style={{ color: tokens.secondary }}>
              Supply Control · <span style={{ color: tokens.primary }}>COHERENCE</span>
            </span>
          </div>
          <div
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: tokens.chipFill,
              border: `0.4px solid ${tokens.chipBorder}`,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              boxShadow: "0px 1px 1px rgba(0,0,0,0.05)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke={tokens.secondary} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px]" style={{ color: tokens.secondary }}>44.1M Allocation Balance</span>
          <span className="text-[10px]" style={{ color: tokens.secondary }}>4.1M Allocated · 4 Allocators</span>
        </div>
      </div>

      {/* Derived color notice */}
      {isDerived && (
        <div className="absolute top-2 right-2 z-50">
          <span
            className="text-[9px] font-medium px-2 py-0.5 rounded-[4px]"
            style={{
              background: "rgba(255,180,0,0.15)",
              color: "rgba(180,120,0,0.9)",
              border: "0.5px solid rgba(180,120,0,0.2)",
            }}
          >
            derived tint
          </span>
        </div>
      )}
    </div>
  );
}
