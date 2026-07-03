"use server";

import sharp from "sharp";

export type ExtractionMethod = "vibrant" | "dominant" | "vivid";

export interface Swatch {
  hex: string;
  population: number;
  hsl: [number, number, number];
  titleTextColor: string;
}

export interface Palette {
  darkVibrant: Swatch | null;
  lightVibrant: Swatch | null;
  darkModeColor: string | null;
  lightModeColor: string | null;
  lightModeIsDerived: boolean;
}

export async function extractPalette(formData: FormData, method: ExtractionMethod = "vibrant"): Promise<Palette> {
  const file = formData.get("image") as File;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const resized = await sharp(buffer)
    .resize(150, 150, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  if (method === "vibrant") return extractVibrant(resized);
  return extractKMeans(resized, method);
}

// ─── node-vibrant ────────────────────────────────────────────────────────────

async function extractVibrant(resized: Buffer): Promise<Palette> {
  const { Vibrant } = await import("node-vibrant/node");
  const raw = await Vibrant.from(resized).getPalette();

  const toSwatch = (s: typeof raw.Vibrant): Swatch | null => {
    if (!s) return null;
    return { hex: s.hex, population: s.population, hsl: s.hsl as [number, number, number], titleTextColor: s.titleTextColor };
  };

  const vibrant = toSwatch(raw.Vibrant);
  const darkVibrant = toSwatch(raw.DarkVibrant);
  const lightVibrant = toSwatch(raw.LightVibrant);

  const darkModeColor = darkVibrant?.hex ?? vibrant?.hex ?? null;

  let lightModeColor = lightVibrant?.hex ?? null;
  let lightModeIsDerived = false;
  if (!lightModeColor && vibrant) {
    lightModeColor = deriveLightTint(vibrant.hsl);
    lightModeIsDerived = true;
  }

  return { darkVibrant, lightVibrant, darkModeColor, lightModeColor, lightModeIsDerived };
}

// ─── k-means (shared for dominant + vivid) ───────────────────────────────────

type Cluster = { rgb: [number, number, number]; count: number };

async function extractKMeans(resized: Buffer, method: "dominant" | "vivid"): Promise<Palette> {
  const { data } = await sharp(resized).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // Sample every 4th pixel for speed
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 12) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  const clusters = kMeans(pixels, 8, 12);

  // Discard near-black and near-white — they're almost always background/shadow
  const withHsl = clusters.map(c => ({ ...c, hsl: rgbToHsl(c.rgb), hex: rgbToHex(c.rgb) }));
  const colored = withHsl.filter(c => c.hsl[2] > 0.06 && c.hsl[2] < 0.94 && c.hsl[1] > 0.05);
  const pool = colored.length >= 2 ? colored : withHsl;

  const dark = pool.filter(c => c.hsl[2] <= 0.5);
  const light = pool.filter(c => c.hsl[2] > 0.5);

  let darkColor: string | null = null;
  let lightColor: string | null = null;

  if (method === "dominant") {
    // Largest cluster wins
    darkColor = dark.sort((a, b) => b.count - a.count)[0]?.hex ?? pool.sort((a, b) => a.hsl[2] - b.hsl[2])[0]?.hex ?? null;
    lightColor = light.sort((a, b) => b.count - a.count)[0]?.hex ?? pool.sort((a, b) => b.hsl[2] - a.hsl[2])[0]?.hex ?? null;
  } else {
    // Highest saturation wins
    darkColor = dark.sort((a, b) => b.hsl[1] - a.hsl[1])[0]?.hex ?? pool.sort((a, b) => a.hsl[2] - b.hsl[2])[0]?.hex ?? null;
    lightColor = light.sort((a, b) => b.hsl[1] - a.hsl[1])[0]?.hex ?? pool.sort((a, b) => b.hsl[2] - a.hsl[2])[0]?.hex ?? null;
  }

  // Same light-mode fallback as vibrant method
  let lightModeIsDerived = false;
  if (!lightColor && darkColor) {
    lightColor = deriveLightTint(rgbToHsl(hexToRgb(darkColor)));
    lightModeIsDerived = true;
  }

  // Wrap results in Swatch shape so the UI stays consistent
  const toSwatch = (hex: string | null): Swatch | null => {
    if (!hex) return null;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const cluster = withHsl.find(c => c.hex === hex);
    return { hex, population: cluster?.count ?? 0, hsl, titleTextColor: hsl[2] > 0.5 ? "#000000" : "#ffffff" };
  };

  return {
    darkVibrant: toSwatch(darkColor),
    lightVibrant: toSwatch(lightColor),
    darkModeColor: darkColor,
    lightModeColor: lightColor,
    lightModeIsDerived,
  };
}

function kMeans(pixels: [number, number, number][], k: number, iterations: number): Cluster[] {
  const step = Math.floor(pixels.length / k);
  const centroids: [number, number, number][] = Array.from({ length: k }, (_, i) => [...pixels[Math.min(i * step, pixels.length - 1)]] as [number, number, number]);
  const assignments = new Int32Array(pixels.length);

  for (let iter = 0; iter < iterations; iter++) {
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      let minD = Infinity, nearest = 0;
      for (let j = 0; j < k; j++) {
        const dr = pixels[i][0] - centroids[j][0];
        const dg = pixels[i][1] - centroids[j][1];
        const db = pixels[i][2] - centroids[j][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < minD) { minD = d; nearest = j; }
      }
      if (assignments[i] !== nearest) { assignments[i] = nearest; changed = true; }
    }
    if (!changed) break;

    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (let i = 0; i < pixels.length; i++) {
      const j = assignments[i];
      sums[j][0] += pixels[i][0]; sums[j][1] += pixels[i][1]; sums[j][2] += pixels[i][2]; sums[j][3]++;
    }
    for (let j = 0; j < k; j++) {
      if (sums[j][3] > 0) centroids[j] = [Math.round(sums[j][0] / sums[j][3]), Math.round(sums[j][1] / sums[j][3]), Math.round(sums[j][2] / sums[j][3])];
    }
  }

  const counts = new Array(k).fill(0);
  for (let i = 0; i < pixels.length; i++) counts[assignments[i]]++;
  return centroids.map((rgb, i) => ({ rgb, count: counts[i] }));
}

// ─── Color space helpers ──────────────────────────────────────────────────────

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function deriveLightTint([h]: [number, number, number]): string {
  return hslToHex(h, 0.18, 0.95);
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
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
