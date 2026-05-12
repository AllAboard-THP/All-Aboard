# Proposition stack technique - Monorepo Turborepo (2026)

## Statut du document

Ce fichier décrit une **vision cible** (v1 et au-delà) : GraphQL, Prisma, packages transverses (`auth`, `api-client`, etc.). Il **ne décrit pas** l’état actuel du dépôt (`apps/api` en **Fastify REST** sans Prisma ni GraphQL au MVP).

- **Ordre d’implémentation et MVP réel** : [README documentation canonique](README.md) (Phases 0 à 4 + TanStack Query en Phase 3).
- **Parcours produit** : [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md).

## Contexte

A partir de la documentation existante (`parcours utilisateur` + `dataflow architecture`), All-Aboard cible:

- une app mobile React Native,
- une app web React,
- un backend Node/GraphQL + agent IA,
- un stockage media,
- une base Postgres/Supabase,
- un indexeur et des integrations blockchain (Intuition).

Objectif: proposer une stack moderne, maintenable, scalable, avec un monorepo Turborepo orienté produit et livraison rapide.

## Choix de stack recommandes (2026)

### Runtime et langage

- **Node.js 22 LTS (Maintenance LTS, EOL 2027)** pour la stabilite serveur et tooling.
- **TypeScript strict** partout (apps, packages, scripts, infra).
- **pnpm workspaces** pour la gestion des dependances monorepo.

### Orchestration monorepo

- **Turborepo** pour:
  - cache local/remote des taches,
  - pipelines de build/test/lint,
  - parallelisation CI.
- Regle cle: dependencies internes en `workspace:*` et packages bien decoupes par responsabilite.

### Strategie de deploiement (Dokploy / Coolify)

- Deploiement **par service** via **Dockerfile** (pas de buildpack auto pour la prod critique).
- Un service deployable = un Dockerfile dedie:
  - `web`,
  - `api`,
  - `agent`,
  - `indexer` (si expose/deploye separement).
- Dokploy et Coolify supportent ce mode via:
  - source Git,
  - build Dockerfile,
  - variables d'environnement par service,
  - domaines/ports et logs par service.
- Consequence architecture: il faut des apps independantes, buildables de maniere isolee depuis le monorepo.

### Frontend

- **Web**: Next.js (React) + App Router.
- **Données côté client (MVP)** : introduire **`@tanstack/react-query`** lorsque les appels client à l’API se multiplient (invalidation, cache) — **Phase 3** dans [README.md](README.md) ; **pas** de TanStack Router obligatoire tant que Next gère le routage.
- **Mobile**: Expo (React Native).
- **UI partagee**:
  - `react-native` + `react-native-web` pour composants cross-platform,
  - `tamagui` ou `nativewind` (selon preference design system),
  - package dedie design tokens.

### Backend et data

- **API BFF**: Node.js + GraphQL (Yoga ou Apollo Server) + endpoints REST ciblés si necessaire.
- **Base de donnees**: Postgres via Supabase.
- **ORM**: Prisma pour modele type-safe et migrations versionnees.
- **Cache**: Redis (Upstash ou Redis managé) pour feed, sessions, rate limits, dedup.
- **Stockage media**: S3-compatible (R2/Supabase Storage selon cout et latence).

### Agent IA et pipeline asynchrone

- **Service agent** separe (Node/Workers selon charge) dans une app dediee.
- **Queue**: BullMQ (Redis) ou service managé (QStash/Cloud Tasks) pour jobs robustes.
- **Eventing interne**: pattern outbox + retries pour publication indexeur/blockchain.

### Indexeur et blockchain

- **Indexer** isole dans `apps/indexer` (workers cron + consumers).
- Couche d'abstraction blockchain dans `packages/blockchain` pour eviter les appels chain directs depuis l'UI.
- Contract/API clients versionnes et testes (fixtures + replay).

### Qualite, securite, observabilite

- **Lint/format**: ESLint + Prettier + TypeScript strict.
- **Tests**:
  - unitaires: Vitest,
  - integration API: Vitest + Testcontainers,
  - e2e web: Playwright,
  - e2e mobile critique: Detox (ou Maestro pour smoke).
- **Observabilite**: OpenTelemetry + Sentry + logs structures (pino).
- **Securite**: secret manager, CSP, rate limiting, schema validation (zod), SAST/Dependabot.

## Architecture monorepo recommandee (complete)

