# ARCHIVE — Turborepo bootstrap plan (All-Aboard MVP)

**Do not use the checkboxes below as project state:** monorepo bootstrap is **completed** in the repo. For current state and next work, see [README.md](../README.md) and stub [guides/turbo-bootstrap.md](../guides/turbo-bootstrap.md).

---

# Turborepo bootstrap plan — All-Aboard MVP

**Canonical documentation** (up-to-date timeline, phases 0–4, TanStack, auth): [README.md](../README.md). This plan keeps bootstrap history and checklists; **priority order** for future work is defined in the canonical README.

## Goal

Set up a minimal, clean, evolvable Turborepo monorepo to ship the first All-Aboard MVP quickly.

## MVP scope (week 1)

- `apps/web` for web front.
- `apps/api` for MVP backend.
- `packages/types` for shared types.
- `packages/config-typescript` and `packages/config-eslint` to standardise the repo.
- Turborepo pipeline: `dev`, `build`, `lint`, `typecheck`, `test`.
- Minimal CI with Turborepo cache.
- Per-service deploy via Dockerfile (Dokploy or Coolify).

## Minimal architecture

```text
all-aboard/
  apps/
    web/
    api/
    agent/
  packages/
    types/
    config-typescript/
    config-eslint/
  infra/
    docker/
      Dockerfile.web
      Dockerfile.api
      Dockerfile.agent
      .dockerignore
  docs/
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.json
```

## Execution plan

### Step A — Initialise workspace

1. Initialise `pnpm` at root.
2. Install `turbo` as dev dependency.
3. Define `pnpm-workspace.yaml` with:
   - `apps/*`
   - `packages/*`
4. Add root scripts:
   - `dev`
   - `build`
   - `lint`
   - `typecheck`
   - `test`

### Step B — Configure Turborepo

1. Create `turbo.json`.
2. Configure task dependencies:
   - `build` depends on `^build`
   - `typecheck` depends on `^typecheck`
   - `lint` depends on `^lint`
3. Configure `dev` mode:
   - `persistent: true`
   - `cache: false`
4. Define build outputs (`dist/**`, `.next/**`, etc.).

### Step C — TypeScript monorepo

1. Root `tsconfig.json` with project references.
2. Each TS package with `composite: true`.
3. Use `tsc -b` for incremental builds.

### Step D — Create MVP apps

1. `apps/web`
   - health page (`/health`)
   - first mock feed page
2. `apps/api`
   - health endpoint
   - mock feed endpoint
3. `packages/types`
   - initial business types (`User`, `HelpRequest`, `Response`)

### Step E — Minimal quality

1. Shared ESLint via `packages/config-eslint`.
2. Shared TS config via `packages/config-typescript`.
3. At least 1 smoke test per app.

### Step F — Dokploy/Coolify deploy prep

1. Create one Dockerfile per deployable service (`web`, `api`, `agent`).
2. Ensure each service can be built/deployed independently.
3. Add optimised monorepo `.dockerignore`.
4. Configure Dokploy/Coolify per service (base directory, port, env vars, healthcheck).
5. Apply deployment matrix as single reference:
   - [`Docs/deployment/environment-variables.md`](../deployment/environment-variables.md)

## Target scripts (root)

- `dev`: start all useful dev servers.
- `build`: compile apps + packages.
- `lint`: static quality check.
- `typecheck`: global TypeScript validation.
- `test`: unit/smoke tests.

## MVP CI

Recommended PR pipeline:

1. `pnpm install --frozen-lockfile`
2. `turbo run lint typecheck test build`
3. build and publish Docker images per service in CI
4. enable Turborepo remote cache

Note:
- For Dokploy, docs recommend favouring build+publish in CI to avoid build load on server.
- For Coolify, Dockerfile mode natively supports per-service deploy (with `Base Directory`, env vars, ports).

## Governance rules (from day 1)

- Internal dependencies as `workspace:*`.
- Clear responsibility per package.
- `apps/web` does not import `db`/infra code.
- Explicit exports in each package.
- Short ADR for each structural decision.
- One service = one image = one Dockerfile = one Dokploy/Coolify config.

## 30-day roadmap (MVP → v1)

Aligned with **canonical timeline** ([README.md](../README.md)):

- **D1–D3:** **Phase 0** — monorepo bootstrap + tooling + CI (see checklists below).
- **D4–D10:** **Phase 0–1** — web + api + types base; SSR/`API_URL` coupling to `/feed` **+ `@tanstack/react-query` foundation** (Option B — [integration guide](../guides/web-api-integration.md)) (Phase 1).
- **D11–D20:** **Phase 2** — auth + first "help request" journey (auth ADR; effective matrix variables).
- **D21–D30:** **Phase 2–3** + hardening — client Query usage (`useQuery` / invalidation) as needed; observability; staging + Dokploy/Coolify matrix.

