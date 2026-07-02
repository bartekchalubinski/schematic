"use server";

import sharp from "sharp";

export interface Swatch {
  hex: string;
  population: number;
  hsl: [number, number, number];
  titleTextColor: string;
}

export interface Palette {
  vibrant: Swatch | null;
  darkVibrant: Swatch | null;
  lightVibrant: Swatch | null;
  muted: Swatch | null;
  darkMuted: Swatch | null;
  lightMuted: Swatch | null;
  // Derived: what to actually apply in each mode
  darkModeColor: string | null;
  lightModeColor: string | null;
  lightModeIsDerived: boolean; // true = LightVibrant was null, fallback used
}

export async function extractPalette(formData: FormData): Promise<Palette> {
  const file = formData.get("image") as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Resize before extraction — cuts ~95% of pixel work
  const resized = await sharp(buffer)
    .resize(150, 150, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  const { Vibrant } = await import("node-vibrant/node");
  const raw = await Vibrant.from(resized).getPalette();

  const toSwatch = (s: typeof raw.Vibrant): Swatch | null => {
    if (!s) return null;
    return {
      hex: s.hex,
      population: s.population,
      hsl: s.hsl as [number, number, number],
      titleTextColor: s.titleTextColor,
    };
  };

  const vibrant = toSwatch(raw.Vibrant);
  const darkVibrant = toSwatch(raw.DarkVibrant);
  const lightVibrant = toSwatch(raw.LightVibrant);
  const muted = toSwatch(raw.Muted);
  const darkMuted = toSwatch(raw.DarkMuted);
  const lightMuted = toSwatch(raw.LightMuted);

  // Dark mode: prefer DarkVibrant, fall back to Vibrant
  const darkModeColor = darkVibrant?.hex ?? vibrant?.hex ?? null;

  // Light mode: prefer LightVibrant.
  // If null (common for monochrome/minimal logos), derive from Vibrant hue
  // at low saturation + high lightness — avoids the Apple Music mistake
  let lightModeColor = lightVibrant?.hex ?? null;
  let lightModeIsDerived = false;

  if (!lightModeColor && vibrant) {
    lightModeColor = deriveLightTint(vibrant.hsl);
    lightModeIsDerived = true;
  }

  return {
    vibrant,
    darkVibrant,
    lightVibrant,
    muted,
    darkMuted,
    lightMuted,
    darkModeColor,
    lightModeColor,
    lightModeIsDerived,
  };
}

// Takes the extracted hue, drops saturation to 18%, pushes lightness to 95%
// Produces a barely-tinted near-white that works on any light background
function deriveLightTint(hsl: [number, number, number]): string {
  const [h] = hsl;
  return hslToHex(h, 0.18, 0.95);
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
