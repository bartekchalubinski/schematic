"use client";

import { useState, useCallback, useRef } from "react";
import { extractPalette, type Palette, type ExtractionMethod } from "../actions/extract";
import { HeaderPreview } from "./HeaderPreview";
import { SwatchGrid } from "./SwatchGrid";
import { CodeView } from "./CodeView";

type View = "preview" | "code";
type Mode = "light" | "dark";

const METHODS: { value: ExtractionMethod; label: string; description: string }[] = [
  { value: "vibrant", label: "Vibrant", description: "Semantic swatches — node-vibrant" },
  { value: "dominant", label: "Dominant", description: "Most pixels — k-means by count" },
  { value: "vivid", label: "Vivid", description: "Most saturated — k-means by chroma" },
];

export function Extractor() {
  const [palette, setPalette] = useState<Palette | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("dark");
  const [view, setView] = useState<View>("preview");
  const [method, setMethod] = useState<ExtractionMethod>("vibrant");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentImageBuffer = useRef<File | null>(null);

  const runExtraction = useCallback(async (file: File, m: ExtractionMethod) => {
    setPalette(null);
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    const result = await extractPalette(formData, m);
    setPalette(result);
    setLoading(false);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    currentImageBuffer.current = file;
    setImageUrl(URL.createObjectURL(file));
    await runExtraction(file, method);
  }, [method, runExtraction]);

  const handleMethodChange = useCallback(async (m: ExtractionMethod) => {
    setMethod(m);
    if (currentImageBuffer.current) await runExtraction(currentImageBuffer.current, m);
  }, [runExtraction]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const appliedColor =
    palette && (mode === "dark" ? palette.darkModeColor : palette.lightModeColor);

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans">
      {/* Top bar */}
      <header className="border-b border-[#e0e0e0] bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-black" />
          <span className="text-[13px] font-semibold tracking-tight text-black">schematic</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#aaa]">
          <span>node-vibrant 4.0.4</span>
          <span className="mx-1.5">·</span>
          <span>sharp</span>
          <span className="mx-1.5">·</span>
          <span>Next.js 15 TypeScript</span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-49px)]">
        {/* Left panel — upload + swatches */}
        <div className="w-72 flex-shrink-0 border-r border-[#e0e0e0] bg-white flex flex-col overflow-y-auto">
          {/* Drop zone */}
          <div className="p-4 border-b border-[#f0f0f0]">
            <button
              className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                dragging
                  ? "border-black bg-black/5"
                  : "border-[#e0e0e0] hover:border-[#bbb] bg-[#fafafa]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="uploaded"
                  className="w-full h-full object-contain rounded-xl p-2"
                />
              ) : (
                <>
                  <svg className="w-6 h-6 text-[#ccc]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span className="text-[11px] text-[#bbb] text-center px-4 leading-snug">
                    Drop an image or click to upload
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* Swatches */}
          <div className="p-4 flex-1">
            {loading && (
              <div className="flex items-center gap-2 text-[12px] text-[#aaa]">
                <div className="w-3 h-3 rounded-full border border-[#ccc] border-t-[#666] animate-spin" />
                Extracting palette…
              </div>
            )}
            {palette && !loading && (
              <>
                <div className="text-[10px] font-semibold text-[#bbb] uppercase tracking-widest mb-3">
                  Extracted Swatches
                </div>
                <SwatchGrid palette={palette} />
              </>
            )}
            {!palette && !loading && (
              <p className="text-[11px] text-[#ccc] leading-relaxed">
                Upload an image to extract its color palette.
              </p>
            )}
          </div>
        </div>

        {/* Right panel — preview + code */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Controls */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-[#e0e0e0] bg-white">
            {/* Method toggle */}
            <div className="flex items-center rounded-lg border border-[#e8e8e8] overflow-hidden text-[12px] font-medium">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleMethodChange(m.value)}
                  title={m.description}
                  className={`px-3 py-1.5 transition-colors ${
                    method === m.value ? "bg-black text-white" : "text-[#888] hover:text-black"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-[#e8e8e8]" />

            {/* Mode toggle */}
            <div className="flex items-center rounded-lg border border-[#e8e8e8] overflow-hidden text-[12px] font-medium">
              {(["dark", "light"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 capitalize transition-colors ${
                    mode === m ? "bg-black text-white" : "text-[#888] hover:text-black"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-[#e8e8e8] overflow-hidden text-[12px] font-medium">
              {(["preview", "code"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 capitalize transition-colors ${
                    view === v ? "bg-black text-white" : "text-[#888] hover:text-black"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Applied color chip */}
            {appliedColor && (
              <div className="flex items-center gap-2 ml-2">
                <div
                  className="w-4 h-4 rounded border border-black/10"
                  style={{ background: appliedColor }}
                />
                <span className="text-[11px] font-mono text-[#888]">
                  {appliedColor.toUpperCase()}
                </span>
                {palette?.lightModeIsDerived && mode === "light" && (
                  <span className="text-[10px] text-[#aaa]">(derived)</span>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!imageUrl && (
              <div className="h-full flex items-center justify-center">
                <p className="text-[13px] text-[#ccc]">Upload an image to see the preview</p>
              </div>
            )}

            {imageUrl && view === "preview" && (
              <div className="max-w-2xl mx-auto">
                <HeaderPreview
                  imageUrl={imageUrl}
                  color={appliedColor || null}
                  mode={mode}
                  isDerived={!!palette?.lightModeIsDerived && mode === "light"}
                />
              </div>
            )}

            {imageUrl && view === "code" && palette && (
              <div className="max-w-2xl mx-auto">
                <CodeView palette={palette} />
              </div>
            )}

            {imageUrl && view === "code" && !palette && loading && (
              <div className="flex items-center gap-2 text-[12px] text-[#aaa]">
                <div className="w-3 h-3 rounded-full border border-[#ccc] border-t-[#666] animate-spin" />
                Extracting…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
