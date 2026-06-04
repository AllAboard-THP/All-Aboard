# API Rails parity — Phase 3 (auth & profils)

**Branche :** `feat/api-rails-parity-phase3`  
**OpenAPI :** `0.5.0`

## Objectif

Compléter l’auth et les profils utilisateur (parité blocs Rails : inscription, déconnexion, profil, CGU, profil public).

## Migration `0007_api_rails_phase3_users_auth.sql`

- Colonnes `users` : `full_name`, `headline`, `bio`, `avatar_url`, `education_level`, `cgu_accepted_at`, `notify_on_comment`, `notify_on_message`, `updated_at`
- Enum `user_role` : valeur `admin`
- Table `mentor_subjects` (compétences / matières mentor)

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `POST /auth/register` | — | Inscription (argon2, `acceptCgu: true`) |
| `POST /auth/logout` | — | Efface le cookie `access_token` |
| `GET /auth/me` | JWT | Profil enrichi (DB) |
| `PATCH /users/me` | JWT | Profil + `subjectIds` + prefs notif |
| `POST /legal/accept` | JWT | Timestamp CGU |
| `GET /users/:id` | public | Profil public + `?tab=posts\|responses` |

## Types

`packages/types` : `UserProfile`, `RegisterBody`, `AuthMeResponse` enrichi, `PublicUserResponse`, etc.

## BFF web (`apps/web/app/api`)

Proxies Next.js (même origine que le site) :

| BFF | Fastify |
|-----|---------|
| `POST /api/auth/register` | `POST /auth/register` |
| `POST /api/auth/logout` | `POST /auth/logout` |
| `PATCH /api/users/me` | `PATCH /users/me` |
| `POST /api/legal/accept` | `POST /legal/accept` |
| `GET /api/users/:id` | `GET /users/:id` |

Helper partagé : `apps/web/lib/bff-relay.ts` (cookies + JSON).

## Vérification

```bash
pnpm --filter api test
pnpm --filter web test
pnpm verify
```
