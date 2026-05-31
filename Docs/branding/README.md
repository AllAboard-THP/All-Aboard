# Branding — visual concepts

**Last updated:** 2026-05-31 (concept-1 promoted — marina hero)

Exploratory hero / marketing illustrations for All-Aboard. Not yet tied to production assets (`packages/ui`, Storybook, or `apps/web`).

Assets live in [`assets/`](assets/).

---

## Brand alignment (canonical)

Marketing visuals must match the **design system** — source of truth in code:

| Element | Canonical reference | Values |
|---------|---------------------|--------|
| **Logo mark** | [`AllAboardLogoMark`](../../packages/ui/src/components/allaboard-logo-mark.tsx) | Two overlapping triangular sails (indigo → pink gradient), mast, curved hull / wave deck |
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
| **concept-1** | [concept-1.png](assets/concept-1.png) | Students at a marina dock, sailboat in background | **Preferred hero direction** — six students on pier; A-frame sign with FR copy (logo top, wordmark bottom); All-Aboard logos on tops and hull; indigo → pink sails; Mediterranean town |
| **concept-2** | [concept-2.png](assets/concept-2.png) | Same marina scene (working iteration) | Iteration file kept alongside concept-1; same composition as promoted [concept-1](assets/concept-1.png); use concept-1 as canonical reference |

---

## Generation constraints (concept-2 iterations)

When regenerating or editing concept visuals (AI or manual):

- **Only what the human asks** — change **only** the element explicitly requested (e.g. sign copy). **No other modification** — no reframing, no recolor, no new props, no style tweaks, no quality keywords.
- **Never use “sharp”** in prompts (even as negation). **No Pillow**, **no `sharp` npm**, **no local patch overlays** that alter rendering outside the requested element.
- **No invented instructions** — do not add filters, glow, haze, decorative effects, or any constraint the human did not state.
- **Reference:** start from the approved [concept-1](assets/concept-1.png) (canonical) or [concept-2](assets/concept-2.png) (iteration); preserve everything except the requested change.
- **Do not overwrite** `assets/concept-1.png` or `assets/concept-2.png` without explicit human approval.

---

## Usage

- **Format:** 16:9 hero-friendly; top area kept clear for optional headline overlay.
- **Language:** Illustrations are locale-neutral; user-facing copy remains French in product UI.
- **Status:** **concept-1** is the canonical marina hero (promoted 2026-05-31). **concept-2** remains the iteration filename for regen constraints below. Former rail-station concept-1 was superseded.

When promoting a concept to production, document the decision here or in an ADR and add optimized exports (SVG, WebP, favicon) under the appropriate app or design-system path.
