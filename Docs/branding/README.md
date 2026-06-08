# Branding — visual concepts

**Last updated:** 2026-06-08 (landing hero: illustrated port entry)

Exploratory hero / marketing illustrations for All-Aboard. Not yet tied to production assets (`packages/ui`, Storybook, or `apps/web`).

Assets live in [`assets/`](assets/).

---

## Brand alignment (canonical)

Marketing visuals must match the **design system** — source of truth in code:

| Element | Canonical reference | Values |
|---------|---------------------|--------|
| **Logo mark** | [`AllAboardLogoMark`](../../packages/ui/src/components/allaboard-logo-mark.tsx) · [logo-mark.png](assets/logo-mark.png) (canonical raster) · [logo-mark.svg](assets/logo-mark.svg) (vector trace) | **PNG** immutable; regen vector SVG: `python3 scripts/branding/export-logo-mark-svg.py` |
| **Wordmark** | [`gradient-text`](../../packages/ui/src/styles/globals.css) + [`BrandLogo`](../../packages/ui/src/patterns/legacy-ui.tsx) | **All-Aboard** (or **AllAboard** in Storybook labels) — Inter, bold, gradient fill |
| **Primary** | `--primary` in [`globals.css`](../../packages/ui/src/styles/globals.css) | `#6366f1` — indigo (`hsl(239 84% 67%)`) |
| **Accent / gradient end** | Logo + `.gradient-text` | `#ec4899` — pink |
| **Brand gradient** | `.gradient-text`, logo SVG | `linear-gradient(135deg, #6366f1 0%, #ec4899 100%)` |
| **Typography** | `--font-sans` | **Inter**, ui-sans-serif fallback stack |

**Do not use** off-brand palettes (e.g. teal + coral) unless explicitly exploring alternates — document them as non-canonical.

Storybook: **Patterns/Legacy Brand** (`legacy-brand.stories.tsx`).

---

## Concepts

| ID | File | Theme | Notes |
|----|------|-------|-------|
| **concept-1** | [concept-1.png](assets/concept-1.png) | Students at a marina dock, sailboat in background | **Canonical marina hero** — six students on pier; A-frame sign with FR copy; All-Aboard logos on tops and hull; indigo → pink sails; Mediterranean town |
| **concept-2** | [concept-2.png](assets/concept-2.png) | Paris Seine — student nautical sports | **Validated hero (2026-05-31)** — illustrated style; mirrored composition; six students cross-legged on quay; full FR copy on main sail (readable); kayaks/paddle/dinghies dispersed; no freestanding sign |
| **concept-landing-port-entry** | [concept-landing-port-entry.png](assets/concept-landing-port-entry.png) | Illustrated sailboat entering port | **Landing hero (2026-06-08)** — editorial illustration (concept-2 style); full boat; branding on right sail; warm mood; `object-[40%_42%]` in `LandingConceptBackground` |
| **concept-landing-villette-arrival** | [concept-landing-villette-arrival.png](assets/concept-landing-villette-arrival.png) | Photo-real Paris Bassin de la Villette | Exploratory variant B — archived |
| **concept-landing-port-arrival** | [concept-landing-port-arrival.png](assets/concept-landing-port-arrival.png) | Sailboat arriving at marina — students on deck | Previous landing iteration — archived |
| **concept-open-space-landing** | [concept-open-space-landing.png](assets/concept-open-space-landing.png) | Student open space — bay window, yacht on sea | Previous landing hero (2026-06-03) — archived reference |
| **concept-feed-three-column-morning-illustrated** | [concept-feed-three-column-morning-illustrated.png](assets/concept-feed-three-column-morning-illustrated.png) | Feed stage — dawn, tri-band; illustrated open-space; premium brand props; branded wall frame; **2704×1520 (2.7K)** | **Feed three-column** — sole feed raster; `FeedConceptBackground` (2026-06-05) |
---

## Series — concept-1 variants

Same French copy and student circle as [concept-1](assets/concept-1.png); each variant changes **setting** and **message carrier** (rule: see the board under different object formats).

