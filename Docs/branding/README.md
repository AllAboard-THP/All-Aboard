# Branding — visual concepts

**Last updated:** 2026-05-30 (constraints — no unauthorized edits)

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
| **concept-1** | [concept-1.png](assets/concept-1.png) | Students gathering at a train station | Travel-by-rail metaphor; warm golden hour; **off-brand teal + coral** — exploratory only; flat-vector; no logo overlay |
| **concept-2** | [concept-2.png](assets/concept-2.png) | Students at a marina dock, sailboat in background | Hero FR on sign (logo top, wordmark bottom); logo on hull; indigo → pink sails |

---

## Generation constraints (concept-2 iterations)

When regenerating or editing concept visuals (AI or manual):

- **Only what the human asks** — change **only** the element explicitly requested (e.g. sign copy). **No other modification** — no reframing, no recolor, no new props, no style tweaks, no quality keywords.
- **Never use “sharp”** in prompts (even as negation). **No Pillow**, **no `sharp` npm**, **no local patch overlays** that alter rendering outside the requested element.
- **No invented instructions** — do not add filters, glow, haze, decorative effects, or any constraint the human did not state.
- **Reference:** start from the approved [concept-2](assets/concept-2.png); preserve everything except the requested change.
- **Do not overwrite** `assets/concept-2.png` without explicit human approval.

---

## Usage

- **Format:** 16:9 hero-friendly; top area kept clear for optional headline overlay.
- **Language:** Illustrations are locale-neutral; user-facing copy remains French in product UI.
- **Status:** concept-2 is the preferred sailboat direction; concept-1 kept as rail metaphor reference.

When promoting a concept to production, document the decision here or in an ADR and add optimized exports (SVG, WebP, favicon) under the appropriate app or design-system path.
