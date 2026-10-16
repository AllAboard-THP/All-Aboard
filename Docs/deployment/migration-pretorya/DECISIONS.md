# Pretorya migration — recorded decisions

Single source of truth for choices that **must not be re-opened** by automation or agents unless the human explicitly changes them.

## Postgres: empty databases on Pretorya (all environments)

| Field | Value |
|-------|--------|
| **Decision** | Do **not** restore Mestryx `pg_dump` backups on Pretorya. |
| **Date** | 2026-10-06 |
| **Reason** | No admin / SSH access on the Mestryx Dokploy host; Phase 0 `pg_dump` ×4 was **never obtained** and is **not planned**. |
| **Scope** | **dev**, **staging**, **production**, and future **Rails** Postgres on Pretorya. |

### What agents should do instead

1. Treat Pretorya Postgres as **empty** after create: API **migrations** on boot, then **`runSeedIfConfigured`** where env allows ([phase2-runbook.md](./phase2-runbook.md)).
2. **Do not** block Phase 3 smokes or cutover on dump restore.
3. **Do not** ask the human to run [pretorya-phase0-pg-dump.sh](../../../scripts/migration/pretorya-phase0-pg-dump.sh) on Mestryx unless they explicitly reopen this decision.

### Environment-specific notes

| Env | Seed / login secrets | Smoke expectation |
|-----|----------------------|-------------------|
| **dev** | `MVP_LOGIN_PASSWORD` and/or `DEV_SEED_PASSWORD` per [dev-phase2](../runbooks/dev-phase2.md) | Demo users + feed from repo seed |
| **staging** | `DEV_SEED_PASSWORD` only — no `MVP_LOGIN_PASSWORD` ([ADR 0003](../../adr/0003-authentication-users-production.md)) | Fresh staging data; not a copy of old Mestryx staging |
| **production** | No demo seed passwords in prod API env | Empty or manually created prod data after cutover |
| **Rails** (Phase 2c) | `db:prepare` / migrations on empty DB when recreated | No legacy Rails DB content from Mestryx |

### What we knowingly give up

- Historical rows on Mestryx (users, bookings, uploads, help threads, etc.) are **not** migrated.
- Rollback to Mestryx **data** (not just DNS) would require Mestryx still running with its old volumes — not a Pretorya restore path.

### Optional path (explicit human request only)

If dumps appear later (e.g. third-party export), [phase0-runbook.md](./phase0-runbook.md) §2 documents **optional** restore steps. That path is **out of scope** for the current migration plan.