**Vision** GraphQL/Prisma ([`vision/technical-stack-proposal-2026.md`](../vision/technical-stack-proposal-2026.md)) stays outside strict calendar until phases 1–3 stabilise.

## Progress tracking checklist

### MVP scope (week 1)

- [ ] `apps/web` for web front.
- [ ] `apps/api` for MVP backend.
- [ ] `packages/types` for shared types.
- [ ] `packages/config-typescript` and `packages/config-eslint` to standardise repo.
- [ ] Turborepo pipeline: `dev`, `build`, `lint`, `typecheck`, `test`.
- [ ] Minimal CI with Turborepo cache.
- [ ] Per-service deploy via Dockerfile (Dokploy or Coolify).

### Step A — Initialise workspace

- [ ] Initialise `pnpm` at root.
- [ ] Install `turbo` as dev dependency.
- [ ] Define `pnpm-workspace.yaml` with `apps/*` and `packages/*`.
- [ ] Add root scripts `dev`, `build`, `lint`, `typecheck`, `test`.

### Step B — Configure Turborepo

- [ ] Create `turbo.json`.
- [ ] Configure task dependencies (`build`, `typecheck`, `lint`).
- [ ] Configure `dev` with `persistent: true` and `cache: false`.
- [ ] Define build outputs (`dist/**`, `.next/**`, etc.).

### Step C — TypeScript monorepo

- [ ] Configure root `tsconfig.json` with project references.
- [ ] Set each TS package to `composite: true`.
- [ ] Use `tsc -b` for incremental builds.

### Step D — Create MVP apps

- [ ] Create `apps/web`.
- [ ] Add health page (`/health`) in `apps/web`.
- [ ] Add first mock feed page in `apps/web`.
- [ ] Create `apps/api`.
- [ ] Add health endpoint in `apps/api`.
- [ ] Add mock feed endpoint in `apps/api`.
- [ ] Create `packages/types`.
- [ ] Add initial business types (`User`, `HelpRequest`, `Response`).

### Step E — Minimal quality

- [ ] Set up shared ESLint via `packages/config-eslint`.
- [ ] Set up shared TS config via `packages/config-typescript`.
- [ ] Add at least 1 smoke test per app.

### Step F — Dokploy/Coolify deploy prep

- [ ] Create one Dockerfile per deployable service (`web`, `api`, `agent`).
- [ ] Verify each service can be built/deployed independently.
- [ ] Add optimised monorepo `.dockerignore`.
- [ ] Configure Dokploy/Coolify per service (base directory, port, env vars, healthcheck).
- [ ] Apply deployment matrix as single reference.

### Target scripts (root)

- [ ] `dev` script operational.
- [ ] `build` script operational.
- [ ] `lint` script operational.
- [ ] `typecheck` script operational.
- [ ] `test` script operational.

### MVP CI

- [ ] Run `pnpm install --frozen-lockfile` in PR pipeline.
- [ ] Run `turbo run lint typecheck test build` in PR pipeline.
- [ ] Build and publish Docker images per service in CI.
- [ ] Enable Turborepo remote cache.
- [ ] Apply Dokploy recommendation (build+publish in CI).
- [ ] Apply Coolify Dockerfile config (Base Directory, env vars, ports).

### Governance rules (from day 1)

- [ ] Use internal dependencies as `workspace:*`.
- [ ] Maintain clear responsibility per package.
- [ ] Ensure `apps/web` does not import `db`/infra code.
- [ ] Define explicit exports in each package.
- [ ] Create short ADR for each structural decision.
- [ ] Respect rule: one service = one image = one Dockerfile = one Dokploy/Coolify config.

### 30-day roadmap (MVP → v1)

- [ ] **D1–D3** (**Phase 0**): monorepo bootstrap + tooling + CI.
- [ ] **D4–D10** (**Phase 0–1**): functional web + api + types base; feed coupling via `API_URL`.
- [ ] **D11–D20** (**Phase 2**): auth + first "help request" journey.
- [ ] **D21–D30** (**Phase 2–3**): TanStack Query if client need; observability, hardening, staging + deployment matrix.

See [README.md](../README.md) for phase detail.

## References

- [README — canonical documentation (timeline)](../README.md)
- [Web / API / data operational plan (SSR, env, TanStack)](../guides/web-api-integration.md)
- [Dokploy/Coolify deployment matrix](../deployment/environment-variables.md)
- [Turborepo Docs - Workspaces](https://turbo.build/docs/guides/workspaces)
- [Turborepo Docs - Managing dependencies](https://turbo.build/docs/crafting-your-repository/managing-dependencies)
- [TypeScript - Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Node.js release schedule](https://nodejs.org/about/releases)
- [Dokploy - Core Features](https://docs.dokploy.com/docs/core/features)
- [Dokploy - Going Production](https://docs.dokploy.com/docs/core/applications/going-production)
- [Coolify - Dockerfile Build Pack](https://coolify.io/docs/builds/packs/dockerfile)
