# Phase 2b runbook — MVP staging + production on Pretorya

Recreate **staging** and **production** on org **Pretorya** (parallel to Mestryx) while public traffic stays on the old tunnel until Cloudflare cutover.

References: [phase2-runbook.md](./phase2-runbook.md) (dev), [dokploy-instance.md](../dokploy-instance.md), [staging-phase2.md](../runbooks/staging-phase2.md).

## Prerequisites

- Phase **0** exports under `.allaboard-migration/phase0/` (Postgres JSON + API/Web `.env` per env).
- Phase **1** complete: deploy server `allaboard-pretorya`, GitHub App on `All-Aboard`.
- Pretorya API key in `.allaboard-migration/phase1/dokploy-api.env` **or** logged-in session on [app.dokploy.com](https://app.dokploy.com) (org **Pretorya**).

## What gets created (per env)

| Resource | staging | production |
|----------|---------|------------|
| Git branch | `staging` | `main` |
| Postgres 18 | `Postgres` | `Postgres` |
| API | `infra/docker/Dockerfile.api` :4000 | same |
| Web | `infra/docker/Dockerfile.web` :3000 | same |
| Domains (Traefik) | `staging.allaboard.fr`, `api-staging.allaboard.fr` | `allaboard.fr`, `api.allaboard.fr` |

**Not recreated:** Agent, Indexer, Storybook (dev only).

## Environment variables (from Phase 0)

- **staging API:** `DATABASE_URL` (patched to Pretorya Postgres), `JWT_SECRET`, `DEV_SEED_PASSWORD`, no `MVP_LOGIN_PASSWORD` ([ADR 0003](../../adr/0003-authentication-users-production.md)).
- **production API:** Phase 0 export may be minimal; the recreate script patches `DATABASE_URL` and adds `JWT_SECRET` if missing (new value — document rotation in your vault, not in Git).
- **Web:** `API_URL=http://<internal-api-appName>:4000` after first API deploy.

## Automation

```bash
# API key path (preferred once key is valid)
node scripts/migration/pretorya-phase2-recreate-staging-prod.mjs

# Single env
node scripts/migration/pretorya-phase2-recreate-staging-prod.mjs --only staging
node scripts/migration/pretorya-phase2-recreate-staging-prod.mjs --only production
```

If `DOKPLOY_API_KEY` returns **401**, regenerate the key in Dokploy **Profile → API Keys**, update `.allaboard-migration/phase1/dokploy-api.env`, then re-run.

**Browser fallback** (session cookie on app.dokploy.com):

1. `node scripts/migration/pretorya-phase2-recreate-staging-prod.mjs --only staging --emit-cfg-b64` → load into `localStorage.pretoryaPhase2Cfg` in DevTools.
2. Paste/run `scripts/migration/pretorya-phase2-browser-runner.js` in the console (or store in `localStorage.pretoryaPhase2Runner` and `eval(...)`).
3. Repeat for `--only production`.

Non-secret report: `.allaboard-migration/phase2/staging-prod-recreate-report.json`.

## Postgres data

**Canonical:** empty databases on Pretorya for staging and production — migrations on API boot, staging seed per ADR 0003 (`DEV_SEED_PASSWORD`, no `MVP_LOGIN_PASSWORD`). **Do not** plan `pg_dump` restore from Mestryx ([DECISIONS.md](./DECISIONS.md), [phase2-runbook.md](./phase2-runbook.md) § Postgres data).

## Next steps

- Phase **3:** test hostname → Pretorya Traefik.
- Phase **4–5:** move Cloudflare Public Hostnames env by env.
- Update [dokploy-instance.md](../dokploy-instance.md) after cutover with Pretorya internal service names.
