# Task #49 — OpenAPI specification

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/49

## Goal

Document the Phase 2 API contract in a versioned way (OpenAPI 3.1), with Swagger UI in dev/staging, without exposing `/docs` on public production.

## Decision (spike)

### Options compared

| Option | Pros | Cons |
|--------|------|------|
| **`@fastify/swagger` + `@fastify/swagger-ui` (generated from routes)** | Spec auto from Fastify schemas; interactive `/docs` | Possible drift vs `packages/types`; JSON schema effort per route |
| **Hand-maintained OpenAPI spec (`apps/api/openapi.yaml`)** | Explicit control; easy Git diff review; aligned with integration guide | Duplication with `packages/types` (accepted for MVP) |
| **Generation from shared Zod/schemas** | Single source of truth | Heavy monorepo setup; Zod 4 + Fastify 5 not yet standardised in repo |

### Chosen recommendation — **static hybrid**

1. **Versioned source:** [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) — Phase 2 contract (`/health`, `/feed`, `/auth/*`, `/help-requests/*`, `/mentor/feed`), schemas aligned with [`packages/types/src/index.ts`](../../../packages/types/src/index.ts).
2. **Dev/staging UI:** [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) in **`static`** mode + [`@fastify/swagger-ui`](https://github.com/fastify/fastify-swagger-ui) on **`GET /docs`** — see [`apps/api/src/openapi.ts`](../../../apps/api/src/openapi.ts).
3. **No web codegen for now** — Next BFF remains browser consumption; client codegen **deferred**.
4. **CI / review:** endpoint change = **api + types + `openapi.yaml` + tests** in same PR (existing rule [Docs/README.md](../../README.md)).

### Open questions (issue #49) — resolved

| Question | MVP decision |
|----------|--------------|
| v1 scope | All Phase 2 endpoints listed above |
| `/docs` publication | **Dev + staging** (`APP_ENV` ≠ `production`); override `OPENAPI_DOCS=true\|false` |
| Public prod | `/docs` **disabled** without dedicated security ADR |
| Consumption | Developer doc + manual smoke; no codegen |

### Possible evolution (post-MVP)

- Extract shared Zod schemas (`packages/types` or `packages/api-schemas`) and generate YAML in CI.
- Switch `@fastify/swagger` to **dynamic** mode once route schemas align — with non-regression test against YAML.
- ADR if Swagger exposed in prod (auth, rate limit, write disable).

## Shipped implementation

| File | Role |
|------|------|
| [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) | OpenAPI 3.1 Phase 2 spec |
| [`apps/api/src/openapi.ts`](../../../apps/api/src/openapi.ts) | Conditional Swagger UI registration |
| [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) | Async `buildApp()` — docs before routes |
| [`apps/api/src/app.test.ts`](../../../apps/api/src/app.test.ts) | Tests spec `/feed` + prod `/docs` guard |

### Environment variables

| Variable | Service | Role |
|----------|---------|------|
| `APP_ENV` | API | If `production` → no `/docs` (default staging/dev: docs active) |
| `OPENAPI_DOCS` | API | Explicit override: `true` / `false` |

### Local verification

```bash
# Terminal 1 — API
cd apps/api && pnpm dev

# Browser
open http://localhost:4000/docs
```

```bash
pnpm --filter api test
```

## Closure criteria #49

- [x] Spike doc (this README)
- [x] Minimal versioned spec (`openapi.yaml`)
- [x] Swagger UI dev/staging (`/docs`)
- [x] Vitest tests (spec + prod guard)
- [x] `pnpm verify` green

**Close issue:** comment on #49 with link to this folder + merge PR; set Project status **Done**.

## Canonical docs (reading)

- [Operational plan — API contracts](../../guides/web-api-integration.md)
- [packages/types](../../../packages/types/src/index.ts)
- [ADR 0001 auth](../../adr/0001-authentication-strategy.md)
