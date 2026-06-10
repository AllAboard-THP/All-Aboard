# Dokploy deployment — All-Aboard instance (reference)

This document describes the **effective** All-Aboard project configuration on Dokploy, as observable via the Dokploy API (MCP `user-dokploy-allaboard-mcp`). It complements the [theoretical matrix](environment-variables.md) (conventions, **variable tables by type** — do not duplicate them here).

**Product timeline / application stack** (phase order, TanStack, auth): [canonical documentation README](../README.md).

**Last updated:** 2026-06-03 (#69 — Agent CI build + legacy Indexer removal doc; `apps/agent` scaffold merge #66). 2026-05-29 (staging: MVP Phase 2 + ADR 0003 auth — `DEV_SEED_PASSWORD`, no `MVP_LOGIN_PASSWORD`; full smoke 2026-05-29). **2026-05-20:** `allaboard.fr` domains + dedicated API; Agent/Indexer **disabled**; post-merge PR #9 Phase 1 — feed smoke OK. Smoke detail: [guides/web-api-integration.md](../guides/web-api-integration.md) (journal); runbooks: [dev Phase 2](runbooks/dev-phase2.md), [staging Phase 2](runbooks/staging-phase2.md).

**Secrets:** database passwords, API keys and GitHub tokens are configured **only** in Dokploy. Never commit them in this repo.

---

## Project and environments

| Element | Value |
|--------|--------|
| Dokploy project | `AllAboard monorepo website` |
| Git repos | `AllAboard-THP/All-Aboard` (Dokploy GitHub App integration) |
| Environments | `production`, `staging`, `dev` |

Each environment typically contains:

- four **application resources**: Web, API, Agent, Indexer (Agent **ready to build** since #66 — still **disabled** on instance until ops validation; Indexer = **legacy placeholder** — do not reactivate, see Agent and Indexer section);
- one **Postgres** database managed by Dokploy.

---

## Docker build (common to all Node services)

| Parameter | Value |
|-----------|--------|
| `buildType` | `dockerfile` |
| `buildPath` | `/` (monorepo root) |
| `dockerContextPath` | `.` |
| Git submodules | disabled (`enableSubmodules: false`) |
| Trigger | **Web + API**: `push` on configured branch, `autoDeploy: true`. **Agent**: `autoDeploy: false` — manual deploy after CI validation (#69). **Indexer (legacy)**: `autoDeploy: false` — **do not reactivate**. |

Dockerfiles used (paths relative to repo root):

| Application | Dockerfile | Notes |
|-------------|------------|-------|
| Web | `infra/docker/Dockerfile.web` | — |
| API | `infra/docker/Dockerfile.api` | — |
| Agent | `infra/docker/Dockerfile.agent` | `apps/agent` — CI build + `/health` smoke (#69) |
| Indexer | `infra/docker/Dockerfile.indexer` | **Legacy** — no `apps/indexer`; do not build / reactivate |

---

## Git branches per environment (observed state)

**Web + API** strategy: align Dokploy branch with environment release Git branch.

| Environment | Web | API |
|----------------|-----|-----|
| production | `main` | `main` |
| staging | `staging` | `staging` |
| dev | `Dev` | `Dev` |

**Agent:** branches configured on `Dev` in observed instance, including under `production`. Adjust on **Agent reactivation**: align with Web/API (not `Dev` in prod).

**Indexer (legacy):** historical Dokploy resource — **do not reactivate**; prefer deleting application from Dokploy project (see Agent and Indexer section).

---

## Public domains (Traefik / Dokploy)

Each environment has a distinct **Web host** and **API host** under `allaboard.fr` (MCP `application-one` survey, `domains[].host` and `port` fields).

| Environment | Web (`host`) | Web container port | API (`host`) | API container port |
|----------------|--------------|-------------------|--------------|-------------------|
| production | `allaboard.fr` | 3000 | `api.allaboard.fr` | 4000 |
| staging | `staging.allaboard.fr` | 3000 | `api-staging.allaboard.fr` | 4000 |
| dev | `dev.allaboard.fr` | 3000 | `api-dev.allaboard.fr` | 4000 |

**Canonical public URLs** (use in product doc, mobile clients, CORS, webhooks; prefer **HTTPS** once certificates active in Dokploy per domain):

| Environment | Site | API (origin) |
|----------------|------|----------------|
| production | `https://allaboard.fr` | `https://api.allaboard.fr` |
| staging | `https://staging.allaboard.fr` | `https://api-staging.allaboard.fr` |
| dev | `https://dev.allaboard.fr` | `https://api-dev.allaboard.fr` |

Example API paths (same contract as local, detail in [guides/web-api-integration.md](../guides/web-api-integration.md)):

- `GET /health`, `GET /feed` (public)
- `POST /auth/login`, `POST /help-requests` (JWT on create; MVP login)
- Smoke: `pnpm smoke:dev` — [deployment/runbooks/dev-phase2.md](runbooks/dev-phase2.md)

Dev URLs: `https://api-dev.allaboard.fr/health`, `https://dev.allaboard.fr/api/feed`, `https://dev.allaboard.fr/help/new`.

**TLS note:** Dokploy domain objects may still show `https: false` depending on termination state; operational goal remains **HTTPS** everywhere (Let's Encrypt or managed cert in domain UI).

---

## Web to API call (`API_URL` — internal network)

For **Next.js SSR** (server in Web container), `API_URL` should generally point to **internal DNS name** of API service on Dokploy Docker network, port **4000**, e.g.:

```text
http://<internal-api-service-name>:4000
```

Exact prefix (`app-…` or long name like `allaboard-monorepo-website-api-…`) is assigned by Dokploy. After redeploy or rename, update **Web** variable in Dokploy to stay aligned with API service in **same environment**.

**Web** environment variable keys (no values): `API_URL`, `NODE_ENV`, `APP_ENV`, `LOG_LEVEL`.

**Dual exposure:** today API is reachable **publicly** via `api*.allaboard.fr` domains **and** **internally** for Web. Intentional: internal = latency and SSR simplicity; public = browser, mobile, partners, `CORS_ALLOWED_ORIGINS` on Fastify.

For **browser same-origin fetch**, alternatively expose Next rewrites (`/api/...`); otherwise client calls `https://api-staging.allaboard.fr` directly (with CORS configured on API).

---

## API (Fastify service)

Typical environment keys: `NODE_ENV`, `APP_ENV`, `LOG_LEVEL`, `PORT=4000`. `CORS_*` grid and secrets: [deployment/environment-variables.md](environment-variables.md).

**Phase 2 (required on dev API)** — without these variables container may crash at startup (`502` behind Cloudflare):

| Variable | Role |
|----------|------|
| `DATABASE_URL` | Internal Postgres (dev Postgres service host, port 5432) |
| `JWT_SECRET` | Min. 32 characters (`NODE_ENV=production` in Docker image) |
| `MVP_LOGIN_PASSWORD` | Dev/CI only (fallback login without DB) — **not** staging/prod |
| `DEV_SEED_PASSWORD` | Seed `bob@dev.local` / `alice@dev.local` (ADR 0003) — staging + dev |

Procedure: [deployment/runbooks/dev-phase2.md](runbooks/dev-phase2.md). Auth: [ADR 0001](../adr/0001-authentication-strategy.md).

**Exposure:** dedicated Traefik domain per environment (table above). For **Web SSR → internal API**, no CORS needed. For **browser fetch** to `https://api-*.allaboard.fr`, configure `CORS_ALLOWED_ORIGINS` (see matrix). Current home feed flow goes through Next BFF — see [guides/web-api-integration.md](../guides/web-api-integration.md).

---

## Postgres (Dokploy)

- One **Postgres** instance per environment (separate service in project).
- Image on reference instance: **PostgreSQL 18**.
- Dedicated database and user (names shown in UI: e.g. database `allaboard`).
- Host for other services in same project: internal Postgres service name (visible in Dokploy), port **5432**.

`DATABASE_URL` for Agent / Indexer must use this internal host and credentials defined in UI (do not duplicate here).

---

## Agent and Indexer

### All-Aboard Agent (`apps/agent`)

Package [`apps/agent`](../apps/agent/README.md) is **present in monorepo** (scaffold #66): `GET /health`, stub `POST /routing/evaluate`, image [`infra/docker/Dockerfile.agent`](../infra/docker/Dockerfile.agent).

**Instance status (2026-06-03):** Dokploy **Agent** application still **disabled** (`enabled: false`, `autoDeploy: false`, container stopped) — CI gate #69 shipped; **production** remains paused until explicit human validation.

**CI (#69):** GitHub Actions `agent` job (paths-filter `apps/agent/**`, `infra/docker/Dockerfile.agent`, …) — Docker build + `GET /health` smoke on port **4100**. Detail: [Docs/tasks/69-agent-ci-dokploy/README.md](../tasks/69-agent-ci-dokploy/README.md).

**Agent reactivation procedure** (dev / staging — after green CI on target branch):

1. Dokploy → target environment → **Agent** application → `enabled: true`.
2. Git branch: align with environment **Web/API** (`Dev` / `staging` / `main` — not `Dev` in production).
3. Variables: `PORT=4100`, `NODE_ENV=production`, `APP_ENV`, `LOG_LEVEL` — grid [deployment/environment-variables.md](environment-variables.md). No public Traefik domain — **internal service** only.
4. On **API** side: set `AGENT_URL` to internal Agent service DNS name (e.g. `http://<agent-service>:4100`) once handoff integration #68 deployed.
5. Run **manual** deploy; keep `autoDeploy: false` until end-to-end integration validated.
6. Internal network smoke: `GET http://<agent-service>:4100/health` → `{ "status": "ok" }`.

**Production:** do not reactivate until ops + product validate agent handoff (#68) and expected load.

### Indexer placeholder (legacy — do not reactivate)

Dokploy **Indexer** applications still exist in all three environments (Dockerfile `infra/docker/Dockerfile.indexer`, `INDEXER_*` variables, port **4200**).

**Architecture decision (ADR 0004):** All-Aboard **does not implement** `apps/indexer`. Graph indexing is handled by **Intuition network indexer** (subnet + GraphQL); All-Aboard publishes via **outbox bridge** (#67) in `apps/api`.

| Element | Action |
|---------|--------|
| `infra/docker/Dockerfile.indexer` | Historical bootstrap artefact — **do not build** in CI or Dokploy |
| Dokploy "Indexer" service | **Do not reactivate** (`enabled: false`); **recommended**: delete resource from project |
| Intuition indexer | External infra — outside All-Aboard Dokploy |

**Operational status:** same as May 2026 — `enabled: false`, `autoDeploy: false`, containers stopped. Build would fail without `apps/indexer` package; leaving disabled or deleting avoids dashboard noise.

**Do not confuse:** "All-Aboard Dokploy Indexer" (legacy) ≠ "Intuition Indexer" (blockchain network documented in [ADR 0004](../adr/0004-agent-indexer-architecture.md)).

---

## Postgres: operational access

- Backups: configure per Dokploy policy (Postgres service backups).
- Password rotation: only via Dokploy UI or API, then update `DATABASE_URL` on consuming services.

---

## Service status summary (MCP reference)

| Environment | Web | API | Agent | Indexer |
|----------------|-----|-----|-------|---------|
| production | deployed OK | deployed OK | **disabled** (CI #69 OK; reactivate manually after validation) | **legacy — do not reactivate** |
| staging | deployed OK (MVP Phase 2, commit `d9ca975`; Web manual redeploy 2026-05-27 if auto build fails) | deployed OK (Phase 2 vars — 2026-05-25; PR #54) | **disabled** (Agent build ready) | **legacy — do not reactivate** |
| dev | deployed OK | deployed OK (Phase 2: Postgres + JWT vars) | **disabled** (Agent build ready) | **legacy — do not reactivate** |

**Dev (2026-05-25):** Bob journey MVP validated — journal [integration guide](../guides/web-api-integration.md), [dev runbook](runbooks/dev-phase2.md).

**Staging (2026-05-29):** MVP Phase 2 + ADR 0003 auth (`DEV_SEED_PASSWORD`, seed accounts OK) — [staging runbook](runbooks/staging-phase2.md). Healthchecks: `GET …/health`, `GET …/feed` (UUID), BFF `/api/feed`, `POST …/auth/login` → 401 if invalid, 200 with seed email if valid.

Last known state: **Agent** — code + Docker CI shipped (#66, #69); Dokploy instance still paused. **Indexer** — legacy placeholder without `apps/indexer`; do not reactivate (ADR 0004).

---

## Document maintenance

To realign this file with reality:

1. Use Dokploy All-Aboard MCP (`project-all`, then `application-one` / `postgres-one` per id).
2. Update domains, branches and statuses without copying secrets.

**Warning:** some Dokploy API responses (e.g. after `application-stop`) may contain sensitive fields (full `env`, GitHub metadata). Do not paste these JSON blobs in repo or public tickets.
