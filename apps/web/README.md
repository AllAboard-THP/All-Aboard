# `apps/web` — All-Aboard (Next.js)

## Scripts

| Script | Rôle |
|--------|------|
| `pnpm dev` | Next 15 (Turbopack), port **3000** |
| `pnpm build` / `pnpm start` | Build production puis serveur (port **3000**) |
| `pnpm test` | Vitest (`tests/`) |
| `pnpm run test:e2e:install` | Installe Chromium (Playwright) — une fois par machine / CI |
| `pnpm run test:e2e` | **Playwright** — parcours **R1–R6** documentés dans [`e2e/README.md`](./e2e/README.md) |
| `pnpm run storybook` | **Storybook** 8 (port **6006**) — stories sous [`stories/`](./stories/) |
| `pnpm run build-storybook` | Build statique (`storybook-static/`, ignoré par git) |

## Storybook

Framework **[@storybook/nextjs](https://storybook.js.org/docs/get-started/frameworks/nextjs)** 8.4.x (aligné avec Node **20.18** du dépôt ; la CLI **Storybook 10** exige Node **20.19+**). L’init a été fait avec `pnpm dlx storybook@8.4.7 init` ; après **Tailwind** / **shadcn**, prévoir une passe de réalignement preview/CSS ([plan kit UX — G1](../../Docs/plan-integration-kit-ux-allaboard.md#gate-g1--spike-technique)).

```bash
pnpm --filter web run storybook
pnpm --filter web run build-storybook
```

## E2E (Playwright)

Aligné avec le [plan kit UX — Exécution agent autonome](../../Docs/plan-integration-kit-ux-allaboard.md#execution-agent-autonome) (**D4**, jalon **P**).

```bash
# racine monorepo
pnpm --filter web run test:e2e:install
pnpm --filter web run build
pnpm --filter web run test:e2e
```

Le serveur sous-jacent pour les E2E est le bundle **Next `output: "standalone"`** (port **3005** par défaut, voir `playwright.config.ts` et variable `E2E_PORT`), pas `next start`.

## Variables d’environnement

Voir [plan Web/API — données](../../Docs/plan-mise-en-place-web-api-donnees.md) : notamment **`API_URL`** pour le fetch SSR du feed (`GET /feed`).
