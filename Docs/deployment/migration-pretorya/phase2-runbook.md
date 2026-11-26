# Phase 2a runbook — MVP dev on Pretorya

Recreate **dev only** on org **Pretorya** while Mestryx stays live until Cloudflare cutover.

Postgres policy for **all** Pretorya environments (dev, staging, prod, Rails): [DECISIONS.md](./DECISIONS.md).

## Prerequisites

- Phase 1 complete: remote server `allaboard-pretorya`, GitHub App on `AllAboard-THP/All-Aboard` ([phase1-runbook.md](./phase1-runbook.md)).
- **Env reference (recommended):** Phase 0 exports under `.allaboard-migration/phase0/` (`applications/*-dev-*.env`) — variable *names* and layout, not necessarily live Mestryx access today.
- **Postgres:** team default is [empty database + seed](#postgres-data--empty-database--seed) — **not** Mestryx dump restore ([DECISIONS.md](./DECISIONS.md)). Dump restore is documented only as an optional human-initiated path.

## Automated recreate

1. Copy [dokploy-api.env.example](../../../scripts/migration/dokploy-api.env.example) → `.allaboard-migration/phase1/dokploy-api.env` with a **Pretorya** API key that accepts `x-api-key` on `https://app.dokploy.com/api`.
2. Run:

```bash
node scripts/migration/pretorya-phase2-recreate-dev.mjs
```

3. Inspect `.allaboard-migration/phase2/dev-recreate-report.json`.

If the API key returns `401`, use the Dokploy UI while logged in, or generate a key via Settings and retry.

## Manual checklist (parity with Mestryx dev)

| Resource | Setting |
|----------|---------|
| Postgres | `postgres:18`, DB/user `allaboard` |
| API | `infra/docker/Dockerfile.api`, port 4000, branch `Dev` |
| Web | `infra/docker/Dockerfile.web`, port 3000, `API_URL` → internal API app name |
| Storybook | `infra/docker/Dockerfile.storybook`, port 8080 |
| API env | See [dev-phase2 runbook](../runbooks/dev-phase2.md) §2 |
| Domains | `dev.allaboard.fr`, `api-dev.allaboard.fr`, `storybook.allaboard.fr` |

After API is up, set Web `API_URL` to `http://<api-appName>:4000` if the script used a placeholder, then redeploy Web.

## Postgres data

### Empty database + seed (canonical — all Pretorya envs)

**Binding decision:** no Mestryx `pg_dump` for this migration. Applies to **dev** (this runbook), **staging/production** ([phase2b-runbook.md](./phase2b-runbook.md)), and future **Rails** Postgres. You validate **Pretorya + Git + env secrets**, not a copy of legacy Mestryx data.

1. Deploy **empty** Postgres + API on Pretorya.
2. Ensure API env includes at least:
   - `DATABASE_URL`, `JWT_SECRET`, `PORT=4000`, `NODE_ENV=production`, `APP_ENV=dev`
   - **`MVP_LOGIN_PASSWORD`** (dev `/help/new` smoke) and/or **`DEV_SEED_PASSWORD`** (seed accounts `bob@dev.local` / `alice@dev.local` — [ADR 0003](../../adr/0003-authentication-strategy.md))
3. **Redeploy API** (or restart). On boot, `apps/api` runs migrations then `runSeedIfConfigured` ([`migrate.ts`](../../../apps/api/src/migrate.ts), [`seed.ts`](../../../apps/api/src/db/seed.ts)) — subjects, demo users, demo feed content (idempotent).
4. **Verify in API runtime logs** (not build logs):
   - `api: seeded … subject(s)` and `api: seeded … user(s)`
   - If you see `skipping user/demo seed`, set `MVP_LOGIN_PASSWORD` or `DEV_SEED_PASSWORD` → Save → **Redeploy API**
5. **Manual seed (if needed):** Dokploy → API service → shell with same env as production container:

```bash
pnpm --filter api run db:seed
```

6. **Smoke** once a test hostname points to Pretorya (Phase 3): [dev-phase2.md](../runbooks/dev-phase2.md) — base `pnpm smoke:dev`; full journey with `MVP_LOGIN_PASSWORD` matching Dokploy API.

**What you do not get:** historical rows from old Mestryx dev (old help requests, uploads, one-off data). **What you do get:** MVP dev behaviour from repo seeds + new data created on Pretorya.

### Optional: restore Phase 0 dump (Mestryx export)

Only when you have a **Phase 0 `.sql`** and host access to restore on the Pretorya Postgres volume:

1. Deploy Postgres + API (migrations may run on empty DB first).
2. Restore per [phase0-runbook.md](./phase0-runbook.md) (`pg_restore` / `psql`) on the Pretorya Docker host.
3. Redeploy API if needed; smoke as above.

Use this only if the human **explicitly** obtains dumps later — **out of scope** for the current plan ([DECISIONS.md](./DECISIONS.md)).

## Next

- Phase 3: Cloudflare test hostname → Pretorya Traefik.
- Phase 2b+: staging, production, Rails.
