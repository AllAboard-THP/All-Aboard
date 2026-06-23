# Technical stack proposal — Turborepo monorepo (2026)

## Document status

This file describes a **target vision** (v1 and beyond): GraphQL, Prisma, cross-cutting packages (`auth`, `api-client`, etc.). It **does not describe** current repo state (`apps/api` is **Fastify REST** without Prisma or GraphQL at MVP).

- **Implementation order and real MVP:** [canonical documentation README](../README.md) (Phases 0–4 + TanStack). **Vision index:** [vision/README.md](../vision/README.md).
- **Product journeys:** [product/user-journeys.md](../product/user-journeys.md).

## Context

From existing documentation (`user journeys` + `dataflow architecture`), All-Aboard targets:

- a React Native mobile app,
- a React web app,
- a Node/GraphQL backend + AI agent,
- media storage,
- a Postgres/Supabase database,
- an indexer and blockchain integrations (Intuition).

Goal: propose a modern, maintainable, scalable stack with a product-oriented Turborepo monorepo for fast delivery.

## Recommended stack choices (2026)

### Runtime and language

- **Node.js 22 LTS (Maintenance LTS, EOL 2027)** for server stability and tooling.
- **Strict TypeScript** everywhere (apps, packages, scripts, infra).
- **pnpm workspaces** for monorepo dependency management.

### Monorepo orchestration

- **Turborepo** for:
  - local/remote task cache,
  - build/test/lint pipelines,
  - CI parallelisation.
- Key rule: internal dependencies as `workspace:*` and packages well split by responsibility.

### Deployment strategy (Dokploy / Coolify)

- **Per-service** deploy via **Dockerfile** (no auto buildpack for critical prod).
- One deployable service = one dedicated Dockerfile:
  - `web`,
  - `api`,
  - `agent`,
  - `indexer` (if exposed/deployed separately).
- Dokploy and Coolify support this mode via:
  - Git source,
  - Dockerfile build,
  - env vars per service,
  - domains/ports and logs per service.
- Architecture consequence: independent apps, buildable in isolation from monorepo.

### Frontend

- **Web:** Next.js (React) + App Router.
- **Client data (MVP):** introduce **`@tanstack/react-query`** when client API calls multiply (invalidation, cache) — **Phase 3** in [README.md](../README.md); **no** mandatory TanStack Router while Next handles routing.
- **Mobile:** Expo (React Native).
- **Shared UI:**
  - `react-native` + `react-native-web` for cross-platform components,
  - `tamagui` or `nativewind` (per design system preference),
  - dedicated design tokens package.

### Backend and data

- **API BFF:** Node.js + GraphQL (Yoga or Apollo Server) + targeted REST endpoints if needed.
- **Database:** Postgres via Supabase.
- **ORM:** Prisma for type-safe model and versioned migrations.
- **Cache:** Redis (Upstash or managed Redis) for feed, sessions, rate limits, dedup.
- **Media storage:** S3-compatible (R2/Supabase Storage per cost and latency).

### AI agent and async pipeline

- **Separate agent service** (Node/Workers per load) in dedicated app.
- **Queue:** BullMQ (Redis) or managed service (QStash/Cloud Tasks) for robust jobs.
- **Internal eventing:** outbox pattern + retries for indexer/blockchain publish.

### Indexer and blockchain

- **Indexer** isolated in `apps/indexer` (cron workers + consumers).
- Blockchain abstraction layer in `packages/blockchain` to avoid direct chain calls from UI.
- Versioned, tested contract/API clients (fixtures + replay).

### Quality, security, observability

- **Lint/format:** ESLint + Prettier + strict TypeScript.
- **Tests:**
  - unit: Vitest,
  - API integration: Vitest + Testcontainers,
  - web e2e: Playwright,
  - critical mobile e2e: Detox (or Maestro for smoke).
- **Observability:** OpenTelemetry + Sentry + structured logs (pino).
- **Security:** secret manager, CSP, rate limiting, schema validation (zod), SAST/Dependabot.

