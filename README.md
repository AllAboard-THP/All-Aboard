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

1. [Docs/README.md](Docs/README.md) — phases MVP, principes, état code  
2. [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3) — backlog, kanban, roadmap  
3. [Docs/tasks/README.md](Docs/tasks/README.md) — doc par issue (`Docs/tasks/<NN>-slug/`)  
4. [plan opérationnel Web/API](Docs/plan-mise-en-place-web-api-donnees.md) — contrat `/feed`, journal smoke  
5. [map of content](Docs/map-of-content.md) — sources canoniques  

Références : [parcours MOC](Docs/moc-parcours-utilisateur.md) · [Dokploy instance](Docs/deploiement-dokploy-instance-allaboard.md) · [vision](Docs/vision/README.md) · [.github/PROJECT.md](.github/PROJECT.md)
