# Deployment matrix — Dokploy / Coolify

**Canonical documentation** (MVP timeline, TanStack, auth): [README.md](../README.md).

## Purpose

Standardize All-Aboard per-service deployment in Dokploy or Coolify with a single convention for:

- target Dockerfile,
- build context,
- runtime port,
- environment variables,
- healthcheck and deployment strategy.

## Global convention

- **1 deployable service = 1 Dockerfile = 1 Dokploy/Coolify resource**
- Prefer CI build then image deploy (recommended for prod).
- Resource naming: `allaboard-<service>-<env>` (e.g. `allaboard-api-staging`).
- Separate environments: `dev`, `staging`, `prod`.

## Reference Dokploy instance (All-Aboard)

**Canonical source of facts** (domains, branches, internal `API_URL`, Agent/Indexer status): **[dokploy-instance.md](dokploy-instance.md)**. Do not duplicate per-environment URL tables here.

**Feed flow reminder:** SSR uses **internal** `API_URL`; home client uses Next **BFF** `GET /api/feed` (no `NEXT_PUBLIC_API_URL` or browser CORS → Fastify for this flow). Detail: [web-api-integration.md](../guides/web-api-integration.md).

Items still to harmonize **on the instance** (not in this matrix): Agent/Indexer branches vs Web/API in prod — see instance sheet.

## Service → deployment matrix

| Service | App folder | Dockerfile | Port | Base Directory (Dokploy/Coolify) | Build Context | Service type |
|---|---|---|---:|---|---|---|
| Web | `apps/web` | `infra/docker/Dockerfile.web` | 3000 | `/` | repo root | Public HTTP |
| API | `apps/api` | `infra/docker/Dockerfile.api` | 4000 | `/` | repo root | Public HTTP (`api*.allaboard.fr`) + internal SSR calls (`API_URL`) |
| Agent | `apps/agent` | `infra/docker/Dockerfile.agent` | 4100 | `/` | repo root | Internal worker/API |
| Indexer | `apps/indexer` | `infra/docker/Dockerfile.indexer` | 4200 (optional) | `/` | repo root | Worker (often not exposed) |
| Storybook (UI catalogue) | `apps/storybook` | `infra/docker/Dockerfile.storybook` | 8080 | `/` | repo root | Internal or public HTTP (DS doc, not prod web) |

## Environment variables per service

### Common variables (all Node services)

| Variable | Example | Web | API | Agent | Indexer | Required |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `NODE_ENV` | `production` | x | x | x | x | Yes |
| `LOG_LEVEL` | `info` | x | x | x | x | Yes |
| `PORT` | `3000` | x | x | x | x | Yes |
| `APP_ENV` | `staging` | x | x | x | x | Yes |
| `SENTRY_DSN` | `https://...` | x | x | x | x | Recommended |

### Data / cache variables

| Variable | Web | API | Agent | Indexer | Required |
|---|:---:|:---:|:---:|:---:|:---:|
| `DATABASE_URL` |  | x | x | x | Yes (except pure web) |
| `REDIS_URL` |  | x | x | x | Recommended |
| `STORAGE_BUCKET` |  | x | x |  | Recommended |
| `STORAGE_ENDPOINT` |  | x | x |  | Recommended |
| `STORAGE_ACCESS_KEY` |  | x | x |  | Yes if used |
| `STORAGE_SECRET_KEY` |  | x | x |  | Yes if used |

### Auth / security variables

These variables concern **Phase 2** (API auth); see [ADR 0001](../adr/0001-authentication-strategy.md) and [canonical README](../README.md).

