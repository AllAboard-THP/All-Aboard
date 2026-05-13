# `apps/web` — All-Aboard (Next.js)

## Scripts

| Script | Rôle |
|--------|------|
| `pnpm dev` | Next 15 (Turbopack), port **3000** |
| `pnpm build` / `pnpm start` | Build production puis serveur (port **3000**) |
| `pnpm test` | Vitest (`tests/`) |
| `pnpm run test:e2e:install` | Installe Chromium (Playwright) — une fois par machine / CI |
| `pnpm run test:e2e` | **Playwright** — parcours **R1–R6** documentés dans [`e2e/README.md`](./e2e/README.md) |

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
