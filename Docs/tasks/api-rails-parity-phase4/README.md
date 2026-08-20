# Rails API parity — Phase 4 (resources & subject requests)

**Branch:** `feat/api-rails-parity-phase4`  
**OpenAPI:** `0.6.0` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prerequisite:** [Phase 3](../api-rails-parity-phase3/README.md)

## Goal

Learning resources, new subject requests, and mentor dashboard (approval queue).

## Migration `0008_api_rails_phase4_resources.sql`

- Tables `resources`, `resource_tags`, `subject_requests`
- Seed: Alice mentor skill → subject `react`

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `GET /resources` | public | Published only; `?q=` search |
| `POST /resources` | JWT | Student → `pending`; mentor/admin → `published` |
| `GET /resources/:id` | public | Published resource detail |
| `PATCH /resources/:id` | JWT author | Edit |
| `DELETE /resources/:id` | JWT author | Delete |
| `POST /subject-requests` | JWT | Request new subject |
| `GET /mentor/dashboard` | mentor JWT | Stats + resources + pending + `helpMentorQueue` |
| `POST /mentor/resources/:id/approve` | mentor JWT | `pending` → `published` |

`GET /mentor/feed` unchanged (compat #82).

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `POST /resources` | Publication workflow by role |
| `GET /resources` | Published only; search title/body/subject/tags |
| `POST /mentor/resources/:id/approve` | Pending resource on mentor skill subject |
| `GET /mentor/dashboard` | Stats + own resources + pending queue + help-mentor queue |

## Code modules

| File | Role |
|------|------|
| [`apps/api/src/routes/resources.ts`](../../../apps/api/src/routes/resources.ts) | Resources CRUD |
| [`apps/api/src/routes/subject-requests.ts`](../../../apps/api/src/routes/subject-requests.ts) | Subject requests |
| [`apps/api/src/routes/mentor.ts`](../../../apps/api/src/routes/mentor.ts) | Dashboard, approve |

## Types

[`packages/types`](../../../packages/types/src/index.ts): `Resource`, `SubjectRequest`, `MentorDashboardResponse`, etc.

## Verification

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test
```

## Next

**Phase 5:** [api-rails-parity-phase5](../api-rails-parity-phase5/README.md)  
**Lot A reject** (supplement): [api-parity-delete-reject](../api-parity-delete-reject/README.md)  
Hub: [api-rails-parity](../api-rails-parity/README.md)

## Files

| File | Role |
|------|------|
| `README.md` | This file |
