# Index kit UX — `apps/web`

**Date** : 2026-05-19 · **Plan** : [phase 4 — 4.1](plan-integration-kit-ux-allaboard.md#phase-4--clôture) · **Motion** : [procedure-tailwind-apps-web.md](procedure-tailwind-apps-web.md) §2.7, `components/motion/fade-in.tsx`

Tableau **D1** : primitive / famille audit → story ou page → statut.

| §8 | Primitive / zone | Emplacement | Story / page | Statut |
|----|------------------|-------------|--------------|--------|
| 8.0 | Tokens, focus, glass | `app/globals.css` | `stories/foundations-tokens.stories.tsx` | fait |
| 8.0 | Motion FadeIn | `components/motion/fade-in.tsx` | — | fait (D7) |
| 8.1 | App shell | `components/app-shell.tsx` | pages App Router | fait |
| 8.1 | Nav mobile (sheet) | `components/mobile-nav.tsx` | — | fait |
| 8.1 | Menu utilisateur | `components/user-menu.tsx` | — | fait |
| 8.1 | Footer | `app-shell` | — | fait |
| 8.2 | Breadcrumbs | `components/ui/breadcrumb.tsx` | `breadcrumb.stories.tsx`, `/feed` | fait |
| 8.2 | Tabs | `components/ui/tabs.tsx` | `tabs.stories.tsx`, `/explore` | fait |
| 8.2 | Page heading | `components/page-heading.tsx` | `/feed`, `/admin` | fait |
| 8.2 | Split messages | `app/messages/page.tsx` | E2E R5 | fait |
| 8.3 | Input, Label | `components/ui/*` | `input.stories.tsx` | fait |
| 8.4 | Login / Register | `app/login`, `app/register` | E2E R2 | fait (démo) |
| 8.5 | Button | `components/ui/button.tsx` | `button.stories.tsx` | fait |
| 8.6 | Card, FeedCard | `components/ui/card.tsx`, `feed/feed-card.tsx` | `card.stories.tsx`, `/feed` | fait |
| 8.6 | Empty state | `components/feed/feed-empty.tsx` | `/explore` | fait |
| 8.7 | CGU modale | `components/cgu-gate.tsx` | E2E R3 | fait |
| 8.7 | Toast (sonner) | `providers.tsx` | login | fait |
| 8.8 | Table admin/mentor | `components/ui/table.tsx` | `/admin`, `/mentor` | fait (MVP) |
| 8.9 | Code block (hljs) | `components/code-block.tsx` | `code-block.stories.tsx`, messages | fait |
| 8.9 | Chat temps réel | — | — | WONTFIX-P3-01 |
| 8.10 | Légal | `app/legal/page.tsx` | — | fait |
| 8.10 | Mail preview | `stories/mail-preview.stories.tsx` | Storybook | fait (aperçu statique) |
| — | Thème light | — | — | WONTFIX-D5-01 |
| — | `packages/ui-tokens` | — | — | WONTFIX-D2-02 |

**D3** : pages feed utilisent `@allaboard/types` + `fetchFeed` / BFF — voir [plan Web/API](plan-mise-en-place-web-api-donnees.md).

**E2E** : R1–R6 — [`apps/web/e2e/`](../apps/web/e2e/).
