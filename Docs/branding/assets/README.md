# Branding assets (index)

Production rasters and logo files live in **`packages/ui/src/assets/`** (bundled with `@allaboard/ui`, included in Docker `turbo prune`).

This folder is reserved for **optional** marketing exports only. Do not symlink from `packages/ui` into `Docs/` — `Docs` is excluded from Docker build context.

| Asset | Path in repo |
|-------|----------------|
| Landing hero | `packages/ui/src/assets/concept-landing-hero.{png,webp}` |
| Feed hero | `packages/ui/src/assets/concept-feed-hero.png` |
| Logo mark | `packages/ui/src/assets/logo-mark.{png,svg}` |

Drafts and reference photos: [`../drafts/`](../drafts/).

Export script: `node scripts/branding/export-hero-raster-4k.mjs --out-dir packages/ui/src/assets`
