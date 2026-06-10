# Rails API parity — hub (phases 1–7 + lots A / 5b / 7)

**Product reference:** `apps/thp-final` mockup (Rails/Turbo, **read-only** — no code port).  
**HTTP contract:** [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) (current version **0.10.0**).  
**Operational plan:** [§ Rails parity](../../guides/web-api-integration.md#rails-parity-thp-final--api).  
**Scope:** `apps/api`, `apps/agent`, `packages/types`, Drizzle migrations — **not** `apps/web` (BFF/UI in parallel).

## Goal

Progressively align the Fastify MVP API with THP Rails mockup journeys and endpoints, in shippable versioned lots (OpenAPI + migrations + task doc).

---

## Main phases

| Phase | Focus | OpenAPI | Migration | Task doc | Status |
|-------|--------|---------|-----------|-----------|--------|
| **1** | Enriched feed, subjects, request CRUD, help-mentor | ≥ 0.3.0 | `0005_api_rails_phase1.sql` | [phase1](../api-rails-parity-phase1/README.md) | ✅ Dev |
| **2** | Likes, bookmarks, `/me/*`, responses CRUD | ≥ 0.4.0 | `0006_api_rails_phase2_social.sql` | [phase2](../api-rails-parity-phase2/README.md) | ✅ Dev |
| **3** | Auth register, profiles, legal, public profile | ≥ 0.5.0 | `0007_api_rails_phase3_users_auth.sql` | [phase3](../api-rails-parity-phase3/README.md) | ✅ Dev |
| **4** | Resources, subject requests, mentor dashboard | ≥ 0.6.0 | `0008_api_rails_phase4_resources.sql` | [phase4](../api-rails-parity-phase4/README.md) | ✅ Dev |
| **5** | REST messaging (conversations, messages) | ≥ 0.7.0 | `0009_api_rails_phase5_conversations.sql` | [phase5](../api-rails-parity-phase5/README.md) | ✅ Dev |
| **6** | Admin, moderation, denylist, roles | ≥ 0.8.0 | `0010_api_rails_phase6_admin.sql` | [phase6](../api-rails-parity-phase6/README.md) | ✅ Dev |

---

## Supplementary lots (parity gaps)

| Lot | Focus | OpenAPI | Migration / deps | Task doc | Status |
|-----|--------|---------|------------------|-----------|--------|
| **A** | Soft delete post + reject mentor resource | 0.8.1 | `0011_api_soft_delete_help_requests.sql` | [api-parity-delete-reject](../api-parity-delete-reject/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |
| **5b** | Real-time WebSocket chat | 0.9.0 | `@fastify/websocket` | [phase5b](../api-rails-parity-phase5b/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |
| **7** | Suggest-tags + `ai_summary` on resolution | 0.10.0 | outbox + `apps/agent` | [phase7](../api-rails-parity-phase7/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |

---

## Route map (modules)

| Module | File |
|--------|------|
| Feed, subjects | `apps/api/src/routes/{feed,subjects}.ts` |
| Requests, responses, suggest-tags | `apps/api/src/routes/{help-requests,suggest-tags}.ts` |
| Social, personal lists | `apps/api/src/routes/{social,me}.ts` |
| Auth, profiles, legal | `apps/api/src/routes/{auth,users,legal}.ts` |
| Resources, mentor | `apps/api/src/routes/{resources,subject-requests,mentor}.ts` |
| REST chat + WS | `apps/api/src/routes/{conversations,conversations-ws}.ts` |
| Admin | `apps/api/src/routes/admin.ts` |
| Agent (tags, summary) | `apps/agent/src/{tag-suggest,summary-generate}.ts`; proxy `apps/api/src/agent/` |

---

## Common verification

```bash
pnpm --filter @allaboard/types build
pnpm --filter agent test
pnpm --filter api test    # Postgres + MVP_LOGIN_PASSWORD for DB suite
pnpm verify
```

Apply migrations on target environment before smoke (`pnpm --filter api run db:migrate`).

---

## Out of scope (confirmed)

- BFF / Next pages (`apps/web`) — consumption or relay to add per screen
- Phase 3b (email confirmation, password reset)
- Ticketmaster Events (`apps/thp-final`)
- Claude moderation (phase 6 = regex + denylist)
- Redis pub/sub multi-instance for WebSocket (5b doc note only)

## Files

| File | Role |
|------|------|
| `README.md` | This hub — phase and lot index |

## Canonical reading

- [Docs/README.md](../../README.md)
- [INDEX.md](../../INDEX.md)
- [product/user-journeys.md](../../product/user-journeys.md)
