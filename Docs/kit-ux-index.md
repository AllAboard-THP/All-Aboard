# Kit UX — index (`apps/web`)

**Date** : 2026-05-19 · **Statut** : MVP livré sur `feature/ui-tailwind-foundation` (gate **L** ✓).

## Où est le kit ?

Il n’y a **pas** de dossier `kit/` ni de paquet `@allaboard/ui-kit`. Le kit est **intégré dans** [`apps/web`](../apps/web/) :

| Zone | Contenu |
|------|---------|
| `app/globals.css` | Tokens CSS (couleurs, motion, z-index) |
| `components/ui/` | Primitives shadcn |
| `components/` | Shell, CGU, feed, motion, etc. |
| `stories/` · `.storybook/` | Catalogue Storybook |
| `e2e/` | Parcours **R1–R6** (Playwright) |

## Documents (rôles)

| Fichier | Rôle |
|---------|------|
| [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md) | Exécution : phases, gates **V/T/P**, gate **L**, merge `Dev` |
| [audit-integration-kit-ux-allaboard.md](audit-integration-kit-ux-allaboard.md) | Inventaire **§8**, ADN, risques, figures |
| [procedure-tailwind-apps-web.md](procedure-tailwind-apps-web.md) | Tailwind, shadcn, Storybook au quotidien |
| [tokens-kit-web.md](tokens-kit-web.md) | Table token → CSS → classe |
| [wontfix-kit-ux.md](wontfix-kit-ux.md) | Hors périmètre MVP |
| [apps/web/README.md](../apps/web/README.md) | Scripts dev, E2E, stack |

## Commandes

```bash
pnpm install
pnpm dev                              # app :3000
pnpm gate:l:kit                       # gate L : V + T + P (racine)
pnpm --filter web run storybook       # :6006
```

E2E / WSL : [`apps/web/e2e/README.md`](../apps/web/e2e/README.md).

## Tableau D1 (§8 → code)

| §8 | Primitive / zone | Emplacement | Story / page | Statut |
|----|------------------|-------------|--------------|--------|
| 8.0 | Tokens, focus, glass | `app/globals.css` | `foundations-tokens.stories.tsx` | fait |
| 8.0 | Motion FadeIn | `components/motion/fade-in.tsx` | — | fait |
| 8.1 | App shell, nav, footer | `app-shell`, `mobile-nav`, `user-menu` | pages App Router | fait |
| 8.2 | Breadcrumbs, tabs, heading, messages | `ui/breadcrumb`, `tabs`, `page-heading`, `messages/page` | stories + E2E R5 | fait |
| 8.3–8.5 | Formulaires, boutons | `components/ui/*` | stories + `/login` E2E R2 | fait |
| 8.6 | Cartes, feed, empty | `card`, `feed-card`, `feed-empty` | `/feed`, `/explore` E2E R4 | fait |
| 8.7 | CGU, toasts | `cgu-gate`, sonner | E2E R3 | fait |
| 8.8 | Tables admin/mentor | `ui/table` | `/admin`, `/mentor` E2E R6 | fait (MVP) |
| 8.9 | Code block, chat UI | `code-block`, `messages/page` | stories + E2E R5 | fait |
| 8.10 | Légal, mail preview | `legal/page`, `mail-preview.stories` | Storybook | fait |
| — | Chat temps réel | — | — | [WONTFIX-P3-01](wontfix-kit-ux.md) |
| — | Thème light | — | — | [WONTFIX-D5-01](wontfix-kit-ux.md) |
| — | `packages/ui-tokens` | — | — | [WONTFIX-D2-02](wontfix-kit-ux.md) |

**D3** (feed) : `@allaboard/types` + [plan Web/API](plan-mise-en-place-web-api-donnees.md).
