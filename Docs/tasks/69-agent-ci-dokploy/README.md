# Tâche #69 — CI Agent + Dokploy (retrait Indexer legacy)

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/69

## Objectif

Valider le build Docker de `apps/agent` en CI (image + smoke `GET /health`) et documenter la réactivation Agent sur Dokploy ainsi que le retrait du placeholder **Indexer** All-Aboard (legacy — ne pas réactiver).

## Livrables

| Livrable | Emplacement |
|----------|-------------|
| Job CI `agent` (paths-filter + Docker build + smoke) | [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| Procédure réactivation Agent / statut Indexer legacy | [`deploiement-dokploy-instance-allaboard.md`](../../deploiement-dokploy-instance-allaboard.md) |
| Image Docker | [`infra/docker/Dockerfile.agent`](../../../infra/docker/Dockerfile.agent) |

## CI — job `agent`

Déclenché si le diff touche :

- `apps/agent/**`
- `packages/types/**` (dépendance workspace)
- `infra/docker/Dockerfile.agent`
- lockfile / workspace / `turbo.json` / workflow CI

Étapes :

1. `docker build -f infra/docker/Dockerfile.agent`
2. Conteneur éphémère port **4100** → `GET /health` doit renvoyer `{ "status": "ok" }`

Le job `verify` existant couvre déjà lint / typecheck / test / build Turbo de `apps/agent` via `--filter=!thp-final`.

## Dokploy — Agent (réactivation manuelle)

**Prérequis** : merge #66 + job CI `agent` vert sur la branche cible.

**Production** : garder `enabled: false` jusqu’à validation humaine explicite (critère issue #69).

Pour **dev** ou **staging** (après revue ops) :

1. Vérifier CI `agent` vert sur la branche alignée (ex. `Dev` / `staging`).
2. Dokploy → application **Agent** → `enabled: true`.
3. Aligner la **branche Git** sur Web/API (pas `Dev` partout en prod).
4. Variables minimales : `PORT=4100`, `NODE_ENV=production`, `APP_ENV`, `LOG_LEVEL` — voir [matrice](../../matrice-deploiement-dokploy-coolify.md).
5. **Pas d’exposition publique** Traefik — service réseau interne uniquement ; l’API consomme via `AGENT_URL` (issue #68).
6. Déploiement **manuel** (`autoDeploy: false` recommandé tant que l’intégration API n’est pas validée).
7. Smoke : depuis un conteneur du même réseau Docker, `GET http://<service-agent>:4100/health`.

## Dokploy — Indexer placeholder (legacy)

| Élément | Statut |
|---------|--------|
| `infra/docker/Dockerfile.indexer` | Legacy bootstrap — **pas de `apps/indexer`** |
| Service Dokploy « Indexer » | **Ne pas réactiver** — supprimer ou laisser `enabled: false` |
| Indexation graphe | Indexer **réseau Intuition** (hors monorepo) — voir [ADR 0004](../../adr/0004-agent-indexer-architecture.md) |

## Critères de clôture #69

- [x] Job CI `agent` avec build image + smoke `/health`
- [x] Doc instance Dokploy — procédure Agent + avertissement Indexer legacy
- [ ] Réactivation Agent en prod (hors scope merge — validation humaine)

## Liens

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [Epic #37](../37-agent-indexer/README.md)
- [`apps/agent` README](../../../apps/agent/README.md)
