# Dokploy deployment — All-Aboard instance (reference)

This document describes the **effective** All-Aboard configuration on Dokploy, as observed via MCP `user-dokploy-mcp` on **2026-10-07**. It complements the [theoretical matrix](environment-variables.md) (conventions and variable tables — do not duplicate secret values here).

**Product timeline:** [canonical documentation README](../README.md). **Migration:** [Pretorya migration](migration-pretorya/README.md). Smoke journal: [guides/web-api-integration.md](../guides/web-api-integration.md). Runbooks: [dev Phase 2](runbooks/dev-phase2.md), [staging Phase 2](runbooks/staging-phase2.md).

**Last updated:** 2026-10-07. Public hostnames moved to org **Pretorya** (Dokploy Cloud, `https://app.dokploy.com`). Cursor MCP `user-dokploy-mcp` uses that API (`DOKPLOY_URL=https://app.dokploy.com/api`). Organization id: `Z0AxAmNeoDFUc6WbU3ueP`. Deploy server: `allaboard-pretorya` (`188.245.0.208`).

**Secrets:** database passwords, API keys, tunnel tokens, and the Dokploy API key stay in Dokploy or `.allaboard-migration/` (gitignored). Never commit them. Postgres passwords, `DATABASE_URL`, and `JWT_SECRET` were rotated on **2026-10-07** (dev, staging, production, Rails DB). `RAILS_MASTER_KEY` was not. Copy `.allaboard-migration/phase6/rotated-secrets.env` into a password manager.

**Mestryx:** the previous org is no longer the public path. Cloudflare tunnel `dockploy Mestryx` was **deleted** on 2026-10-07. Public hostnames stay on `allaboard-pretorya`. Old Dokploy projects on the Mestryx host were not stopped (no API key, no SSH). See [phase6-runbook.md](migration-pretorya/phase6-runbook.md).

---

## Projects

| Project | Environments | What runs |
|---------|--------------|-----------|
| `AllAboard monorepo website` | `dev`, `staging`, `production` | Web + API + Postgres 18 per env. **Storybook** on `dev` only. |
| `website` | `production` | Rails `rails-fullstack` + Postgres 18 |
| `Infra` | `production` | Compose `cloudflared` (tunnel `allaboard-pretorya`) |

Git repos: `AllAboard-THP/All-Aboard` (MVP) and `AllAboard-THP/Projet-Final---All-aboard` (Rails, branch `deploy`).

**Not on this instance:** Agent and Indexer. Do not recreate them (legacy Indexer; Agent stays off until an explicit ops decision). See [ADR 0004](../adr/0004-agent-indexer-architecture.md).

Postgres on Pretorya was created **empty** (migrations + seed). Mestryx dumps were not restored ([DECISIONS.md](migration-pretorya/DECISIONS.md)).

---

## Docker build (Node services)

| Parameter | Value |
|-----------|--------|
| `buildType` | `dockerfile` |
| `buildPath` | `/` (monorepo root) |
| `dockerContextPath` | `.` |
| Git submodules | disabled (`enableSubmodules: false`) |
| Trigger | `push`, `autoDeploy: true` on Web, API, and Storybook |

| Application | Dockerfile | Port |
|-------------|------------|------|
| Web | `infra/docker/Dockerfile.web` | 3000 |
| API | `infra/docker/Dockerfile.api` | 4000 |
| Storybook (dev only) | `infra/docker/Dockerfile.storybook` | 8080 |
| Rails | repo root `Dockerfile` | 3000 |

---

## Git branches (observed)

| Environment | Web | API | Storybook |
|-------------|-----|-----|-----------|
| production | `main` | `main` | — |
| staging | `staging` | `staging` | — |
| dev | `Dev` | `Dev` | `Dev` |

Rails: branch `deploy` on `Projet-Final---All-aboard`.

---

## Public domains

TLS terminates at Cloudflare (zone SSL mode **Full**). Dokploy domain objects stay `https: false`. Traffic enters via tunnel `allaboard-pretorya` (`19b7e001-bf8a-46dd-b249-2edae7200c68`) → `cloudflared` on the Pretorya host → Traefik `http://127.0.0.1:80`.

| Environment | Web host | API host | Other |
|-------------|----------|----------|-------|
| production | `allaboard.fr` | `api.allaboard.fr` | Rails `rails.allaboard.fr` |
| staging | `staging.allaboard.fr` | `api-staging.allaboard.fr` | — |
| dev | `dev.allaboard.fr` | `api-dev.allaboard.fr` | `storybook.allaboard.fr` |

Canonical HTTPS origins:

| Environment | Site | API |
|-------------|------|-----|
| production | `https://allaboard.fr` | `https://api.allaboard.fr` |
| staging | `https://staging.allaboard.fr` | `https://api-staging.allaboard.fr` |
| dev | `https://dev.allaboard.fr` | `https://api-dev.allaboard.fr` |

Storybook: `https://storybook.allaboard.fr`. Rails: `https://rails.allaboard.fr`.

