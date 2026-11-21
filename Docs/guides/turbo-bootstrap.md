# Turborepo bootstrap — All-Aboard MVP

**Status:** monorepo bootstrap is **complete** in this repository (pnpm, Turborepo, `apps/web`, `apps/api`, `packages/types`, shared configs, CI, Dockerfiles). MVP phase timeline and repository state: [README.md](../README.md). Web/API coupling, TanStack, and the smoke journal: [web-api-integration.md](web-api-integration.md).

**Archive** (historical step-by-step plan — do not treat unchecked `[ ]` items as current truth): [archive/plan-initialisation-turborepo-mvp-2026-01.md](../archive/plan-initialisation-turborepo-mvp-2026-01.md).

## Current layout

- Apps: `apps/web` (Next App Router), `apps/api` (Fastify); packages `packages/types`, shared ESLint/TypeScript configs.
- Infra: `infra/docker/Dockerfile.web`, `Dockerfile.api`, `Dockerfile.agent`, `Dockerfile.indexer`; monorepo root build context.
- Deployment: [environment-variables.md](../deployment/environment-variables.md), instance facts [dokploy-instance.md](../deployment/dokploy-instance.md).
- Contributor protocol: [AGENTS.md](../../AGENTS.md) (`pnpm verify` before PR).

## Links

- [README — canonical documentation](../README.md)
- [Documentation index](../INDEX.md)
- [Web / API / data integration guide](web-api-integration.md)
- [Deployment environment matrix](../deployment/environment-variables.md)