| File | Theme | Message carrier |
|------|-------|-----------------|
| [concept-1-seine-sport.png](assets/concept-1-seine-sport.png) | Paris Seine — student nautical sports (kayak, paddle, dinghy) | Synced with validated [concept-2](assets/concept-2.png) — iteration filename only |
| [concept-1-vendee-globe.png](assets/concept-1-vendee-globe.png) | IMOCA offshore race — full crew | One IMOCA with full **All-Aboard** livery (hull + sails); skipper and crew on deck; other IMOCA competitors; clean structured illustration |
| [concept-1-seine-nuit.png](assets/concept-1-seine-nuit.png) | Paris Seine at night — urban regatta | **LED screen** on floating barge / péniche |

**Sign copy (all variants):**

```text
L'espace où les
étudiants s'aident
vraiment.
Publiez une requête, recevez
des réponses ciblées, obtenez
de l'aide de professionnels
confirmés, échangez vos savoirs !
All-Aboard
```

---

## Generation constraints

When regenerating or editing concept visuals (AI or manual):

- **Only what the human asks** — change **only** the element explicitly requested (e.g. sign copy). **No other modification** — no reframing, no recolor, no new props, no style tweaks, no quality keywords.
- **Never use “sharp”** in **image prompts** (model keyword). Export tooling may use Lanczos upscale — see [Native 4K export](#native-4k-export-mandatory) below.
- **No invented instructions** — do not add filters, glow, haze, decorative effects, or any constraint the human did not state.
- **Background = scenery only** — never bake login cards, buttons, headlines, or UI mockups into hero rasters; product UI is React (`LandingConceptBackground` + `Connexion` card).
- **Reference:** start from the approved [concept-1](assets/concept-1.png), [concept-2](assets/concept-2.png), or a series variant above; preserve everything except the requested change.
- **Do not overwrite** `assets/concept-1.png`, `assets/concept-2.png`, or series files without explicit human approval.

### Hero raster resolution (mandatory)

| Term | Meaning |
|------|---------|
| **Native 4K** | Source **≥ 3840 px wide** before upscale — true detail |
| **Deploy 4K** | Canonical file **3840 × 2560** in `Docs/branding/assets/` |

**Priority:** true 4K source → else Cursor generator (~1536×1024) in **editorial illustration** style (not photoreal) → `export-hero-raster-4k.mjs` (warns on upscale). Never label upscale-only output as native 4K.

| Field | Landing hero (`concept-landing-port-entry`) |
|-------|---------------------------------------------|
| Deploy output | **3840 × 2560** (16∶9) |
| PNG | RGB 24-bit (`palette: false`) |
| WebP | quality **94** |
| Script | `node scripts/branding/export-hero-raster-4k.mjs --source <draft> --basename concept-landing-port-entry` |

After export: bump `LANDING_CONCEPT_BG_REVISION` in `landing-concept-background.tsx`. Rule: [.cursor/rules/branding-hero-4k.mdc](../../.cursor/rules/branding-hero-4k.mdc).

---

## Usage

- **Format:** 16:9 hero-friendly; top area kept clear for optional headline overlay.
- **Language:** Illustrations are locale-neutral; user-facing copy remains French in product UI.
- **Status:** **concept-1** = canonical marina hero (Mediterranean, A-frame sign). **concept-2** = **validated** Seine sport hero (2026-05-31). Series files Vendée Globe and Seine night remain exploratory.

**Storybook / landing (body):** `Screens/LandingLogin` and `apps/web` route `/` use [concept-landing-port-entry.png](assets/concept-landing-port-entry.png) via `packages/ui/src/assets/concept-landing-port-entry.png` symlink (`LandingConceptBackground`, `object-[42%_40%]`). **Feed:** `Screens/FeedThreeColumn` and `apps/web` `/feed` use [concept-feed-three-column-morning-illustrated.png](assets/concept-feed-three-column-morning-illustrated.png) (canonical raster in `Docs/branding/assets/`) via `packages/ui/src/assets/concept-feed-three-column-morning-illustrated.png` symlink and `FeedConceptBackground` (`AppChrome` `mainInnerLayout="feed"` or `app/.../feed/layout.tsx`). Previous Seine hero: [concept-2-bicolor-sail-proposal.png](assets/concept-2-bicolor-sail-proposal.png). Canonical marina / Seine reference scenes: [concept-1.png](assets/concept-1.png), [concept-2.png](assets/concept-2.png).

When promoting a concept to production, document the decision here or in an ADR and add optimized exports (SVG, WebP, favicon) under the appropriate app or design-system path.
