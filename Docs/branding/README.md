# Branding and visual library

**Last updated:** 2026-11-20

Start here to find All-Aboard’s approved visual concepts, shipped assets and earlier iterations.

- [Retained prototypes](#retained-prototypes) includes concepts approved for future use.
- [Production assets](#production-assets) links to the source files used in the app.
- [Previous versions](#previous-versions) links to earlier implementations and drafts.

When a maintainer explicitly retains or approves a visual, update this library in the same change. Add its name, intended use and source or preview link. Save a standalone prototype or source file under [`retained/`](retained/) if it has no canonical file in the repository. For an existing production asset, link to its source at its current path. Update the entry when a design ships or is superseded.

---

## Brand alignment (canonical)

Marketing visuals must match the **design system** — source of truth in code:

| Element | Canonical reference | Values |
|---------|---------------------|--------|
| **Logo mark** | [`AllAboardLogoMark`](../../packages/ui/src/components/allaboard-logo-mark.tsx) · [`logo-mark.png`](../../packages/ui/src/assets/logo-mark.png) · [`logo-mark.svg`](../../packages/ui/src/assets/logo-mark.svg) | **PNG** immutable; regen vector SVG: `python3 scripts/branding/export-logo-mark-svg.py` |
| **Wordmark** | [`gradient-text`](../../packages/ui/src/styles/globals.css) + [`BrandLogo`](../../packages/ui/src/patterns/legacy-ui.tsx) | **All-Aboard** (or **AllAboard** in Storybook labels) — Inter, bold, gradient fill |
| **Primary** | `--primary` in [`globals.css`](../../packages/ui/src/styles/globals.css) | `#6366f1` — indigo (`hsl(239 84% 67%)`) |
| **Accent / gradient end** | Logo + `.gradient-text` | `#ec4899` — pink |
| **Brand gradient** | `.gradient-text`, logo SVG | `linear-gradient(135deg, #6366f1 0%, #ec4899 100%)` |
| **Typography** | `--font-sans` | **Inter**, ui-sans-serif fallback stack |

**Do not use** off-brand palettes (e.g. teal + coral) unless explicitly exploring alternates — document them as non-canonical.

Storybook: **Patterns/Legacy Brand** (`legacy-brand.stories.tsx`).

---

## Retained prototypes

- **Torsion en S** · Landing page motion concept. A black-wireframe mesh on white fills the left edge and narrows toward the right. The prototype includes play, pause and a speed control. Open the [standalone HTML prototype](retained/torsion-en-s.html) in a browser.

## Production assets

Production rasters ship in [`packages/ui/src/assets/`](../../packages/ui/src/assets/), bundled with `@allaboard/ui`.

**Naming:** feed rasters use `concept-feed-hero` (PNG, via `export-hero-raster-4k.mjs`). The landing hero is code, not a file in this folder.

| ID | File | Usage | Notes |
|----|------|-------|-------|
| **landing-hero** | [`LandingNetworkField`](../../packages/ui/src/patterns/landing-network-field.tsx) · [geometry](../../packages/ui/src/patterns/landing-network-geometry.ts) · [styles](../../packages/ui/src/styles/globals.css) | Landing `/` — `LandingConceptBackground` | Hexagonal network on a dark stage, with mint light pulses following the links. |
| **feed-hero** | [`concept-feed-hero.png`](../../packages/ui/src/assets/concept-feed-hero.png) | Feed `/feed` — `FeedConceptBackground` | 2704×1520 — morning illustrated scene |
| **logo-mark** | [PNG](../../packages/ui/src/assets/logo-mark.png) · [SVG](../../packages/ui/src/assets/logo-mark.svg) | App chrome, Storybook, favicon source | PNG immutable per project rule |

Index stub: [`assets/README.md`](assets/README.md) (no binaries here — `Docs/` is excluded from Docker context).

---

## Previous versions

- **Organic landing network** · An earlier landing animation based on a hand-drawn sketch, with breathing cells and light signals. See [the original implementation](https://github.com/AllAboard-THP/All-Aboard/blob/8e2a2bc893ee69c52b2227780170bb6c9442817e/packages/ui/src/patterns/landing-cell-field.tsx) and [PR #162](https://github.com/AllAboard-THP/All-Aboard/pull/162).

### Drafts (`drafts/`)

Work-in-progress or reference rasters — **not** wired to production UI.

| File | Notes |
|------|-------|
| [landing-mural-no-signature.jpg](drafts/landing-mural-no-signature.jpg) | Street-art mural exploration — no signature |
| [landing-mural-street-art-draft.jpg](drafts/landing-mural-street-art-draft.jpg) | Earlier mural iteration |
| [DSC_7309.jpg](drafts/DSC_7309.jpg) | Reference photo (source material) |

---

### Archived concepts

Earlier hero iterations (`concept-1`, `concept-2`, Seine/Vendee variants, etc.) were **removed from the repo** to reduce asset weight. Regeneration constraints: [.cursor/rules/branding-hero-4k.mdc](../../.cursor/rules/branding-hero-4k.mdc).

When shipping a new raster, export it to `packages/ui/src/assets/`, bump the revision constant in the relevant background component and update the production entry.

---

## Generation constraints

When regenerating or editing concept visuals (AI or manual):

- **Only what the human asks** — change **only** the element explicitly requested.
- **Never use “sharp”** in **image prompts** (model keyword).
- **Background = scenery only** — never bake login cards, buttons, headlines, or UI mockups into hero rasters.
- **Do not overwrite** production assets in `packages/ui/src/assets/` without explicit human approval.

### Hero raster resolution (mandatory)

| Term | Meaning |
|------|---------|
| **Native 4K** | Source **≥ 3840 px wide** before upscale — true detail |
| **Deploy 4K** | Canonical file **3840 × 2560** in `packages/ui/src/assets/` |

**Priority:** true 4K source → else Cursor generator (~1536×1024) in **editorial illustration** style → `export-hero-raster-4k.mjs` (warns on upscale).

```bash
node scripts/branding/export-hero-raster-4k.mjs \
  --source <draft> \
  --basename concept-feed-hero
```

After a **feed** export: bump the revision constant in `feed-concept-background.tsx`. The landing hero is the geometric network, not a raster — do not reintroduce `concept-landing-hero`.

---

## Usage

- **Format:** 16:9 hero-friendly; top area kept clear for optional headline overlay.
- **Language:** Illustrations are locale-neutral; user-facing copy remains French in product UI.
- **Status:** Production landing = **geometric network** (`LandingNetworkField`) ; production feed = **concept-feed-hero**.
