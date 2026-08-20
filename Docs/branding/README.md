# Branding — visual concepts

**Last updated:** 2026-06-23

Exploratory hero / marketing illustrations for All-Aboard. **Production rasters** ship in [`packages/ui/src/assets/`](../../packages/ui/src/assets/) (bundled with `@allaboard/ui`, Docker-safe). This folder holds **drafts**, export notes, and brand guidelines only.

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

## Production assets (`packages/ui/src/assets/`)

**Naming:** `concept-{page}-hero` — production basenames match table IDs (`landing-hero` → `concept-landing-hero`, `feed-hero` → `concept-feed-hero`). PNG + WebP siblings when exported via `export-hero-raster-4k.mjs`.

| ID | File | Usage | Notes |
|----|------|-------|-------|
| **landing-hero** | `concept-landing-hero.png` · `.webp` | Landing `/` — `LandingConceptBackground` | **Deploy 4K** 3840×2560 — port-entry editorial illustration |
| **feed-hero** | `concept-feed-hero.png` | Feed `/feed` — `FeedConceptBackground` | 2704×1520 — morning illustrated scene |
| **logo-mark** | `logo-mark.png` · `logo-mark.svg` | App chrome, Storybook, favicon source | PNG immutable per project rule |

Index stub: [`assets/README.md`](assets/README.md) (no binaries here — `Docs/` is excluded from Docker context).

---

## Drafts (`drafts/`)

Work-in-progress or reference rasters — **not** wired to production UI.

| File | Notes |
|------|-------|
| [landing-mural-no-signature.jpg](drafts/landing-mural-no-signature.jpg) | Street-art mural exploration — no signature |
| [landing-mural-street-art-draft.jpg](drafts/landing-mural-street-art-draft.jpg) | Earlier mural iteration |
| [DSC_7309.jpg](drafts/DSC_7309.jpg) | Reference photo (source material) |

---

## Archived concepts (not in repo)

Earlier hero iterations (`concept-1`, `concept-2`, Seine/Vendee variants, etc.) were **removed from the repo** to reduce asset weight. Regeneration constraints: [.cursor/rules/branding-hero-4k.mdc](../../.cursor/rules/branding-hero-4k.mdc).

When promoting a new concept to production: export to `packages/ui/src/assets/`, bump revision constant in `*-concept-background.tsx`, update this table.

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
  --basename concept-landing-hero
```

After export: bump `LANDING_CONCEPT_BG_REVISION` in `landing-concept-background.tsx`.

---

## Usage

- **Format:** 16:9 hero-friendly; top area kept clear for optional headline overlay.
- **Language:** Illustrations are locale-neutral; user-facing copy remains French in product UI.
- **Status:** Production landing = **concept-landing-hero** ; production feed = **concept-feed-hero**.
