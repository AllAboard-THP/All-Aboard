# Branding — visual concepts

**Last updated:** 2026-06-03 (logo mark assets reduced to originals only)

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
- **Never use “sharp”** in prompts (even as negation). **No Pillow**, **no `sharp` npm**, **no local patch overlays** that alter rendering outside the requested element.
- **No invented instructions** — do not add filters, glow, haze, decorative effects, or any constraint the human did not state.
- **Reference:** start from the approved [concept-1](assets/concept-1.png), [concept-2](assets/concept-2.png), or a series variant above; preserve everything except the requested change.
- **Do not overwrite** `assets/concept-1.png`, `assets/concept-2.png`, or series files without explicit human approval.

---

## Usage

- **Format:** 16:9 hero-friendly; top area kept clear for optional headline overlay.
- **Language:** Illustrations are locale-neutral; user-facing copy remains French in product UI.
- **Status:** **concept-1** = canonical marina hero (Mediterranean, A-frame sign). **concept-2** = **validated** Seine sport hero (2026-05-31). Series files Vendée Globe and Seine night remain exploratory.

**Storybook (landing body):** `Screens/LandingLogin` uses [concept-2-branding-light-proposal.png](assets/concept-2-branding-light-proposal.png) via `packages/ui/src/assets/concept-2-hero.png` symlink. Canonical reference scene remains [concept-2.png](assets/concept-2.png).

When promoting a concept to production, document the decision here or in an ADR and add optimized exports (SVG, WebP, favicon) under the appropriate app or design-system path.
