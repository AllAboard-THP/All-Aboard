# Web, API & data integration (SSR, env, TanStack Query)

**Canonical reference** for `apps/web` ↔ `apps/api` coupling: environment variables, `GET /feed` contract, code paths, smoke journal, Dokploy feed checklist. Phase **timeline:** [README.md](../README.md). Documentation **index:** [INDEX.md](../INDEX.md). **Instance facts** (domains, internal `API_URL`): [deployment/dokploy-instance.md](../deployment/dokploy-instance.md).

**Last updated:** 2026-06-10. **Decision:** **Option B** — TanStack foundation shipped with SSR feed; client home feed + invalidation delivered (see *Journal*). **Phase 2 (repo MVP):** Postgres + real `GET /feed`, `POST /help-requests`, JWT + BFF auth, MOC stubs (duplicate, Rubberduck) — [ADR 0001](../adr/0001-authentication-strategy.md). **Bob journey (dev):** shipped on `Dev` + Dokploy dev (PR #50–#52); housekeeping validated 2026-05-25 — [staging promotion checklist](../deployment/staging-promotion-checklist.md). **Rails API parity (phases 1–7):** progressive `apps/thp-final` → Fastify alignment — hub [api-rails-parity](../tasks/api-rails-parity/README.md), [§ Rails parity](#rails-parity-thp-final--api); current OpenAPI **0.10.0**.

---

## Before opening a PR

1. TanStack foundation: `providers.tsx` + `layout` when touching SSR feed.
2. Consistent local `API_URL`; no secrets; keep [.env.example](../.env.example) updated for new variables.
3. API reachable on the expected port for SSR.
4. Client fetch: **BFF** `GET /api/feed` (implemented) avoids CORS and `NEXT_PUBLIC_API_URL` for this flow.
5. `GET /feed` contract: types + tests updated in the same change.

---

## Documentation deliverables (Phase 1–3 home — completed 2026-05-12)

SSR feed, Query foundation, Dokploy dev merge, `useQuery` + `invalidateQueries` on `['feed']`, BFF `/api/feed`, tests and deployment matrix/README — see *Journal* for smoke runs.

### Journal (smoke / deployment)

| Date | Environment | Note |
|------|-------------|------|
| 2026-05-12 | CI / local | `pnpm turbo run lint typecheck test build --filter=web --filter=api --filter=@allaboard/types` OK on branch `feat/phase1-web-api-feed`. |
| 2026-05-12 | Dokploy **dev** (post-merge PR #9) | Web + API deployed; HTTP: `https://dev.allaboard.fr`, `https://api-dev.allaboard.fr/feed`, `https://dev.allaboard.fr/api/feed`. |
| 2026-05-12 | Doc / code | Phase 3: `invalidateQueries` + tests; docs aligned. |
| 2026-05-12 | Dokploy **dev** (post-merge PR #10) | Browser smoke: SSR + client `useQuery` + **Refresh** OK. LocatorJS log = browser extension, not app. |
| 2026-05-14 | CI / local | Phase 2 MVP: Drizzle + Postgres (`DATABASE_URL`), API startup migrations, JWT (`JWT_SECRET`, `MVP_LOGIN_PASSWORD`), BFF `/api/auth/login` + `/api/help-requests`, page `/help/new`; CI: Postgres service + `pnpm --filter api run db:migrate` before tests; `docker-compose.yml` for local Postgres. |
| 2026-05-19 | CI / local | Phase 2 additions: extended API/BFF tests, HTTP contracts documented below, `pnpm smoke:dev` ([scripts/smoke-dev.sh](../scripts/smoke-dev.sh)). Dokploy dev HTTPS smoke: see [deployment/runbooks/dev-phase2.md](../deployment/runbooks/dev-phase2.md). |
| 2026-05-20 | Dokploy **dev** (Phase 2) | API vars (`DATABASE_URL`, `JWT_SECRET`, `MVP_LOGIN_PASSWORD`, `PORT`, `NODE_ENV`); API redeploy; `pnpm smoke:dev` OK; `/help/new` + SSR feed (`https://dev.allaboard.fr`) OK. ADR [0001](../adr/0001-authentication-strategy.md) accepted ([#18](https://github.com/AllAboard-THP/All-Aboard/issues/18)). |
| 2026-05-21 | Dokploy **dev** (Sprint 0) | Local rebase on `origin/Dev`; `pnpm smoke:dev` replayed OK (`/health`, `/feed`, BFF `/api/feed`); closed ops [#33](https://github.com/AllAboard-THP/All-Aboard/issues/33), [#34](https://github.com/AllAboard-THP/All-Aboard/issues/34), backend epic [#16](https://github.com/AllAboard-THP/All-Aboard/issues/16). |
| 2026-05-21 | CI / local | MOC journey: `GET /help-requests/:id`, `GET /mentor/feed`, `GET /auth/me`; pages `/requests/[id]`, `/mentor`; TanStack create mutation + detail query; smoke `GET /help-requests/:id`; Playwright e2e foundation; [ADR 0003](../adr/0003-authentication-users-production.md) proposed; [staging checklist](../deployment/staging-promotion-checklist.md). |
| 2026-05-24 | CI / local | Full Playwright e2e (#35): feed + create → detail scenarios; CI job `e2e` (paths-filter `apps/web`); `pnpm test:e2e` script. Closed frontend epic [#15](https://github.com/AllAboard-THP/All-Aboard/issues/15). |
| 2026-05-25 | Dokploy **dev** + CI | MVP dev housekeeping: `pnpm smoke:dev` OK (health, feed, BFF `/api/feed`); auth smoke + `GET /help-requests/:id` when `MVP_LOGIN_PASSWORD` aligned in Dokploy ([runbook](../deployment/runbooks/dev-phase2.md)); local `pnpm verify:commit` OK; Bob journey validated (code PR #51, e2e CI PR #52); [staging checklist](../deployment/staging-promotion-checklist.md) dev section checked. |
| 2026-05-25 | Dokploy **staging** (ops #32) | Staging env confirmed (MCP); API Phase 2 vars set; code promotion PR [#54](https://github.com/AllAboard-THP/All-Aboard/pull/54) `Dev`→`staging`; post-merge HTTPS staging smoke — [staging runbook](../deployment/runbooks/staging-phase2.md). |
| 2026-05-27 | Dokploy **staging** (close #32 / #17) | PR #54 merged; API deploy OK; manual Web redeploy (auto build failed 2026-05-26); `pnpm smoke:dev` OK (health, feed UUID, BFF `/api/feed`, auth + create + `GET /help-requests/:id`); Bob browser journey OK (`/`, `/help/new`, 409, `/mentor` alice) — [runbook](../deployment/runbooks/staging-phase2.md), [checklist](../deployment/staging-promotion-checklist.md). |
| 2026-05-28 | **ADR 0003** code | `users` table, login `{ email, password }` (argon2 hash), seed `bob@dev.local` / `alice@dev.local` via `DEV_SEED_PASSWORD`; `MVP_LOGIN_PASSWORD` dev/CI only; smoke `SMOKE_LOGIN_EMAIL` + `SMOKE_LOGIN_PASSWORD`. Staging ops: remove `MVP_LOGIN_PASSWORD` after Dokploy seed. |
| 2026-05-29 | Dokploy **staging** (ADR 0003 ops) | PR #63 + #74 merged; `MVP_LOGIN_PASSWORD` removed; users seeded at boot; full HTTPS smoke (`bob@dev.local`, create, detail); `/help/new` browser journey OK; Swagger crash fix (`openapi.yaml` in Docker image). |
| 2026-06-04 | **Rails API parity P1–P2** code | Migrations `0005` / `0006`; enriched `GET /feed` (filters, pagination, widgets); `GET /subjects`; PATCH request + help-mentor; likes/bookmarks + `/me/*` + responses CRUD; OpenAPI ≥ 0.3.0; docs [phase1](../tasks/api-rails-parity-phase1/README.md), [phase2](../tasks/api-rails-parity-phase2/README.md), [MOC](../product/user-journeys.md). `pnpm smoke:dev` unchanged (minimal `items` contract). |
| 2026-06-04 | **Full Rails API parity** doc | Hub [api-rails-parity](../tasks/api-rails-parity/README.md); phases 3–6 + lots A / 5b / 7 documented; index [tasks/README](../tasks/README.md), [MOC](../product/user-journeys.md), [INDEX](../INDEX.md). |
| 2026-06-04 | **Rails parity lots A / 5b / 7** code (PR #104) | Migration `0011` soft delete; `DELETE /help-requests/:id`; `POST /mentor/resources/:id/reject`; WS `GET /conversations/:id/ws`; `POST /help-requests/suggest-tags`; outbox + `ai_summary` worker; OpenAPI **0.10.0**. |

---

## Principles (reminder)

1. Stable `/feed` contract: `packages/types`, defensive parsing on web.
2. **SSR** via internal `API_URL` for initial feed data.
3. **TanStack**: client refresh / invalidation; initial feed stays SSR.
4. Do not mix URL contexts (table below).

---

## Environment variables

| Variable | Where | Role |
|----------|-------|------|
| `API_URL` | Next server only | **Internal** base URL to Dokploy API (e.g. `http://<api-service-name>:4000`). No `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_API_URL` | Client | HTTPS origin when the **browser** calls the API directly. **Not used** for current feed (BFF same-origin). |
| `DATABASE_URL` | API | Postgres connection (Drizzle). Without it: `GET /feed` → 503, no persistence. |
| `JWT_SECRET` | API | JWT signing (min. 32 chars in prod). See [ADR 0001](../adr/0001-authentication-strategy.md). |
| `DEV_SEED_PASSWORD` | API | Password for seed accounts `bob@dev.local` / `alice@dev.local` ([ADR 0003](../adr/0003-authentication-users-production.md)). Used by `db:migrate` / `db:seed`. |
| `MVP_LOGIN_PASSWORD` | API | **Dev/CI only**: seed alias + login fallback without DB. **Forbidden** on staging/prod (`APP_ENV`). |
| `MVP_MENTOR_USER_IDS` | API | MVP fallback only (mentor role when no DB). Obsolete when `users` is seeded. |
| `CORS_ALLOWED_ORIGINS` | API Fastify | Comma-separated origins: when set, `@fastify/cors` is registered (`credentials: true`). **N/A** while the browser does not call the API directly (BFF). |
| `OPENAPI_DOCS` | API | Explicit override for Swagger UI (`true` / `false`). Default: docs enabled when `APP_ENV` ≠ `production`. Spec: [`apps/api/openapi.yaml`](../apps/api/openapi.yaml), UI: `GET /docs`. |

Instance reference: [deployment/dokploy-instance.md](../deployment/dokploy-instance.md). Per-service tables: [deployment/environment-variables.md](../deployment/environment-variables.md).

---

## API contracts (`apps/api`)

Type source of truth: [packages/types/src/index.ts](../packages/types/src/index.ts). OpenAPI 3.1 spec: [apps/api/openapi.yaml](../apps/api/openapi.yaml) (Swagger UI `GET /docs` in dev/staging — [issue #49](https://github.com/AllAboard-THP/All-Aboard/issues/49)). Implementation: [apps/api/src/app.ts](../apps/api/src/app.ts). Auth: [ADR 0001](../adr/0001-authentication-strategy.md).

### Common error codes (JSON body)

| `error` | Typical HTTP | Meaning |
|---------|--------------|---------|
| `invalid_body` | 400 | Invalid JSON body or outside Zod schema |
| `unauthorized` | 401 | JWT missing or invalid (`POST /help-requests`) |
| `invalid_credentials` | 401 | Incorrect login password |
| `duplicate` | 409 | Title already exists (`existingId` present) |
| `not_found` | 404 | Request not found (`GET /help-requests/:id`) |
| `database_unavailable` | 503 | `DATABASE_URL` missing or DB unreachable |
| `login_not_configured` | 503 | Login unavailable (no DB + no dev fallback) |
| `insert_failed` | 500 | Insert failed (rare) |

### `GET /health`

- **200**: `{ "status": "ok" }` — Dokploy healthcheck / smoke.

### `GET /feed`

- **Query** (all optional): `subject` (subject slug), `tag`, `q` (ILIKE title/body), `page`, `limit` (max 100), `include=widgets` → `widgets.unanswered` (`open` requests with no response).
- **200**: `FeedResponse` — `{ "items": HelpRequest[], "pagination": { page, limit, total }, "widgets"?: { "unanswered": HelpRequest[] } }`.
- **HelpRequest** (base + optional Phase 1 fields): `id`, `title`, `authorId`, `createdAt`; `tags?`; `body?`, `codeSnippet?`, `codeLanguage?`, `urgent?`, `status?`, `mentorHelpRequested?`, `subjectId?`, `subject?`, `educationLevel?`, `likesCount?`, `responsesCount?`, `bookmarksCount?`, `updatedAt?`.
- **503**: `{ "error": "database_unavailable" }`
- Public (no JWT).

Minimal example (smoke retrocompat):

```json
{ "items": [{ "id": "uuid", "title": "…", "authorId": "bob@dev.local", "createdAt": "2026-05-19T12:00:00.000Z", "tags": ["rails"] }], "pagination": { "page": 1, "limit": 20, "total": 1 } }
```

Detailed doc: [tasks/api-rails-parity-phase1/README.md](../tasks/api-rails-parity-phase1/README.md).

### `POST /auth/login`

- **Body:** `{ "email": string, "password": string }` (see [ADR 0003](../adr/0003-authentication-users-production.md)). Legacy dev alias: `{ "userId": "bob"|"alice", "password" }` when MVP fallback is active.
- **200**: `{ "ok": true, "userId": string, "role": "student" | "mentor" }` + httpOnly cookie `access_token` (JWT `sub` = email, `role` from `users`).
- **400**: `{ "error": "invalid_body" }`
- **401**: `{ "error": "invalid_credentials" }`
- **503**: `{ "error": "login_not_configured" }`

### `GET /auth/me`

- **Auth:** `Authorization: Bearer <jwt>`.
- **200**: `{ "userId": string, "role": "student" | "mentor" }`.
- **401**: `{ "error": "unauthorized" }`.

### `GET /help-requests/:id`

- **200**: `HelpRequestDetailResponse` — `{ "item": HelpRequest, "responses": Response[] }` (chronological order).
- **404**: `{ "error": "not_found" }`
- **503**: `{ "error": "database_unavailable" }`
- Public (no JWT).

### `POST /help-requests/:id/responses`

- **Auth:** `Authorization: Bearer <jwt>`.
- **Body:** `CreateResponseBody` — `{ "body": string }` (1–10,000 characters).
- **201**: `CreateResponseResponse` — `{ "item": Response }`.
- **400** / **401** / **404** / **503**: see table above.

### `GET /mentor/feed`

- **200**: `{ "items": HelpRequest[] }` — requests with **at least one tag** or `mentorHelpRequested=true` (compat #82 / Phase 1).
- **503**: `{ "error": "database_unavailable" }`
- Mentor JWT (UI guard on Web via `/api/auth/me`).

### `GET /subjects` · `GET /subjects/:slug`

- **200**: catalogue or subject detail (`Subject`, `postsCount`) — public. See [phase1](../tasks/api-rails-parity-phase1/README.md).

### `PATCH /help-requests/:id` · `POST /help-requests/:id/help-mentor`

- **PATCH** (author JWT): `UpdateHelpRequestBody` — partial fields + `status` (`open` | `resolved`).
- **POST help-mentor** (JWT): **200** — `mentorHelpRequested=true`.
- **403** / **404**: invalid author or missing resource.

### `POST /help-requests/:id/likes` · `POST /help-requests/:id/bookmarks`

- **Auth:** JWT.
- **200**: toggle — `ToggleLikeResponse` / `ToggleBookmarkResponse` (`liked`/`bookmarked`, counters).
- See [phase2](../tasks/api-rails-parity-phase2/README.md).

### `GET /me/help-requests` · `GET /me/bookmarks`

- **Auth:** JWT (`sub` = user email).
- **200**: `{ "items": HelpRequest[] }`.

### `PATCH` / `DELETE /help-requests/:id/responses/:responseId`

- **Auth:** JWT response author.
- **PATCH**: `UpdateResponseBody`; **DELETE**: **204** + decrement `responses_count`.

### `POST /help-requests`

- **Auth:** `Authorization: Bearer <jwt>` header (BFF reads `access_token` cookie on Next and forwards Bearer).
- **Body:** `CreateHelpRequestBody` — `{ "title": string, "tags"?: string[], "body"?, "codeSnippet"?, "codeLanguage"?, "subjectId"?, "urgent"?, "educationLevel"? }` (`title` 1–500 chars; only `title` required — retrocompat).
- **201**: `CreateHelpRequestResponse` — `{ "item": HelpRequest, "hints"?: { "rubberduckEligible": true } }`  
  - `hints.rubberduckEligible`: MOC stub when title has **≤ 6 words**; absent otherwise.
- **400** / **401** / **503**: see table above.
- **409**: `{ "error": "duplicate", "existingId": string }` (whitespace / case normalization on title).

---

## BFF Next (`apps/web` — same-origin)

The browser calls **Web**; Route Handlers proxy to `API_URL` (server-side).

| BFF route | Upstream API | Notes |
|-----------|--------------|--------|
| `GET /api/feed` | `GET /feed` | **502** when upstream or JSON is invalid |
| `GET /api/help-requests/:id` | `GET /help-requests/:id` | **404** propagates; **502** when upstream is invalid |
| `GET /api/mentor/feed` | `GET /mentor/feed` | **502** when upstream or JSON is invalid |
| `GET /api/auth/me` | `GET /auth/me` | **401** `{ "error": "missing_token" }` when cookie is missing |
| `POST /api/auth/login` | `POST /auth/login` | Forwards upstream `Set-Cookie` |
| `POST /api/help-requests` | `POST /help-requests` | **401** `{ "error": "missing_token" }` when cookie is missing; forward Bearer |
| `POST /api/help-requests/:id/responses` | `POST /help-requests/:id/responses` | **401** `{ "error": "missing_token" }` when cookie is missing; forward Bearer |

**Outside BFF (Phase 1–2 API, direct consumption or to relay):** `GET /subjects`, `PATCH /help-requests/:id`, `POST …/help-mentor`, `POST …/likes|bookmarks`, `GET /me/*`, `PATCH|DELETE …/responses/:responseId`. Add Route Handlers under `apps/web/app/api/*` when building matching web screens.

---

## Rails parity (thp-final) — API (phases 1–7) {#rails-parity-thp-final--api}

Progressive alignment with reference app `apps/thp-final` (HTML/Turbo, **not** Events). **Hub:** [tasks/api-rails-parity/README.md](../tasks/api-rails-parity/README.md). API/agent/types scope — BFF web to add per screen.

### Main phases

| Phase | OpenAPI | Focus | Task doc |
|-------|---------|--------|----------|
| 1 | ≥ 0.3.0 | Enriched feed, subjects, request CRUD, help-mentor | [phase1](../tasks/api-rails-parity-phase1/README.md) |
| 2 | ≥ 0.4.0 | Likes, bookmarks, `/me/*`, responses CRUD | [phase2](../tasks/api-rails-parity-phase2/README.md) |
| 3 | ≥ 0.5.0 | Auth register, profiles, legal | [phase3](../tasks/api-rails-parity-phase3/README.md) |
| 4 | ≥ 0.6.0 | Resources, subject requests, mentor dashboard | [phase4](../tasks/api-rails-parity-phase4/README.md) |
| 5 | ≥ 0.7.0 | REST messaging | [phase5](../tasks/api-rails-parity-phase5/README.md) |
| 6 | ≥ 0.8.0 | Admin, moderation, denylist | [phase6](../tasks/api-rails-parity-phase6/README.md) |

### Supplementary lots (gaps)

| Lot | OpenAPI | Focus | Task doc |
|-----|---------|--------|----------|
| A | 0.8.1 | Soft delete post + reject mentor resource | [api-parity-delete-reject](../tasks/api-parity-delete-reject/README.md) |
| 5b | 0.9.0 | Real-time WebSocket chat | [phase5b](../tasks/api-rails-parity-phase5b/README.md) |
| 7 | 0.10.0 | Suggest-tags + `ai_summary` (agent + outbox) | [phase7](../tasks/api-rails-parity-phase7/README.md) |

**Parity migrations:** `apps/api/drizzle/0005` … `0011_api_soft_delete_help_requests.sql`.  
**Routes:** `apps/api/src/routes/{feed,subjects,help-requests,social,me,auth,users,legal,resources,subject-requests,mentor,conversations,conversations-ws,suggest-tags,admin}.ts`; agent `apps/agent/src/{tag-suggest,summary-generate}.ts`.  
**Env lots 5b/7:** `AGENT_URL`, `AI_SUMMARY_ENABLED` (API); `ANTHROPIC_API_KEY` optional (agent).  
**Product MOC:** [product/user-journeys.md](../product/user-journeys.md).

---

## Post-deploy smoke

Script: [scripts/smoke-dev.sh](../scripts/smoke-dev.sh) — root command `pnpm smoke:dev`.

Optional variables:

| Variable | Default | Role |
|----------|---------|------|
| `BASE_WEB` | `https://dev.allaboard.fr` | Next origin |
| `BASE_API` | `https://api-dev.allaboard.fr` | Fastify origin |
| `MVP_LOGIN_PASSWORD` | (empty) | When set: smoke `POST /auth/login` + `POST /help-requests` on API |

Examples:

```bash
# Dev HTTPS (Dokploy)
pnpm smoke:dev

# Local (API + Web running)
BASE_WEB=http://127.0.0.1:3000 BASE_API=http://127.0.0.1:4000 SMOKE_LOGIN_PASSWORD=dev-only-password pnpm smoke:dev
```

Manual Dokploy runbook: [deployment/runbooks/dev-phase2.md](../deployment/runbooks/dev-phase2.md).

---

## E2E Playwright (#35)

Config: [apps/web/playwright.config.ts](../apps/web/playwright.config.ts) — starts **API** (port 4000) then **Web** (port 3000) unless `PLAYWRIGHT_SKIP_WEBSERVER` is set.

Scenarios: [apps/web/e2e/](../apps/web/e2e/) — feed (shell navigation) + request creation (MVP login → detail → back to feed).

| Command | Context |
|---------|---------|
| `pnpm test:e2e` | Local: Postgres required (`DATABASE_URL`, see [scripts/e2e-playwright.sh](../scripts/e2e-playwright.sh)) |
| `pnpm --filter web run test:e2e` | Same, without migration wrapper |
| `PLAYWRIGHT_SKIP_WEBSERVER=1 pnpm --filter web run test:e2e` | Stack already running (`pnpm dev:local`) |

**CI:** job `e2e` in [.github/workflows/ci.yml](../.github/workflows/ci.yml) (paths-filter `apps/web`, Postgres service, `MVP_LOGIN_PASSWORD=ci-test-login-password`).

---

### Code paths

| Item | Location |
|------|----------|
| `FeedResponse` | `packages/types/src/index.ts` |
| `HelpRequestDetailResponse`, `AuthMeResponse`, `MentorFeedResponse` | `packages/types/src/index.ts` |
| `getApiBaseUrl`, `parseFeedResponse`, `fetchFeed`, `fetchHelpRequest`, `fetchMentorFeed`, `fetchAuthMe` | `apps/web/lib/api-server.ts` |
| Async feed page + `fetchFeed` | `apps/web/app/(app)/page.tsx` |
| SSR feed UI / error / empty | `apps/web/components/features/home-content.tsx` |
| Request detail page | `apps/web/app/(app)/requests/[id]/page.tsx`, `help-request-detail-content.tsx` |
| Mentor dashboard | `apps/web/app/(app)/mentor/page.tsx` |
| BFF `GET /api/feed` | `apps/web/app/api/feed/route.ts` |
| BFF `GET /api/help-requests/[id]`, `GET /api/mentor/feed`, `GET /api/auth/me` | `apps/web/app/api/help-requests/[id]/route.ts`, `mentor/feed/route.ts`, `auth/me/route.ts` |
| BFF `POST /api/auth/login`, `POST /api/help-requests` | `apps/web/app/api/auth/login/route.ts`, `apps/web/app/api/help-requests/route.ts` |
| SQL schema + Drizzle migrations | `apps/api/src/db/schema.ts`, `apps/api/drizzle/` (incl. `0005` / `0006` Rails parity) |
| Modular API routes (parity) | `apps/api/src/routes/feed.ts`, `subjects.ts`, `help-requests.ts`, `social.ts`, `me.ts` |
| API startup (migrations) | `apps/api/src/index.ts`, `apps/api/src/migrate.ts` |
| Help request form | `apps/web/app/(app)/help/new/page.tsx`, `help-request-form.tsx` |
| `QueryClientProvider` | `apps/web/app/providers.tsx`, `apps/web/app/layout.tsx` |
| `useQuery` feed + detail | `feed-client-preview.tsx` (`['feed']`), `help-request-detail-client.tsx` (`['help-request', id]`) |
| `useMutation` create | `help-request-form.tsx` — `invalidateQueries({ queryKey: ['feed'] })`, redirect `/requests/[id]` |
| Tests | `apps/web/tests/api-server.test.ts`, `bff-phase2.test.ts`, `home-content.test.tsx`; `apps/api/src/app.test.ts` |
| Smoke | `scripts/smoke-dev.sh` (`pnpm smoke:dev`) — includes `GET /help-requests/:id` when auth smoke runs |
| E2E Playwright | `apps/web/e2e/`, `playwright.config.ts`, `scripts/e2e-playwright.sh` (`pnpm test:e2e`) |

**Cache:** `fetchFeed` — `next: { revalidate: 60 }`; BFF `/api/feed` — `cache: 'no-store'`.

---

## Phase 3 client — conventions (repo state)

| Convention | Current choice |
|------------|----------------|
| `queryKey` feed | `['feed']` |
| `queryKey` request detail | `['help-request', id]` |
| Client fetch (home) | **BFF** `GET /api/feed` |
| Client fetch (detail) | **BFF** `GET /api/help-requests/:id` |
| Request creation | `useMutation` + `invalidateQueries({ queryKey: ['feed'] })` |
| Feed invalidation | `invalidateQueries({ queryKey: ['feed'] })` |
| Cross-origin auth | ADR required if `credentials: 'include'` to another origin |

---

## Dokploy checklist (feed / Web–API)

- [x] **Web**: `API_URL` to **internal** API service same environment, port 4000 — **validated** dev smoke (SSR + BFF).
- [x] **API `CORS_ALLOWED_ORIGINS`**: **N/A** for home flow + MVP form (client → BFF). API registers CORS **only** when the variable is set (future cross-origin client fetch) — see [deployment/environment-variables.md](../deployment/environment-variables.md).
- [ ] **After service recreate / rename:** revalidate `API_URL` on Web service (Dokploy internal service names).

---

## History (decision closed)

The former "Phase 1 SSR without TanStack" variant is no longer followed. Single path: **Option B** (SSR feed + Query foundation + client extension on home).

---

## Links

- [Canonical documentation README](../README.md)
- [Documentation index](../INDEX.md)
- [Deployment matrix and variables](../deployment/environment-variables.md)

---

## `.env.example` alignment

The file [.env.example](../.env.example) documents SSR vs client; keep it in sync with the *Environment variables* section above.
