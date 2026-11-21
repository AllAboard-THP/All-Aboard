# Rails API parity — Phase 3 (auth & profiles)

**Branch:** `feat/api-rails-parity-phase3`  
**OpenAPI:** `0.5.0` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prerequisite:** [Phase 2](../api-rails-parity-phase2/README.md)

## Goal

Complete auth and user profiles (Rails blocks parity: registration, logout, profile, legal, public profile).

## Migration `0007_api_rails_phase3_users_auth.sql`

- `users` columns: `full_name`, `headline`, `bio`, `avatar_url`, `education_level`, `cgu_accepted_at`, `notify_on_comment`, `notify_on_message`, `updated_at`
- Enum `user_role`: `admin` value
- Table `mentor_subjects` (mentor skills / subjects)

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `POST /auth/register` | — | Registration (argon2, `acceptCgu: true`) |
| `POST /auth/logout` | — | Clears `access_token` cookie |
| `GET /auth/me` | JWT | Enriched profile (DB) |
| `PATCH /users/me` | JWT | Profile + `subjectIds` + notification prefs |
| `POST /legal/accept` | JWT | Legal acceptance timestamp |
| `GET /users/:id` | public | Public profile + `?tab=posts\|responses` |

## Code modules

| File | Role |
|------|------|
| [`apps/api/src/routes/auth.ts`](../../../apps/api/src/routes/auth.ts) | Login, register, logout, me |
| [`apps/api/src/routes/users.ts`](../../../apps/api/src/routes/users.ts) | PATCH profile, GET public |
| [`apps/api/src/routes/legal.ts`](../../../apps/api/src/routes/legal.ts) | Legal acceptance |
| [`apps/api/src/services/user-profile.ts`](../../../apps/api/src/services/user-profile.ts) | Profile aggregation |

## Types

[`packages/types`](../../../packages/types/src/index.ts): `UserProfile`, `RegisterBody`, enriched `AuthMeResponse`, `PublicUserResponse`, etc.

## Web BFF (`apps/web/app/api`)

Next.js proxies (same origin):

| BFF | Fastify |
|-----|---------|
| `POST /api/auth/register` | `POST /auth/register` |
| `POST /api/auth/logout` | `POST /auth/logout` |
| `PATCH /api/users/me` | `PATCH /users/me` |
| `POST /api/legal/accept` | `POST /legal/accept` |
| `GET /api/users/:id` | `GET /users/:id` |

Helper: [`apps/web/lib/bff-relay.ts`](../../../apps/web/lib/bff-relay.ts).

## Verification

```bash
pnpm --filter api test
pnpm --filter web test
pnpm verify
```

## Next

**Phase 4:** [api-rails-parity-phase4](../api-rails-parity-phase4/README.md)  
Hub: [api-rails-parity](../api-rails-parity/README.md)

## Files

| File | Role |
|------|------|
| `README.md` | This file |
