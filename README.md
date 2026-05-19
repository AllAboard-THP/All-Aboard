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

- **web**: Next.js — `http://localhost:3000` (feed SSR via `API_URL` + kit UX Tailwind / shadcn — voir [Docs/README.md](Docs/README.md))
- **api**: Fastify — `http://localhost:4000/health`, `GET /feed`

> **Note** : l’application Rails historique (`apps/thp-final`) a été retirée du monorepo le **2026-05-19** — voir [Docs/adr-001-abandon-thp-final.md](Docs/adr-001-abandon-thp-final.md).

### Docker (depuis la racine du repo, Docker requis)

```bash
docker build -f infra/docker/Dockerfile.web -t allaboard-web:local .
docker build -f infra/docker/Dockerfile.api -t allaboard-api:local .
```

Les Dockerfiles Node utilisent `turbo prune` (monorepo) puis `turbo run build --filter=…`. Voir [infra/docker/](infra/docker/).

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

Les workflows sous [.github/workflows/](.github/workflows/) s’exécutent sur les PR et les pushes : `pnpm install`, puis `lint`, `typecheck`, `test`, `build`, **build-storybook** (`apps/web`), et **Playwright** E2E.

## Documentation

Lire en premier la **[documentation canonique (timeline MVP)](Docs/README.md)** et la **[map of content](Docs/map-of-content.md)** (rôles et sources pour éviter les doublons), puis le **[plan opérationnel Web/API/données](Docs/plan-mise-en-place-web-api-donnees.md)** (variables, contrat `/feed`, chemins code, journal smoke).

Ensuite :

- [To-do — priorités et promotion env](Docs/To-do.md)
- [Vision long terme — index](Docs/vision/README.md)
- [MOC - Parcours utilisateur](Docs/moc-parcours-utilisateur.md)
- [MOC - Dataflow et architecture](Docs/dataflow-architecture.md)
- [Plan d'intégration kit UX](Docs/plan-integration-kit-ux-allaboard.md)
- [Plan d'initialisation Turborepo MVP (stub + archive)](Docs/plan-initialisation-turborepo-mvp.md)
- [Proposition stack technique monorepo 2026 (vision v1+)](Docs/proposition-stack-technique-monorepo-2026.md)
- [Matrice de deploiement Dokploy/Coolify](Docs/matrice-deploiement-dokploy-coolify.md)
- [Deploiement Dokploy — instance All-Aboard (domaines Web/API, `API_URL`, Postgres)](Docs/deploiement-dokploy-instance-allaboard.md)
