# `apps/web` — All-Aboard (Next.js)

Kit UX : **Tailwind 3** (PostCSS), **shadcn/ui** (`components.json`, `cn` via `clsx` + `tailwind-merge`), **Storybook 8.4.x**, **motion** (`motion/react`), **Playwright** (R1–R6).

## Scripts

| Script | Rôle |
|--------|------|
| `pnpm dev` | Next 15 (Turbopack), port **3000** |
| `pnpm build` / `pnpm start` | Build production puis serveur (port **3000**) |
| `pnpm test` | Vitest (`tests/`) |
| `pnpm run test:e2e:install` | Installe Chromium (Playwright) — une fois par machine / CI |
| `pnpm run test:e2e` | **Playwright** — parcours **R1–R6** ([`e2e/README.md`](./e2e/README.md)) |
| `pnpm run storybook` | **Storybook** 8 (port **6006**) — stories sous [`stories/`](./stories/) et [`components/`](./components/) |
| `pnpm run build-storybook` | Build statique (`storybook-static/`, ignoré par git) |

## Stack CSS / UI (G1 — décision build §14)

Procédure détaillée : **[`Docs/procedure-tailwind-apps-web.md`](../../Docs/procedure-tailwind-apps-web.md)** (versions, fichiers, workflow, dépannage, migration v4).

- **Option A** : Tailwind **3.4.19** + PostCSS + Next (`tailwind.config.ts`, `app/globals.css`).
- **shadcn** : `components.json` ; primitives sous `components/ui/` ; `pnpm dlx shadcn@latest add <name>` pour en ajouter (ne pas relancer `init`).
- **Motion (D7)** : paquet `motion` — helper `components/motion/fade-in.tsx` ; `prefers-reduced-motion` dans `globals.css`.
- **Tokens** : [`Docs/tokens-kit-web.md`](../../Docs/tokens-kit-web.md).
- **Index kit (D1)** : [`Docs/kit-ux-index.md`](../../Docs/kit-ux-index.md) · **WONTFIX** : [`Docs/wontfix-kit-ux.md`](../../Docs/wontfix-kit-ux.md).

## Storybook

Framework **[@storybook/nextjs](https://storybook.js.org/docs/get-started/frameworks/nextjs)** 8.4.x (Node **20.18+** du dépôt ; CLI **10+** exige Node **20.19+**). Preview importe `app/globals.css` (thème dark aligné prod).

```bash
pnpm --filter web run storybook
pnpm --filter web build-storybook
```

## E2E (Playwright)

Aligné [plan kit UX — D4](../../Docs/plan-integration-kit-ux-allaboard.md#execution-agent-autonome).

```bash
pnpm --filter web run test:e2e:install
pnpm --filter web run build
CI=true pnpm --filter web run test:e2e
```

Serveur E2E : bundle **standalone** sur port **3005** (`E2E_PORT`). CGU : `localStorage` clé `allaboard-cgu-accepted` — voir `e2e/helpers.ts`.

## Variables d’environnement

Voir [plan Web/API](../../Docs/plan-mise-en-place-web-api-donnees.md) : **`API_URL`** pour le fetch SSR du feed (`GET /feed`).
