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

- **web**: Next.js — `http://localhost:3000` (Phase 1 : feed SSR via `API_URL` + socle TanStack ; client : `useQuery` + invalidation sur le **BFF** `http://localhost:3000/api/feed` — voir [Docs/README.md](Docs/README.md))
- **api**: Fastify — `http://localhost:4000/health`, `GET /feed`
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

Lire en premier la **[documentation canonique (timeline MVP)](Docs/README.md)**, puis le **[plan opérationnel Web/API/données](Docs/plan-mise-en-place-web-api-donnees.md)** (variables SSR vs client, contrat `/feed`, **Phase 1 = SSR + socle TanStack**, usage client Phase 3, Dokploy).

Ensuite :

- [To-do — priorités et promotion env](Docs/To-do.md)
- [MOC - Parcours utilisateur](Docs/moc-parcours-utilisateur.md)
- [MOC - Dataflow et architecture](Docs/dataflow-architecture.md)
- [Plan d'initialisation Turborepo MVP](Docs/plan-initialisation-turborepo-mvp.md)
- [Proposition stack technique monorepo 2026 (vision v1+)](Docs/proposition-stack-technique-monorepo-2026.md)
- [Matrice de deploiement Dokploy/Coolify](Docs/matrice-deploiement-dokploy-coolify.md)
- [Deploiement Dokploy — instance All-Aboard (domaines Web/API, `API_URL`, Postgres)](Docs/deploiement-dokploy-instance-allaboard.md)
