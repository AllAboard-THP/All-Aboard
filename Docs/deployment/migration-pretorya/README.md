# Pretorya migration (Dokploy + Cloudflare)

Documentation for moving All-Aboard from the Mestryx Dokploy organization to **Pretorya**.

> **Agents:** Read [DECISIONS.md](./DECISIONS.md) first. **Postgres on Pretorya stays empty** (migrations + seed only) — **do not** require Phase 0 `pg_dump` restore or Mestryx host access.

| Step | Document |
|------|----------|
| **Plan & decisions** | [MIGRATION-PLAN.md](./MIGRATION-PLAN.md), [DECISIONS.md](./DECISIONS.md) |
| Phase 0 — backup & inventory | [phase0-runbook.md](./phase0-runbook.md), [phase0-cloudflare-inventory.md](./phase0-cloudflare-inventory.md) |
| Phase 1 — Pretorya server + GitHub | [phase1-runbook.md](./phase1-runbook.md), [phase1-artifacts.md](./phase1-artifacts.md) |
| Phase 2a — MVP dev recreate | [phase2-runbook.md](./phase2-runbook.md), [phase2-artifacts.md](./phase2-artifacts.md) |
| Phase 2b — MVP staging + production | [phase2b-runbook.md](./phase2b-runbook.md), [phase2-artifacts.md](./phase2-artifacts.md) |
| Phase 2c — Rails website | [phase2c-runbook.md](./phase2c-runbook.md), [phase2-artifacts.md](./phase2-artifacts.md) |
| Instance reference (pre-migration) | [../dokploy-instance.md](../dokploy-instance.md) |

Scripts: `scripts/migration/pretorya-phase0-*.mjs`, `pretorya-phase0-pg-dump.sh`, `pretorya-phase1-verify.mjs`, `pretorya-phase1-provision.mjs`, `pretorya-phase2-recreate-dev.mjs`, `pretorya-phase2-recreate-staging-prod.mjs`, `pretorya-phase2-recreate-rails.mjs`, `pretorya-phase2-browser-runner.js`.

**Secrets directory:** `.allaboard-migration/` at repo root (gitignored).
