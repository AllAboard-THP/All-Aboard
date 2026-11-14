# `apps/agent` — Agent All-Aboard (Phase 4)

Service HTTP **interne** : l’**agent All-Aboard** évalue les demandes et décide du parcours (dont : « renvoyer l’utilisateur vers Rubberduck ? »). Orchestration IA future (prompts, garde-fous) — **hors** processus API et **non exposé** au navigateur.

**Rubberduck** est un **service externe** (autre équipe, hors monorepo). Quand l’agent suggère une redirection, le web/API orientent l’utilisateur vers Rubberduck ; All-Aboard n’implémente pas les réponses Rubberduck.

## Contrat MVP (scaffold #66)

| Route | Description |
|-------|-------------|
| `GET /health` | Healthcheck Dokploy / CI (`{ "status": "ok" }`) |
| `POST /routing/evaluate` | Stub de routage : `{ suggestRubberduckRedirect, reason? }` (titre ≤ 6 mots, aligné heuristique API Phase 2) |
| `POST /tags/suggest` | Suggestion de tags (heuristique ; LLM si `ANTHROPIC_API_KEY`) |
| `POST /summary/generate` | Résumé « Problème / Solution » (stub ; LLM futur) |
| `POST /moderation/evaluate` | Second avis Claude après hit regex/denylist API — `{ flagged }` (stub conservateur sans clé) |

Types partagés : `@allaboard/types` (`AgentRoutingEvaluate*`, `AgentModerationEvaluate*`, etc.).

**Modération** : l’API n’appelle cet endpoint que si regex/denylist a déjà matché. Sans `ANTHROPIC_API_KEY`, réponse `flagged: true` (aligné Rails quand Claude ne répond pas).

Pas de route « respond » : répondre à l’utilisateur sur Rubberduck relève du **produit externe**.

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

- [#68](https://github.com/AllAboard-THP/All-Aboard/issues/68) — `apps/api` appelle `POST /routing/evaluate` et mappe `suggestRubberduckRedirect` → `hints.rubberduckEligible`
- [#69](https://github.com/AllAboard-THP/All-Aboard/issues/69) — CI + réactivation Dokploy — livré ([doc](../../Docs/tasks/69-agent-ci-dokploy/README.md))

Doc epic : [Docs/tasks/37-agent-indexer/README.md](../../Docs/tasks/37-agent-indexer/README.md) · ADR [0004](../../Docs/adr/0004-agent-indexer-architecture.md).