## Recommended monorepo architecture (full)

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
    api/                          # BFF GraphQL + target REST
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
    agent/                        # AI / orchestration service
      src/
        core/
        providers/
        prompts/
        tools/
        safety/
        workflows/
      tests/
      package.json
    indexer/                      # Blockchain/data layer indexing
      src/
        adapters/
        consumers/
        index-pipelines/
        schedulers/
      tests/
      package.json
    workers/                      # jobs/cron/event handlers (optional)
      src/
      package.json

  packages/
    ui/                           # Shared web/mobile components
      src/
      package.json
    design-tokens/                # tokens, themes, primitives
      src/
      package.json
    config-eslint/                # shared ESLint config
      index.js
      package.json
    config-typescript/            # base tsconfig + refs
      base.json
      node.json
      react.json
      package.json
    config-jest-vitest/           # shared test presets
      src/
      package.json
    types/                        # cross-cutting business types
      src/
      package.json
    validation/                   # zod schemas and validators
      src/
      package.json
    api-client/                   # internal SDK for apps
      src/
      package.json
    db/                           # prisma client, repositories, seeds
      src/
      prisma/
      package.json
    cache/                        # redis access + cache strategies
      src/
      package.json
    storage/                      # media storage abstraction
      src/
      package.json
    blockchain/                   # sdk/contracts/index adapters
      src/
      package.json
    analytics/                    # product event tracking
      src/
      package.json
    feature-flags/                # env/provider flag wrappers
      src/
      package.json
    observability/                # logger/tracing metrics wrappers
      src/
      package.json
    auth/                         # shared auth logic (JWT, sessions)
      src/
      package.json

  infra/
    docker/
      Dockerfile.api
      Dockerfile.web
      Dockerfile.agent
      Dockerfile.indexer
      .dockerignore
    terraform/                    # or pulumi/
      envs/
        dev/
        staging/
        prod/
      modules/
    k8s/                          # if kubernetes orchestration
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

## Structuring best practices (2026++)

- **Separate deployable vs reusable:** `apps/*` deployable, `packages/*` libraries.
- **Install deps where used** (not at root except repo tools).
- **Explicit exports** in each package (`exports` field), no massive global barrels.
- **TypeScript project references** (`composite: true`) for incremental builds.
- **Boundary rules** (eslint): UI must not depend on `db`, only backend calls `db`.
- **API contracts first:** zod schemas + shared types + contract tests.
- **Turborepo remote cache in CI** to speed pipeline.
- **Systematic ADR** for each major technical decision.
- **Docker images built in CI** then deploy on Dokploy/Coolify (avoid prod server build overload).

## Impact on monorepo bootstrap

Dokploy/Coolify + Dockerfile per service choice slightly changes bootstrap:

1. Plan Dockerfiles from the start in `infra/docker/`.
2. Define per-app build scripts (e.g. `build:web`, `build:api`).
3. Keep predictable build artefacts (for Turbo cache + reproducible images).
4. Avoid strong service coupling to allow independent deploy.
5. Centralise common logic in `packages/*` without making a service depend on unnecessary runtime.

## Proposed `turbo.json` (base)

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

## Environments and governance

- **Environments:** `dev`, `staging`, `prod` strictly separated.
- **Branching:** trunk-based + feature flags to reduce long branches.
- **Minimal CI gate:** lint + typecheck + unit tests + API integration tests.
- **Release:** Changesets for internal/exposed package versioning.

## Rollout plan (recommended order)

**Long-term** order (aligned with this proposal). For **MVP in repo** (Fastify, phases 0–3, TanStack Query at right time), follow [README.md](../README.md).

1. Initialise monorepo (`pnpm`, `turbo`, base `apps` + `packages`).
2. Set cross-cutting standards (TypeScript refs, ESLint, test tooling).
3. Stand up `apps/api` + `packages/db` + initial migrations.
4. Stand up `apps/web` and `apps/mobile` with `packages/ui`.
5. Integrate `apps/agent`, `apps/indexer`, then observability and full CI.

## References used (web)

- [All-Aboard canonical documentation — MVP timeline](../README.md)
- [Turborepo Workspaces Guide](https://turbo.build/docs/guides/workspaces)
- [Turborepo - Managing Dependencies](https://turbo.build/docs/crafting-your-repository/managing-dependencies)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Node.js Release Schedule](https://nodejs.org/about/releases)
- [Vercel Turborepo React Native Template](https://www.vercel.com/templates/monorepos/turborepo-react-native)
- [Dokploy - Core Features](https://docs.dokploy.com/docs/core/features)
- [Dokploy - Going Production](https://docs.dokploy.com/docs/core/applications/going-production)
- [Coolify - Dockerfile Build Pack](https://coolify.io/docs/builds/packs/dockerfile)
- [Coolify - Build Packs Introduction](https://coolify.io/docs/builds/introduction)