```text
all-aboard/
  apps/
    web/                          # Next.js (React)
      app/
      components/
      features/
      lib/
      public/
      tests-e2e/
      next.config.ts
      package.json
    mobile/                       # Expo / React Native
      app/
      components/
      features/
      lib/
      assets/
      package.json
    api/                          # BFF GraphQL + REST cible
      src/
        modules/
          auth/
          users/
          help-requests/
          feed/
          mentors/
          responses/
          notifications/
        graphql/
        rest/
        jobs/
        middleware/
        config/
      prisma/
        schema.prisma
        migrations/
      tests/
      package.json
    agent/                        # Service IA / orchestration
      src/
        core/
        providers/
        prompts/
        tools/
        safety/
        workflows/
      tests/
      package.json
    indexer/                      # Indexation blockchain/data layer
      src/
        adapters/
        consumers/
        index-pipelines/
        schedulers/
      tests/
      package.json
    workers/                      # jobs/cron/event handlers (optionnel)
      src/
      package.json

  packages/
    ui/                           # Composants partages web/mobile
      src/
      package.json
    design-tokens/                # tokens, themes, primitives
      src/
      package.json
    config-eslint/                # config ESLint partagee
      index.js
      package.json
    config-typescript/            # tsconfig de base + refs
      base.json
      node.json
      react.json
      package.json
    config-jest-vitest/           # presets de test partages
      src/
      package.json
    types/                        # types metier transverses
      src/
      package.json
    validation/                   # schemas zod et validateurs
      src/
      package.json
    api-client/                   # SDK interne pour apps
      src/
      package.json
    db/                           # client prisma, repositories, seeds
      src/
      prisma/
      package.json
    cache/                        # acces redis + strategies cache
      src/
      package.json
    storage/                      # abstraction media storage
      src/
      package.json
    blockchain/                   # sdk/contracts/index adapters
      src/
      package.json
    analytics/                    # tracking events produit
      src/
      package.json
    feature-flags/                # wrappers flags env/provider
      src/
      package.json
    observability/                # logger/tracing metrics wrappers
      src/
      package.json
    auth/                         # auth shared logic (JWT, sessions)
      src/
      package.json

  infra/
    docker/
      Dockerfile.api
      Dockerfile.web
      Dockerfile.agent
      Dockerfile.indexer
      .dockerignore
    terraform/                    # ou pulumi/
      envs/
        dev/
        staging/
        prod/
      modules/
    k8s/                          # si orchestration kubernetes
    scripts/
      bootstrap.sh
      migrate.sh
      seed.sh

  tooling/
    generators/                   # scaffolds (plop/hygen/turbo gen)
    codemods/
    ci/
      github/
        workflows/

  docs/
    architecture/
    adr/                          # Architecture Decision Records
    runbooks/
    product/

  .changeset/
  .github/
    workflows/
  .husky/
  package.json                    # root scripts + repo tooling only
  pnpm-workspace.yaml
  turbo.json
  tsconfig.json                   # project references root
  biome.json or .eslintrc.cjs
  .prettierrc
  .npmrc
  .env.example
```

## Bonnes pratiques de structuration (2026++)

- **Separer deployable vs reusable**: `apps/*` deployables, `packages/*` bibliotheques.
- **Installer les deps la ou elles sont utilisees** (pas au root sauf outils repo).
- **Exports explicites** dans chaque package (`exports` field), pas de barrels globaux massifs.
- **TypeScript project references** (`composite: true`) pour builds incrementaux.
- **Boundary rules** (eslint): UI ne depend pas de `db`, backend seul appelle `db`.
- **API contracts d'abord**: schemas zod + types partages + tests de contrat.
- **Remote cache Turborepo en CI** pour accelerer pipeline.
- **ADR systematique** pour chaque decision technique majeure.
- **Images Docker construites en CI** puis deploiement sur Dokploy/Coolify (eviter la surcharge build sur serveur de prod).

## Impacts sur l'initialisation du monorepo

Le choix Dokploy/Coolify + Dockerfile par service change legerement l'initialisation:

1. Prevoir les Dockerfiles des le debut dans `infra/docker/`.
2. Definir des scripts de build cibles par app (ex: `build:web`, `build:api`).
3. Garder des artefacts de build predictibles (pour cache Turbo + images reproductibles).
4. Eviter les couplages forts entre services pour permettre un deploiement independant.
5. Centraliser la logique commune dans `packages/*` sans rendre un service dependant d'un runtime non necessaire.

## Proposition de `turbo.json` (base)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Environnements et governance

- **Environnements**: `dev`, `staging`, `prod` strictement separes.
- **Branching**: trunk-based + feature flags pour reduire les branches longues.
- **CI gate minimal**: lint + typecheck + tests unitaires + tests integration API.
- **Release**: Changesets pour versioning des packages internes/exposes.

## Plan de mise en place (ordre conseille)

Ordre **long terme** (aligné sur cette proposition). Pour le **MVP dans le dépôt** (Fastify, phases 0–3, TanStack Query au bon moment), suivre [README.md](README.md).

1. Initialiser monorepo (`pnpm`, `turbo`, `apps` + `packages` de base).
2. Poser standards transverses (TypeScript refs, ESLint, test tooling).
3. Monter `apps/api` + `packages/db` + migrations initiales.
4. Monter `apps/web` et `apps/mobile` avec `packages/ui`.
5. Integrer `apps/agent`, `apps/indexer`, puis observabilite et CI complete.

## References utilisees (web)

- [Documentation canonique All-Aboard — timeline MVP](README.md)
- [Turborepo Workspaces Guide](https://turbo.build/docs/guides/workspaces)
- [Turborepo - Managing Dependencies](https://turbo.build/docs/crafting-your-repository/managing-dependencies)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Node.js Release Schedule](https://nodejs.org/about/releases)
- [Vercel Turborepo React Native Template](https://www.vercel.com/templates/monorepos/turborepo-react-native)
- [Dokploy - Core Features](https://docs.dokploy.com/docs/core/features)
- [Dokploy - Going Production](https://docs.dokploy.com/docs/core/applications/going-production)
- [Coolify - Dockerfile Build Pack](https://coolify.io/docs/builds/packs/dockerfile)
- [Coolify - Build Packs Introduction](https://coolify.io/docs/builds/introduction)
