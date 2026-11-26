# Phase 0 — execution log (non-secret)

| Step | Status | Location / notes |
|------|--------|------------------|
| Dokploy secrets export | Done (2026-09-24) | `.allaboard-migration/phase0/` — 8 app `.env`, 4 Postgres JSON, cloudflared compose |
| Vaultwarden backup | Done (2026-09-24) | Folder **All-Aboard migration** on `vaultwarden.fr` — secure notes `Phase0 \| …` + **INDEX** (attachments disabled on server) |
| Cloudflare inventory | Done (2026-10-05) | [phase0-cloudflare-inventory.md](./phase0-cloudflare-inventory.md) — tunnel ID, compose ref, 8 hosts, public DNS (CF edge); optional API enrich via `.allaboard-migration/phase0/cloudflare-api.env` (ingress, SSL mode, `cfargotunnel` CNAME) |
| Postgres `pg_dump` ×4 | **Skipped (decision 2026-10-06)** | No Mestryx admin/SSH — Pretorya uses empty DBs; see [DECISIONS.md](./DECISIONS.md). Script kept for optional future use only. |

## Exported applications (Mestryx)

- AllAboard monorepo website: Web, API, Storybook (dev); Web, API (staging, production)
- website: `rails-fullstack` (production)
- Infra: `cloudflared` compose (token in gitignored compose env file)

## Postgres targets

See `manifest.json` → `postgres[]` in `.allaboard-migration/phase0/` for container `appName` and dump commands.
