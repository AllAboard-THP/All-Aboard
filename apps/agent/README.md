# `apps/agent` — Rubberduck (Phase 4)

Service HTTP **interne** pour l’orchestration IA Rubberduck. Non exposé au navigateur : l’API Fastify (`apps/api`) et le BFF Next (`apps/web`) appellent ce service sur le réseau privé.

## Contrat MVP (scaffold #66)

| Route | Description |
|-------|-------------|
| `GET /health` | Healthcheck Dokploy / CI (`{ "status": "ok" }`) |
| `POST /rubberduck/evaluate` | Éligibilité stub (titre ≤ 6 mots, aligné heuristique API Phase 2) |
| `POST /rubberduck/respond` | Réponse stub (message fixe + `sessionId` placeholder) |

Types partagés : `@allaboard/types` (`RubberduckEvaluate*`, `RubberduckRespond*`).

## Développement local

```bash
# Depuis la racine du monorepo
pnpm --filter agent dev
```

Port par défaut : **4100** (`PORT`, `HOST`).

## Build & tests

```bash
pnpm --filter agent build
pnpm --filter agent test
```

Image Docker : [`infra/docker/Dockerfile.agent`](../../infra/docker/Dockerfile.agent) (`turbo prune agent` + `pnpm exec turbo run build`).

## Suite backlog

- [#68](https://github.com/AllAboard-THP/All-Aboard/issues/68) — `apps/api` remplace `wordCount <= 6` par appel HTTP vers cet agent
- [#69](https://github.com/AllAboard-THP/All-Aboard/issues/69) — CI + réactivation Dokploy

Doc epic : [Docs/tasks/37-agent-indexer/README.md](../../Docs/tasks/37-agent-indexer/README.md) · ADR [0004](../../Docs/adr/0004-agent-indexer-architecture.md).