| Variable | Web | API | Agent | Indexer | Required |
|---|:---:|:---:|:---:|:---:|:---:|
| `JWT_SECRET` |  | x | x |  | Yes (API with JWT auth — min. 32 characters) |
| `GOOGLE_CLIENT_ID` |  | x |  |  | Yes when Google OAuth active ([ADR 0006](../adr/0006-oauth-google-sso.md)) |
| `GOOGLE_CLIENT_SECRET` |  | x |  |  | Yes when OAuth active |
| `OAUTH_GOOGLE_CALLBACK_URL` |  | x |  |  | Yes when OAuth — BFF URI `/api/auth/google/callback` |
| `WEB_APP_URL` |  | x |  |  | Yes when OAuth — web origin (post-login redirect) |
| `MVP_LOGIN_PASSWORD` |  | x |  |  | Yes in dev/MVP (`POST /auth/login`; replace before broad prod) |
| `SESSION_SECRET` | x | x |  |  | Yes if session |
| `CORS_ALLOWED_ORIGINS` |  | x |  |  | Yes if **browser** calls API directly; **N/A** while flow goes through Next BFF (see integration guide) |
| `RATE_LIMIT_ENABLED` |  | x |  |  | Recommended |

### Blockchain / indexing variables

| Variable | Web | API | Agent | Indexer (legacy) | Required |
|---|:---:|:---:|:---:|:---:|:---:|
| `INTUITION_RPC_URL` |  | x |  |  | SDK publish (post-stub #67) |
| `INTUITION_API_KEY` |  | x |  |  | Per provider |
| `INTUITION_GRAPHQL_URL` |  | x |  |  | Graph read (spike #67) |
| `INTUITION_NETWORK_ID` |  | x |  |  | Testnet / mainnet |
| `INTUITION_PUBLISHER_ENABLED` |  | x |  |  | Default `true`; `false` to disable poll |
| `INTUITION_PUBLISHER_POLL_MS` |  | x |  |  | Default `5000` |
| `INDEXER_START_BLOCK` |  |  |  | x | **Legacy** — do not reactivate |
| `INDEXER_CONFIRMATIONS` |  |  |  | x | **Legacy** |

## Dokploy configuration (per service)

1. Create an **Application** resource (or Docker Compose if grouped multi-service needed).
2. Source: Git repository.
3. Build type: **Dockerfile**.
4. `Base Directory`: `/` (if Dockerfile references monorepo root).
5. Dockerfile path: `infra/docker/Dockerfile.<service>`.
6. Set env vars per service.
7. Configure domain + port + healthcheck.
8. Enable CPU/RAM limits and logs.

Prod note:
- Dokploy recommends preferring CI build+publish to avoid build load on the server.

## Coolify configuration (per service)

1. Create Application resource from Git.
2. Build pack: **Dockerfile**.
3. `Base Directory`: `/`.
4. Dockerfile: `infra/docker/Dockerfile.<service>`.
5. Set service runtime port.
6. Add env vars in dedicated tab.
7. Configure domain/publication per service nature.

Notes:
- Keep `SOURCE_COMMIT` disabled if maximizing Docker cache.
- Use pre/post deployment commands only for simple idempotent actions.

## Recommended healthchecks

| Service | Endpoint / Check | Interval | Timeout |
|---|---|---|---|
| Web | `GET /health` | 30s | 3s |
| API | `GET /health` | 15s | 3s |
| Agent | `GET /health` or queue check | 30s | 5s |
| Indexer | current block check (custom) | 60s | 5s |

## Recommended CI/CD strategy

1. CI validates monorepo:
   - `turbo run lint typecheck test build`
2. CI builds images:
   - `web`, `api`, `agent`, `indexer`
3. CI publishes images (registry).
4. Dokploy/Coolify deploys per service from image/tag.
5. Per-service rollback possible via previous tag.

## Image tag mapping

| Service | Image name | Recommended tag |
|---|---|---|
| Web | `ghcr.io/all-aboard/web` | `sha-<commit>` + `staging`/`prod` |
| API | `ghcr.io/all-aboard/api` | `sha-<commit>` + `staging`/`prod` |
| Agent | `ghcr.io/all-aboard/agent` | `sha-<commit>` + `staging`/`prod` |
| Indexer | `ghcr.io/all-aboard/indexer` | `sha-<commit>` + `staging`/`prod` |

## Pre-deployment readiness checklist

- Service Dockerfile builds locally.
- Environment variables complete and segmented per environment.
- Healthcheck endpoint available.
- JSON logs enabled.
- Service not publicly exposed if unnecessary (agent/indexer).
- Rollback strategy validated.
