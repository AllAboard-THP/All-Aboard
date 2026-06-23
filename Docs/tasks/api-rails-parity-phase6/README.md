# Rails API parity — Phase 6 (admin & moderation)

**Branch:** `feat/api-rails-parity-phase6`  
**PR:** [#102](https://github.com/AllAboard-THP/All-Aboard/pull/102)  
**OpenAPI:** `0.8.0` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prerequisite:** [Phase 1](../api-rails-parity-phase1/README.md) (feed, help-requests)

## Goal

Admin area: content moderation, regex denylist, role management, subject-request queues.

## Migration `0010_api_rails_phase6_admin.sql`

- Table `denylist_patterns`
- `flagged_for_moderation` columns on `help_requests` / `responses`
- [`profanity.ts`](../../../apps/api/src/services/profanity.ts) service (regex + active patterns, no Claude)
- Seed: `admin@dev.local` (same password as dev accounts)

## Endpoints

| Route | Description |
|-------|-------------|
| `GET /admin/dashboard` | Counters + 10 latest non-flagged requests |
| `GET /admin/moderation` | Flagged posts + responses queue |
| `POST /admin/moderation/help-requests/:id/approve` | Publish (unflag) |
| `POST /admin/moderation/help-requests/:id/reject` | **Hard delete** request |
| `POST /admin/moderation/responses/:id/approve` | Publish comment |
| `POST /admin/moderation/responses/:id/reject` | Delete comment |
| `GET/POST /admin/denylist-patterns` | List + create regex |
| `PATCH/DELETE /admin/denylist-patterns/:id` | Enable/disable, delete |
| `GET /admin/users` | User list |
| `POST /admin/users/:id/promote-admin` | `{ admin: true \| false }` |
| `POST /admin/users/:id/promote-mentor` | Toggle student ↔ mentor |
| `GET /admin/subject-requests` | pending / approved / rejected queues |
| `PATCH /admin/subject-requests/:id` | `{ status }` |

## Public visibility

- `GET /feed`: excludes `flagged_for_moderation` content
- Detail / responses: filtered except author and admin

## Code modules

| File | Role |
|------|------|
| [`apps/api/src/routes/admin.ts`](../../../apps/api/src/routes/admin.ts) | `/admin/*` namespace |
| [`apps/api/src/lib/feed-query.ts`](../../../apps/api/src/lib/feed-query.ts) | Feed moderation filter |

## Types

[`packages/types`](../../../packages/types/src/index.ts): admin dashboard, moderation, denylist types, etc.

## Verification

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test
```

## Next

**Lot A** (author soft delete + mentor resource reject): [api-parity-delete-reject](../api-parity-delete-reject/README.md)  
Hub: [api-rails-parity](../api-rails-parity/README.md)

## Files

| File | Role |
|------|------|
| `README.md` | This file |
