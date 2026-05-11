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
pnpm verify       # lint + typecheck + test + build (avant commit / PR)
```

- **web**: Next.js — `http://localhost:3000` (feed SSR appelle l’API via `API_URL`, défaut `http://127.0.0.1:4000`)
- **api**: Fastify — `http://localhost:4000/health`, `GET /feed`

### Docker (depuis la racine du repo, Docker requis)

```bash
docker build -f infra/docker/Dockerfile.web -t allaboard-web:local .
docker build -f infra/docker/Dockerfile.api -t allaboard-api:local .
```

Les Dockerfiles utilisent `turbo prune` (monorepo) puis `turbo run build --filter=…`. Voir aussi [infra/docker/](infra/docker/).

### Hooks Git (mode optimisé)

Les scripts sont versionnés dans `githooks/`. Après un clone, activer une fois :

```bash
pnpm setup:hooks
```

Comportement :

- **pre-commit** : `pnpm verify:commit` → `lint` puis `typecheck`
- **pre-push** : `pnpm verify:push` → `test` puis `build`

Éviter `--no-verify` sauf accord explicite. Protocole commun pour les agents IA : [AGENTS.md](AGENTS.md).

### CI (GitHub Actions)

Les workflows sous [.github/workflows/](.github/workflows/) s’exécutent sur les PR et les pushes vers `main` : `lint`, `typecheck`, `test`, `build`.
## Documentation

- [MOC - Parcours utilisateur](Docs/moc-parcours-utilisateur.md)
- [MOC - Dataflow et architecture](Docs/dataflow-architecture.md)
- [Proposition stack technique monorepo 2026](Docs/proposition-stack-technique-monorepo-2026.md)
- [Plan d'initialisation Turborepo MVP](Docs/plan-initialisation-turborepo-mvp.md)
- [Matrice de deploiement Dokploy/Coolify](Docs/matrice-deploiement-dokploy-coolify.md)
