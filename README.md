# palette-lab

Image color extraction playground for testing light/dark mode palette behavior.

Upload any image — the app extracts a full palette using **node-vibrant** (a port of Android's Palette API), then shows how those colors behave as a header background in both light and dark mode.

## What it does

- Extracts 6 semantic swatches: `Vibrant`, `DarkVibrant`, `LightVibrant`, `Muted`, `DarkMuted`, `LightMuted`
- Applies `DarkVibrant` to a dark-mode header preview
- Applies `LightVibrant` to a light-mode header preview
- If `LightVibrant` is null (common for minimal/monochrome artwork), derives a tint: takes the `Vibrant` hue and sets saturation to 18%, lightness to 95% — avoids the Apple Music iOS 26 mistake of blasting a raw mid-tone color onto a white background
- Code view shows the full JSON output including which values were extracted vs. derived

## Stack

- **Next.js 15** (App Router, TypeScript)
- **node-vibrant** — Android Palette API port for JS
- **sharp** — image resize before extraction (reduces pixel count ~95%, cuts extraction time from ~500ms to ~100ms)
- **Tailwind CSS**

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How the extraction pipeline works

```
Upload image
→ sharp.resize(150, 150)             # downsample for performance
→ Vibrant.from(buffer).getPalette()
→ Extract DarkVibrant + LightVibrant (+ fallback derivation if null)
→ Apply to header preview
```

In production, this runs once on image upload and the result is stored in the database — extraction never happens at page-render time.

## Key references

- [node-vibrant docs](https://vibrant.dev)
- [Android Palette API](https://developer.android.com/develop/ui/views/graphics/palette-colors) — the algorithm this is based on
- [Spotify color algorithm (reverse-engineered)](https://inobtenio.com/en/posts/spotify-song-colors/)
