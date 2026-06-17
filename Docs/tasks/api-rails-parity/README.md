# Rails API parity — hub (phases 1–7 + lots A / 5b / 7)

**Référence produit** : maquette `apps/thp-final` (Rails/Turbo, **lecture seule** — pas de port de code).  
**Contrat HTTP** : [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) (version courante **0.11.0**).  
**Plan opérationnel** : [§ Parité Rails](../../plan-mise-en-place-web-api-donnees.md#parité-rails-thp-final--api).  
**Scope** : `apps/api`, `apps/agent`, `packages/types`, migrations Drizzle — **pas** `apps/web` (BFF/UI en parallèle).

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
| **A** | Soft delete post + reject resource mentor | 0.8.1 | `0011_api_soft_delete_help_requests.sql` | [api-parity-delete-reject](../api-parity-delete-reject/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |
| **5b** | Chat temps réel WebSocket | 0.9.0 | `@fastify/websocket` | [phase5b](../api-rails-parity-phase5b/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |
| **7** | Suggest-tags + `ai_summary` à la résolution | 0.10.0 | outbox + `apps/agent` | [phase7](../api-rails-parity-phase7/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |
| **Modération Claude** | Second avis agent après regex/denylist | 0.11.0 | `apps/agent` + proxy API | [api-claude-moderation](../api-claude-moderation/README.md) | en cours |

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
| Agent (tags, summary, modération) | `apps/agent/src/{tag-suggest,summary-generate,moderation-evaluate}.ts` ; proxy `apps/api/src/agent/` |

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

- BFF / pages Next (`apps/web`) — consommation ou relais à ajouter par écran
- ~~Phase 3b (confirmation email, reset password)~~ — **annulé** ; voir [ADR 0006](../adr/0006-authentication-passkeys.md) (passkeys)
- Events Ticketmaster (`apps/thp-final`)
- Redis pub/sub multi-instance pour WebSocket (note doc 5b uniquement)

## Files

| File | Role |
|------|------|
| `README.md` | This hub — phase and lot index |

## Canonical reading

- [Docs/README.md](../../README.md)
- [INDEX.md](../../INDEX.md)
- [product/user-journeys.md](../../product/user-journeys.md)
