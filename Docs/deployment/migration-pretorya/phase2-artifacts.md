# Phase 2 — execution log (non-secret)

## 2a — dev

| Step | Status | Notes |
|------|--------|--------|
| Project `AllAboard monorepo website` on Pretorya | Done (2026-10-05) | `projectId`: `-pOukeEDD3Tx807D0WDLO` |
| Environment `dev` | Done | `environmentId`: `V6_0e4BJOA5OedATSJcui` |
| Deploy server | Done | `allaboard-pretorya` (`188.245.0.208`) |
| Postgres 18 (dev) | Done | Internal app name in `.allaboard-migration/phase2/dev-recreate-report.json` |
| API / Web / Storybook | Done | GitHub `All-Aboard` branch `Dev`, Dockerfiles per [dokploy-instance.md](../dokploy-instance.md) |
| Traefik domains (Dokploy) | Done | `dev.allaboard.fr`, `api-dev.allaboard.fr`, `storybook.allaboard.fr` (`https: false` until tunnel cutover) |
| Postgres data | Empty DB + API seed | No Mestryx `pg_dump` — migrations + `runSeedIfConfigured` on API boot; see [phase2-runbook.md](./phase2-runbook.md) |

**Automation:** `node scripts/migration/pretorya-phase2-recreate-dev.mjs`

**Report:** `.allaboard-migration/phase2/dev-recreate-report.json`

## 2b — staging + production

| Step | Status | Notes |
|------|--------|--------|
| Environment `staging` | Done (2026-10-05) | `environmentId`: `DOHgKyknMzxDOdBO8jdDS` |
| Environment `production` | Done | `environmentId`: `6PiHd21jqH3-1V6wKRAcV` |
| Postgres 18 (×2) | Done | See staging/prod report |
| API / Web (×2) | Done | Branches `staging` / `main`; deploy triggered on Pretorya |
| Traefik domains | Done | Staging + prod hosts per [dokploy-instance.md](../dokploy-instance.md) |
| Postgres data | Empty DB + migrations + seed | Team decision — no Mestryx dumps; see [DECISIONS.md](./DECISIONS.md) |

**Automation:** `node scripts/migration/pretorya-phase2-recreate-staging-prod.mjs` — see [phase2b-runbook.md](./phase2b-runbook.md). Browser runner: `scripts/migration/pretorya-phase2-browser-runner.js`.

**Report:** `.allaboard-migration/phase2/staging-prod-recreate-report.json`

**Not recreated (per plan):** Agent, Indexer, Storybook (dev only).

## 2c — Rails website

| Step | Status | Notes |
|------|--------|--------|
| Project `website` on Pretorya | Done (2026-10-06) | `projectId`: `tN1eeSE_mwji6DJL7dyxj` |
| Environment `production` | Done | `environmentId`: `bbZMxW0sjsoFUxywwHz9f` |
| Postgres 18 `Allaboard-rails` | Done | Empty DB — migrations via `db:prepare`; no Mestryx dump ([DECISIONS.md](./DECISIONS.md)). Internal app name in `.allaboard-migration/phase2/rails-recreate-report.json` |
| App `rails-fullstack` | Done | GitHub `Projet-Final---All-aboard` branch `deploy`, root `Dockerfile`; Puma on port 3000 |
| Traefik domain | Done | `rails.allaboard.fr` (`https: false` until tunnel cutover) |
| `cloudflared` | Not in this step | Phase 3 — new tunnel token |

**Automation:** `node scripts/migration/pretorya-phase2-recreate-rails.mjs` — see [phase2c-runbook.md](./phase2c-runbook.md).

**Report:** `.allaboard-migration/phase2/rails-recreate-report.json`
