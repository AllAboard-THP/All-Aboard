# All-Aboard

## Monorepo (Turborepo + pnpm)

Prerequisites: **Node.js 22+**, **pnpm 9** (`corepack enable` or `npm i -g pnpm@9`). Pour l’app Rails historique : **Ruby** version indiquée dans [apps/thp-final/.ruby-version](apps/thp-final/.ruby-version) (Bundler).

```bash
pnpm install
cd apps/thp-final && bundle install && cd ../..
pnpm dev          # web (3000) + api (4000) — voir aussi thp-final ci-dessous
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm verify       # lint + typecheck + test + build (avant commit / PR)
```

- **web**: Next.js — `http://localhost:3000` (feed SSR via `API_URL` + TanStack ; BFF `/api/feed`, `/api/auth/login`, `/api/help-requests` ; formulaire `/help/new` — voir [Docs/README.md](Docs/README.md))
- **api**: Fastify — `http://localhost:4000/health`, `GET /feed` (Postgres si `DATABASE_URL`), `POST /auth/login`, `POST /help-requests` (JWT). Migrations au démarrage. Postgres local : `docker compose up -d` puis définir `DATABASE_URL` (voir [.env.example](.env.example)).
- **thp-final**: Rails 8 — application THP (`Hotwire`, esbuild/React). Dev/test en **SQLite** (`apps/thp-final/storage/`). Postgres en production uniquement (`config/database.yml`). Démarrage :

  ```bash
  # depuis la racine du monorepo (JS + gems déjà installés)
  pnpm --filter thp-final run dev
  # équivalent : cd apps/thp-final && bin/dev (web + esbuild watch + Solid Queue dev)
  ```

  Le lien symbolique `apps/thp-final/pnpm-lock.yaml` pointe vers le lockfile racine : là pour que **jsbundling-rails** choisisse bien `pnpm` (et pas `yarn`) même si Yarn est présent sur la machine.

  Intégration Git : [Projet-Final---All-aboard](https://github.com/AllAboard-THP/Projet-Final---All-aboard) sous forme de **subtree** dans `apps/thp-final`. Mettre à jour depuis le distant :

  ```bash
  git fetch projet-final main   # après avoir configuré ce remote SSH/HTTPS une fois
  git subtree pull --prefix=apps/thp-final projet-final main
  ```

### Docker (depuis la racine du repo, Docker requis)

```bash
docker build -f infra/docker/Dockerfile.web -t allaboard-web:local .
docker build -f infra/docker/Dockerfile.api -t allaboard-api:local .
# Postgres local pour l’API (Phase 2) :
docker compose up -d
# Rails THP (contexte = arborescence Rails, pas la racine monorepo) :
docker build -f apps/thp-final/Dockerfile -t allaboard-thp-final:local apps/thp-final
```

Les Dockerfiles Node utilisent `turbo prune` (monorepo) puis `turbo run build --filter=…`. L’image Rails suit le Dockerfile standard Rails 8 sous [apps/thp-final/Dockerfile](apps/thp-final/Dockerfile). Voir aussi [infra/docker/](infra/docker/).

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

Les workflows sous [.github/workflows/](.github/workflows/) s’exécutent sur les PR et les pushes : après `pnpm install`, Ruby/Bundler est configuré pour `apps/thp-final`, la base SQLite de test est préparée, puis `pnpm` exécute `lint`, `typecheck`, `test`, `build` sur tout le monorepo.
## Documentation

Lire en premier la **[documentation canonique (timeline MVP)](Docs/README.md)** et la **[map of content](Docs/map-of-content.md)** (rôles et sources pour éviter les doublons), puis le **[plan opérationnel Web/API/données](Docs/plan-mise-en-place-web-api-donnees.md)** (variables, contrat `/feed`, chemins code, journal smoke).

Ensuite :

- [To-do — priorités et promotion env](Docs/To-do.md)
- [Vision long terme — index](Docs/vision/README.md)
- [MOC - Parcours utilisateur](Docs/moc-parcours-utilisateur.md)
- [MOC - Dataflow et architecture](Docs/dataflow-architecture.md)
- [Plan d'initialisation Turborepo MVP (stub + archive)](Docs/plan-initialisation-turborepo-mvp.md)
- [Proposition stack technique monorepo 2026 (vision v1+)](Docs/proposition-stack-technique-monorepo-2026.md)
- [Matrice de deploiement Dokploy/Coolify](Docs/matrice-deploiement-dokploy-coolify.md)
- [Deploiement Dokploy — instance All-Aboard (domaines Web/API, `API_URL`, Postgres)](Docs/deploiement-dokploy-instance-allaboard.md)
- [Index des pages — documentation Intuition (officiel)](Docs/intuition-documentation-index.md)
