# All-Aboard

## Monorepo (Turborepo + pnpm)

Prerequisites: **Node.js 22+**, **pnpm 9** (`corepack enable` or `npm i -g pnpm@9`).

```bash
pnpm install
pnpm dev          # web (3000) + api (4000)
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

- **web**: Next.js — `http://localhost:3000` (feed SSR appelle l’API via `API_URL`, défaut `http://127.0.0.1:4000`)
- **api**: Fastify — `http://localhost:4000/health`, `GET /feed`

### Docker (depuis la racine du repo, Docker requis)

```bash
docker build -f infra/docker/Dockerfile.web -t allaboard-web:local .
docker build -f infra/docker/Dockerfile.api -t allaboard-api:local .
```

Les Dockerfiles utilisent `turbo prune` (monorepo) puis `turbo run build --filter=…`. Voir aussi [infra/docker/](infra/docker/).

## Documentation

- [MOC - Parcours utilisateur](Docs/moc-parcours-utilisateur.md)
- [MOC - Dataflow et architecture](Docs/dataflow-architecture.md)
- [Proposition stack technique monorepo 2026](Docs/proposition-stack-technique-monorepo-2026.md)
- [Plan d'initialisation Turborepo MVP](Docs/plan-initialisation-turborepo-mvp.md)
- [Matrice de deploiement Dokploy/Coolify](Docs/matrice-deploiement-dokploy-coolify.md)
