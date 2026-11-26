# Phase 0 runbook — Mestryx backup (Pretorya migration)

Operational steps for **Phase 0** of the Mestryx → Pretorya migration. Outputs are **secrets** — store in a password manager or encrypted volume, not in Git.

> **Postgres dumps:** **not required** for Pretorya cutover. Team decision — empty DBs on Pretorya ([DECISIONS.md](./DECISIONS.md)). §2 below is **optional** reference only.

## Prerequisites

| Item | Source |
|------|--------|
| Dokploy API | Mestryx instance — `DOKPLOY_URL` (e.g. `https://dokploy.mestryx.dev/api`) and `DOKPLOY_API_KEY` |
| Cloudflare (optional) | `CLOUDFLARE_API_TOKEN` with Zero Trust read + `CLOUDFLARE_ACCOUNT_ID` |
| Postgres dumps (optional) | Shell on Mestryx Docker host — **skipped** for current migration; do not block later phases |

Cursor MCP: copy `DOKPLOY_URL` / `DOKPLOY_API_KEY` from your local MCP config into the shell for the export script (do not commit keys).

## 1. Export Dokploy secrets and metadata

From repo root:

```bash
export DOKPLOY_URL="https://dokploy.mestryx.dev/api"
export DOKPLOY_API_KEY="<from Dokploy UI or MCP env>"

node scripts/migration/pretorya-phase0-export.mjs
```

Creates `.allaboard-migration/phase0/`:

- `applications/*.env` — Web, API, Storybook, Rails environment blocks
- `postgres/*.json` — connection metadata (includes DB passwords)
- `compose/*.env` — `cloudflared` tunnel token (regenerate on Pretorya; do not reuse in prod long-term)
- `manifest.json` — index + `pg_dump` docker commands

**Not exported:** Agent and Indexer (legacy / disabled per [dokploy-instance.md](../dokploy-instance.md)).

## 2. Postgres — four databases (optional; not pursued)

| Slug | Project | Environment |
|------|---------|-------------|
| `mvp-dev` | AllAboard monorepo website | dev |
| `mvp-staging` | AllAboard monorepo website | staging |
| `mvp-production` | AllAboard monorepo website | production |
| `rails-production` | website | production |

On the Dokploy **server** (where `docker ps` lists Postgres containers):

```bash
# Copy scripts/migration/pretorya-phase0-pg-dump.sh to the host, or run from a checkout on the host
chmod +x scripts/migration/pretorya-phase0-pg-dump.sh
./scripts/migration/pretorya-phase0-pg-dump.sh
```

Alternative (one-off, from `manifest.json` `pgDumpCommand` / `pgDumpCopyHint`):

```bash
docker exec -t <postgres-appName> pg_dump -U <user> -d <db> -Fc -f /tmp/backup.dump
docker cp <postgres-appName>:/tmp/backup.dump ./backup.dump
```

Copy resulting `*.dump` files into `.allaboard-migration/phase0/postgres/dumps/` on your secure backup storage.

## 3. Cloudflare tunnel and public hostnames

```bash
# After step 1 — optional API (recommended for ingress + SSL + authoritative DNS)
export CLOUDFLARE_API_TOKEN="<Zero Trust read token>"
export CLOUDFLARE_ACCOUNT_ID="<account id>"   # optional if in manifest.json

# Or copy scripts/migration/cloudflare-api.env.example →
#   .allaboard-migration/phase0/cloudflare-api.env (gitignored)

node scripts/migration/pretorya-phase0-cloudflare-inventory.mjs
```

Updates:

- `.allaboard-migration/phase0/cloudflare-inventory.json` (full snapshot)
- [phase0-cloudflare-inventory.md](./phase0-cloudflare-inventory.md) (no secrets — safe in Git)

Manual checklist (dashboard **Zero Trust → Networks → Tunnels**):

- [ ] Tunnel name and connector health (Mestryx)
- [ ] All **Public Hostnames** (8 MVP/Rails hosts) — hostname → service URL
- [ ] Zone **SSL/TLS** = **Full**
- [ ] DNS CNAME / tunnel records for `*.allaboard.fr`

## 4. Verification

- [ ] `.allaboard-migration/phase0/applications/` contains Web + API for dev, staging, production
- [ ] API `.env` files include `JWT_SECRET`, `DATABASE_URL`, seed/login passwords where applicable
- [ ] Rails `RAILS_MASTER_KEY` and `DATABASE_URL` exported
- [ ] ~~Four Postgres dump files~~ **N/A** — skipped per [DECISIONS.md](./DECISIONS.md) (optional if human reopens dump path)
- [ ] [phase0-cloudflare-inventory.md](./phase0-cloudflare-inventory.md) lists all public hosts

## Related docs

- [environment-variables.md](../environment-variables.md) — variable matrix
- [dokploy-instance.md](../dokploy-instance.md) — current instance facts (update after Pretorya cutover)
