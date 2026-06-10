# Rails API parity — Phase 1 (feed/post core)

**Branch:** `feat/api-rails-parity-phase1`  
**OpenAPI:** `0.3.0` (feed / help-requests / subjects enrichments; current spec: [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml))  
**Product reference:** `Post` / `feed` / `explore` blocks in `apps/thp-final` (HTML mockup, Events out of scope).

## Goal

Enrich the `help_requests` core ≈ Rails `Post` without breaking MVP endpoints: filterable feed, subject catalogue, create/edit, mentor help request, denormalized counters.

## Migration `0005_api_rails_phase1.sql`

- Enum `help_request_status` (`open`, `resolved`)
- Table `subjects` (name, slug, icon, accent_color, description, posts_count)
- `help_requests` columns: body, code_snippet, code_language, urgent, status, mentor_help_requested, subject_id (FK), education_level, ai_summary, likes/responses/bookmarks counts, updated_at
- `responses` columns: code_snippet, code_language; `created_at` exposed in API
- Indexes `subject_id`, `status`

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `GET /feed` | public | Filters `subject` (slug), `tag`, `q`; `page`, `limit` (max 100); `include=widgets` → `widgets.unanswered` |
| `GET /subjects` | public | Ordered catalogue (explore) |
| `GET /subjects/:slug` | public | Subject detail + `postsCount` |
| `POST /help-requests` | JWT | Extended body (all fields optional except `title`) |
| `PATCH /help-requests/:id` | JWT | Author edit; partial fields + `status` |
| `POST /help-requests/:id/help-mentor` | JWT | `mentorHelpRequested=true` |
| `GET /help-requests/:id` | public / mentor | Enriched detail + `responses[]`; cert filter unchanged (#83) |
| `POST /help-requests/:id/responses` | JWT | Increments `responsesCount` |
| `GET /mentor/feed` | mentor JWT | Tags **or** `mentorHelpRequested` (compat #82) |

## Code modules

| File | Role |
|------|------|
| [`apps/api/src/routes/feed.ts`](../../../apps/api/src/routes/feed.ts) | `GET /feed` |
| [`apps/api/src/routes/subjects.ts`](../../../apps/api/src/routes/subjects.ts) | Subject catalogue |
| [`apps/api/src/routes/help-requests.ts`](../../../apps/api/src/routes/help-requests.ts) | Request CRUD, responses, help-mentor |
| [`apps/api/src/lib/mappers.ts`](../../../apps/api/src/lib/mappers.ts) | `rowToHelpRequest`, `rowToSubject` |
| [`apps/api/src/lib/feed-query.ts`](../../../apps/api/src/lib/feed-query.ts) | Drizzle filters |
| [`apps/api/src/lib/schemas.ts`](../../../apps/api/src/lib/schemas.ts) | Zod create/update/feed query |

## Types

[`packages/types`](../../../packages/types/src/index.ts): `HelpRequestStatus`, `Subject`, `SubjectSummary`, `FeedPagination`, `FeedWidgets`, `FeedResponse`, `CreateHelpRequestBody`, `UpdateHelpRequestBody`, optional fields on `HelpRequest` / `Response`.

## Seed

[`apps/api/src/db/seed.ts`](../../../apps/api/src/db/seed.ts) — `seedSubjects()`: javascript, ruby, rails, react, html-css (slugs aligned with thp-final).

## Backward compatibility

- `POST /help-requests` with `{ "title" }` only → **201** unchanged
- Enriched JSON fields **optional** in responses (existing MVP clients)
- `GET /feed` without query → `items` + `pagination` (new; clients reading only `items` remain valid)

## Web BFF (`apps/web`)

Phase 1 **API-first**: existing BFF (`GET /api/feed`, `POST /api/help-requests`, …) relays enriched responses without dedicated subjects/widgets routes. Explore / Rails-like post card screens: parallel `apps/web` work.

## Verification

```bash
pnpm --filter api test
pnpm verify
```

## Next

**Phase 2** (social): [api-rails-parity-phase2/README.md](../api-rails-parity-phase2/README.md).  
Hub phases 1–7: [api-rails-parity/README.md](../api-rails-parity/README.md); [integration guide](../../guides/web-api-integration.md#rails-parity-thp-final--api).

## Files

| File | Role |
|------|------|
| `README.md` | This file |
