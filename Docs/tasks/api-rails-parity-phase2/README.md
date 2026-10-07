# Rails API parity — Phase 2 (social)

**Branch:** `feat/api-rails-parity-phase2`  
**OpenAPI:** `0.4.0` (`social`, `me` tags; current spec: [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml))  
**Prerequisite:** [Phase 1](../api-rails-parity-phase1/README.md) (`likes_count`, `bookmarks_count`, `responses_count` on `help_requests`).

## Goal

Social interactions and user lists aligned with Rails `likes` / `bookmarks` / `my-posts` / `my-bookmarks` / enriched comments.

## Migration `0006_api_rails_phase2_social.sql`

- Tables `likes`, `bookmarks` (unique `user_id` + `help_request_id`)
- Counter caches updated in transaction on toggle / response delete

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `POST /help-requests/:id/likes` | JWT | Toggle like → `{ liked, likesCount, item? }` |
| `POST /help-requests/:id/bookmarks` | JWT | Toggle bookmark → `{ bookmarked, bookmarksCount, item? }` |
| `GET /me/help-requests` | JWT | My requests (author = JWT subject) |
| `GET /me/bookmarks` | JWT | Bookmarked requests |
| `PATCH /help-requests/:id/responses/:responseId` | JWT | Edit response (author); optional body + code |
| `DELETE /help-requests/:id/responses/:responseId` | JWT | Author delete; decrements `responses_count` |

## Code modules

| File | Role |
|------|------|
| [`apps/api/src/routes/social.ts`](../../../apps/api/src/routes/social.ts) | Toggle like / bookmark |
| [`apps/api/src/routes/me.ts`](../../../apps/api/src/routes/me.ts) | `/me/*` lists |
| [`apps/api/src/routes/help-requests.ts`](../../../apps/api/src/routes/help-requests.ts) | PATCH/DELETE responses |

## Types

[`packages/types`](../../../packages/types/src/index.ts): `ToggleLikeResponse`, `ToggleBookmarkResponse`, `MyHelpRequestsResponse`, `UpdateResponseBody`, `UpdateResponseResponse`.

## Web BFF (`apps/web`)

No dedicated likes/bookmarks/me Route Handlers in Phase 2 — **direct API** calls from client or BFF to add when building "My posts" / post card screens. Future shared helper: same pattern as [`apps/web/lib/bff-relay.ts`](../../../apps/web/lib/bff-relay.ts) (Phase 3+).

## Backward compatibility

- Phase 1 endpoints unchanged on the surface
- Missing or `0` counters omitted in JSON mapper (as Phase 1)

## Verification

```bash
env -u DATABASE_URL MVP_LOGIN_PASSWORD=dev pnpm --filter api test   # unit suite
source .env.local.dev && pnpm --filter api test                        # DB suite (likes, me, …)
pnpm verify
```

## Next

**Phase 3** (auth & profiles): [api-rails-parity-phase3/README.md](../api-rails-parity-phase3/README.md).  
Hub: [api-rails-parity/README.md](../api-rails-parity/README.md).

## Files

| File | Role |
|------|------|
| `README.md` | This file |
