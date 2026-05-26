# Plan d'initialisation Turborepo — MVP All-Aboard

**État** : le **bootstrap monorepo** est **complété** dans le dépôt (pnpm, Turborepo, `apps/web`, `apps/api`, `packages/types`, configs partagées, CI, Dockerfiles). La **timeline** des phases et l’état MVP sont dans [README.md](README.md). Le couplage Web/API, TanStack et le journal de smoke sont dans [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md).

**Archive** (ancien plan pas-à-pas, checklists historiques — ne pas suivre les `[ ]` comme vérité actuelle) : [archive/plan-initialisation-turborepo-mvp-2026-01.md](archive/plan-initialisation-turborepo-mvp-2026-01.md).

## Structure actuelle (référence)

- Apps : `apps/web` (Next App Router), `apps/api` (Fastify) ; packages `packages/types`, configs ESLint/TypeScript.
- Infra : `infra/docker/Dockerfile.web`, `Dockerfile.api`, `Dockerfile.agent`, `Dockerfile.indexer` ; build context racine monorepo.
- Déploiement : conventions [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md), faits instance [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md).
- Protocole contributeurs : [AGENTS.md](../AGENTS.md) (`pnpm verify` avant PR).

## Liens

- [README — documentation canonique (timeline)](README.md)
- [Map of content — rôles et sources](map-of-content.md)
- [Plan opérationnel Web / API / données](plan-mise-en-place-web-api-donnees.md)
- [Matrice déploiement](matrice-deploiement-dokploy-coolify.md)
