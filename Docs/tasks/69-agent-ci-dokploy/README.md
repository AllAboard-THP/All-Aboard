# Task #69 — Agent CI + Dokploy (legacy Indexer removal)

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/69

## Goal

Validate `apps/agent` Docker build in CI (image + `GET /health` smoke) and document Agent reactivation on Dokploy plus removal of All-Aboard **Indexer** placeholder (legacy — do not reactivate).

## Deliverables

| Deliverable | Location |
|-------------|----------|
| CI job `agent` (paths-filter + Docker build + smoke) | [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Agent reactivation procedure / legacy Indexer status | [`deployment/dokploy-instance.md`](../../deployment/dokploy-instance.md) |
| Docker image | [`infra/docker/Dockerfile.agent`](../../../infra/docker/Dockerfile.agent) |

## CI — `agent` job

Triggered when diff touches:

- `apps/agent/**`
- `packages/types/**` (workspace dependency)
- `infra/docker/Dockerfile.agent`
- lockfile / workspace / `turbo.json` / CI workflow

Steps:

1. `docker build -f infra/docker/Dockerfile.agent`
2. Ephemeral container port **4100** → `GET /health` must return `{ "status": "ok" }`

Existing `verify` job already covers lint / typecheck / test / Turbo build of `apps/agent` via `--filter=!thp-final`.

## Dokploy — Agent (manual reactivation)

**Prerequisite:** merge #66 + green CI `agent` job on target branch.

**Production:** keep `enabled: false` until explicit human validation (#69 criterion).

For **dev** or **staging** (after ops review):

1. Verify green CI `agent` on aligned branch (e.g. `Dev` / `staging`).
2. Dokploy → **Agent** application → `enabled: true`.
3. Align **Git branch** with Web/API (not `Dev` everywhere in prod).
4. Minimum vars: `PORT=4100`, `NODE_ENV=production`, `APP_ENV`, `LOG_LEVEL` — see [matrix](../../deployment/environment-variables.md).
5. **No public** Traefik exposure — internal network only; API consumes via `AGENT_URL` (issue #68).
6. **Manual** deploy (`autoDeploy: false` recommended until API integration validated).
7. Smoke: from same Docker network container, `GET http://<agent-service>:4100/health`.

## Dokploy — Indexer placeholder (legacy)

| Element | Status |
|---------|--------|
| `infra/docker/Dockerfile.indexer` | Legacy bootstrap — **no `apps/indexer`** |
| Dokploy "Indexer" service | **Do not reactivate** — delete or keep `enabled: false` |
| Graph indexing | **Intuition network** indexer (outside monorepo) — see [ADR 0004](../../adr/0004-agent-indexer-architecture.md) |

## Closure criteria #69

- [x] CI `agent` job with image build + `/health` smoke
- [x] Dokploy instance doc — Agent procedure + Indexer legacy warning
- [ ] Agent reactivation in prod (out of merge scope — human validation)

## Links

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [Epic #37](../37-agent-indexer/README.md)
- [`apps/agent` README](../../../apps/agent/README.md)
