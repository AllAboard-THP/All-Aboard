# API Rails parity — Phase 4 (resources & subject requests)

## Scope

- Migration `0008_api_rails_phase4_resources.sql` : `resources`, `resource_tags`, `subject_requests`
- Routes : `GET/POST/PATCH/DELETE /resources`, `POST /subject-requests`, `GET /mentor/dashboard`, `POST /mentor/resources/:id/approve`
- Types `@allaboard/types` + OpenAPI `0.6.0`
- Seed : compétence mentor Alice → subject `react`

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `POST /resources` | Student → `pending` ; mentor/admin → `published` |
| `GET /resources` | Published only ; `?q=` search title/body/subject/tags |
| `POST /mentor/resources/:id/approve` | Pending resource on mentor competence subject |
| `GET /mentor/dashboard` | Stats + own resources + pending queue + `helpMentorQueue` |

`GET /mentor/feed` unchanged (compat #82).

## Verify

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test   # with Postgres + MVP_LOGIN_PASSWORD for DB suite
```