A test hostname `pretorya-dev.allaboard.fr` also points at the same tunnel. Smoke: `pnpm smoke:dev` — [dev Phase 2](runbooks/dev-phase2.md).

---

## Internal Docker names (`API_URL`)

Web SSR uses the API container DNS name on the Dokploy network, port **4000**. Observed `API_URL` values (2026-10-07):

| Environment | Web `API_URL` | API app name | Web app name | Postgres app name |
|-------------|---------------|--------------|--------------|-------------------|
| dev | `http://app-synthesize-haptic-interface-qgmgyk:4000` | `app-synthesize-haptic-interface-qgmgyk` | `app-bypass-open-source-panel-87oh51` | `allaboard-monorepo-website-postgres-dev-kllns5-xxsfcn` |
| staging | `http://app-program-neural-pixel-rvg2mp:4000` | `app-program-neural-pixel-rvg2mp` | `app-quantify-online-program-qmm29n` | `allaboard-monorepo-website-postgres-staging-lq3xsf-xo6cvv` |
| production | `http://app-navigate-1080p-pixel-mwghym:4000` | `app-navigate-1080p-pixel-mwghym` | `app-connect-digital-bus-hjzcw5` | `allaboard-monorepo-website-postgres-production-9uoagl-jkhkgu` |

Storybook (dev) uses the same dev API URL. Rails app name: `app-bypass-mobile-transmitter-ewd5ha`. Rails Postgres: `website-allaboard-rails-3bff2f-majvmg` (database `All-aboard-database`). Compose app name: `infra-cloudflared-e7679e-njiyzm`.

After a recreate, Dokploy may assign a new app name. Update the Web `API_URL` in that environment and redeploy Web.

**Web keys (no values):** `API_URL`, `NODE_ENV`, `APP_ENV`, `LOG_LEVEL`.

The API is also public on `api*.allaboard.fr`. Browser feed traffic goes through the Next BFF — [guides/web-api-integration.md](../guides/web-api-integration.md).

---

## API (Fastify)

Typical keys: `NODE_ENV`, `APP_ENV`, `LOG_LEVEL`, `PORT=4000`, `DATABASE_URL`, `JWT_SECRET` (≥ 32 characters, distinct per env). Full grid: [environment-variables.md](environment-variables.md).

| Variable | Where |
|----------|--------|
| `MVP_LOGIN_PASSWORD` | **dev** API only |
| `DEV_SEED_PASSWORD` | staging API (and dev if used) — not production ([ADR 0003](../adr/0003-authentication-users-production.md)) |
| `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGINS` | dev and staging API |

Postgres image: **PostgreSQL 18**. MVP database name `allaboard`, user `allaboard`, port **5432** on the internal host above.

---

## Storybook, Rails, tunnel

| Service | Env | Branch | Host | Port | Status (2026-10-07) |
|---------|-----|--------|------|------|---------------------|
| Storybook | dev | `Dev` | `storybook.allaboard.fr` | 8080 | deployed (`done`) |
| rails-fullstack | production | `deploy` | `rails.allaboard.fr` | 3000 | deployed (`done`) |
| cloudflared | Infra / production | raw compose | — | host Traefik :80 | compose `done` |

Rails env keys: `RAILS_MASTER_KEY`, `DATABASE_URL` (internal Postgres).

---

## Service status (MCP, 2026-10-07)

| Environment | Web | API | Postgres | Notes |
|-------------|-----|-----|----------|-------|
| dev | `done`, autoDeploy | `done`, autoDeploy | `done` | Storybook `done`. Phase 2 seed vars present. |
| staging | `done`, autoDeploy | `done`, autoDeploy | `done` | `DEV_SEED_PASSWORD`, no `MVP_LOGIN_PASSWORD` |
| production | `done`, autoDeploy | `done`, autoDeploy | `done` | Git `main` (Phase 1 app until that branch is promoted) |

Agent and Indexer: **absent** (not disabled leftovers).

---

## Cloudflare

| Tunnel | Id | Status on 2026-10-07 | Ingress |
|--------|----|----------------------|---------|
| `allaboard-pretorya` | `19b7e001-bf8a-46dd-b249-2edae7200c68` | healthy | public hostnames above |
| `dockploy Mestryx` | `e1e5ba46-8988-40db-8e48-1662853a4426` | deleted `2026-10-07T13:44:59Z` | was catch-all 404 only |

Public DNS uses the Pretorya tunnel (cutover `2026-10-07T12:54:03Z`). There is no Mestryx Dokploy API key in the current Pretorya MCP config, so old projects cannot be stopped from this token.

---

## Document maintenance

1. MCP `user-dokploy-mcp` must stay on `https://app.dokploy.com/api` (org Pretorya).
2. Refresh domains, branches, and internal app names from `project-all` / `application-one`. Do not paste `env` blobs (they contain secrets).

**Warning:** Dokploy API responses may include full `env`, GitHub metadata, or server metrics tokens. Do not copy those JSON bodies into the repo or tickets.
