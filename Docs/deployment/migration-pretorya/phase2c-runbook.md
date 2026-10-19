# Phase 2c runbook — Rails website on Pretorya

Recreate the legacy **website** project on org **Pretorya** (parallel to Mestryx). Public traffic stays on the old tunnel until Cloudflare cutover.

References: [DECISIONS.md](./DECISIONS.md), [dokploy-instance.md](../dokploy-instance.md).

**Out of scope here:** Infra compose `cloudflared` (Phase 3 — new tunnel token).

## Prerequisites

- Phase **1** complete: deploy server `allaboard-pretorya`, GitHub App that can see `AllAboard-THP/Projet-Final---All-aboard`.
- Phase **0** exports under `.allaboard-migration/phase0/`:
  - `postgres/website-production-Allaboard-rails.json`
  - `applications/website-production-rails-fullstack.env` (`RAILS_MASTER_KEY`, `DATABASE_URL`)
- Pretorya API key in `.allaboard-migration/phase1/dokploy-api.env`.

## What gets created

| Resource | Setting |
|----------|---------|
| Project | `website` |
| Environment | `production` |
| Postgres 18 | Name `Allaboard-rails`, database `All-aboard-database`, user `postgres` |
| App | `rails-fullstack` |
| Git | `AllAboard-THP/Projet-Final---All-aboard`, branch `deploy`, `autoDeploy: true` |
| Build | Dockerfile at repo root (`Dockerfile`), context `.` |
| Domain (Traefik) | `rails.allaboard.fr` → port **3000**, `https: false` (TLS stays at Cloudflare) |
| Env | `RAILS_MASTER_KEY` from Phase 0; `DATABASE_URL` rewritten to the new internal Postgres app name |

**Not recreated:** Agent, Indexer, cloudflared.

## Postgres data

**Canonical:** empty database. The image entrypoint runs `bin/rails db:prepare` on boot (migrations only). **Do not** restore a Mestryx dump ([DECISIONS.md](./DECISIONS.md)).

## Automation

```bash
node scripts/migration/pretorya-phase2-recreate-rails.mjs
```

Non-secret report: `.allaboard-migration/phase2/rails-recreate-report.json`.

The script waits until Postgres and `rails-fullstack` report Dokploy status `done`. A Rails image build can take several minutes.

## Next steps

- Phase **3:** test hostname → Pretorya Traefik (includes `cloudflared`).
- Phase **4–5:** move `rails.allaboard.fr` after MVP envs, or with them per the cutover order.
- Rotate `RAILS_MASTER_KEY` only if a leak is suspected ([MIGRATION-PLAN.md](./MIGRATION-PLAN.md) offboarding).
