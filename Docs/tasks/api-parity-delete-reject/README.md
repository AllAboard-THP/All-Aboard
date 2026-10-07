# Rails API parity — Lot A (soft delete + mentor resource reject)

**PR:** [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104)  
**OpenAPI:** `0.8.1` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prerequisite:** [Phase 6](../api-rails-parity-phase6/README.md) (admin moderation), [Phase 4](../api-rails-parity-phase4/README.md) (mentor resources)  
**Rails reference:** `posts#destroy`, `Mentor::ResourcesController#reject` (`apps/thp-final`)

## Goal

Fill remaining CRUD gaps: author post deletion (soft delete) and pending mentor resource rejection, without touching UI/BFF.

## Migration `0011_api_soft_delete_help_requests.sql`

- Column `help_requests.deleted_at` (`timestamptz`, nullable) + partial index
- Drizzle schema: `deletedAt` in [`apps/api/src/db/schema.ts`](../../../apps/api/src/db/schema.ts)

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `DELETE /help-requests/:id` | JWT author or `admin` | Soft delete: `deleted_at = now()`; `204` |
| `POST /mentor/resources/:id/reject` | JWT mentor (subject scope) or `admin` | Resource `pending` → `status: rejected`; `{ item: Resource }` |

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `DELETE /help-requests/:id` | Decrements `subjects.posts_count` if `subjectId`; reuses `adjustSubjectPostsCount` |
| Public feed (`GET /feed`, public lists) | Excludes `deleted_at IS NOT NULL` (like `flagged_for_moderation`) |
| `GET /help-requests/:id` | Author and admin see deleted post; public → **404** |
| `GET /me/help-requests`, bookmarks | Exclude deleted posts for author |
| Admin `POST …/moderation/help-requests/:id/reject` | **Hard delete** unchanged (moderation) |
| `POST /mentor/resources/:id/reject` | Same guards as `approve`; resource removed from pending dashboard |

## Code modules

| File | Role |
|------|------|
| [`apps/api/src/routes/help-requests.ts`](../../../apps/api/src/routes/help-requests.ts) | `DELETE /help-requests/:id` |
| [`apps/api/src/routes/mentor.ts`](../../../apps/api/src/routes/mentor.ts) | `POST …/reject` |
| [`apps/api/src/lib/feed-query.ts`](../../../apps/api/src/lib/feed-query.ts) | `feedPublicVisibility` includes `deleted_at IS NULL` |
| [`apps/api/src/lib/help-request-query.ts`](../../../apps/api/src/lib/help-request-query.ts) | Detail load with author/admin rule |

## Types

[`packages/types`](../../../packages/types/src/index.ts): `deletedAt?` on `HelpRequest` (visible to author/admin).

## Verification

```bash
pnpm --filter @allaboard/types build
pnpm --filter api test
```

## Next

- **Phase 5b** (chat WS): [api-rails-parity-phase5b](../api-rails-parity-phase5b/README.md)
- **Phase 7** (AI): [api-rails-parity-phase7](../api-rails-parity-phase7/README.md)
- Hub: [api-rails-parity](../api-rails-parity/README.md)

## Files

| File | Role |
|------|------|
| `README.md` | This file |
