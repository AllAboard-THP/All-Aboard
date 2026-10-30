# ADR 0003 — Production authentication (real users)

## Status

Accepted — 2026-05-28 (MVP implementation: `users` table, hash login, dev/CI seed).

> **Évolution** : en production, l’identité migre vers **passkeys** ([ADR 0006](0006-authentication-passkeys.md)). Email/password reste en dev/CI transitoire.

## Contexte

[ADR 0001](0001-authentication-strategy.md) establishes JWT + BFF for Phase 2. MVP login relies on `MVP_LOGIN_PASSWORD` (shared password) and free-form `userId` values — acceptable for **internal dev**, insufficient before THP beta or public staging.

## Decision

1. **Postgres `users` table**: `id` (uuid), `email` (unique), `password_hash` (argon2id), `role` (`student` | `mentor`), `created_at`.
2. **`POST /auth/login`**: body `{ email, password }` (legacy alias `{ userId: "bob"|"alice", password }` → `bob@dev.local` / `alice@dev.local` **only** when MVP fallback is active). Argon2 hash verification; JWT + httpOnly cookie unchanged (`sub` = email, `role` from DB).
3. **Keep** BFF pattern and JWT claims ([ADR 0001](0001-authentication-strategy.md)).
4. **Seed**: `pnpm --filter api run db:migrate` runs migrations then idempotent seed when `DEV_SEED_PASSWORD` or `MVP_LOGIN_PASSWORD` is set (`bob@dev.local`, `alice@dev.local` accounts — passwords **not in repo**).
5. **Staging / prod**: no `MVP_LOGIN_PASSWORD`; no MVP fallback (`APP_ENV=staging|production`). Team accounts via manual Dokploy seed (`db:seed` + `DEV_SEED_PASSWORD`) or documented ops procedure.

## Consequences

- Drizzle migration `0001_users.sql` + `db:seed` script.
- ADR 0001 remains valid for transport (cookie, BFF, Bearer).
- `MVP_MENTOR_USER_IDS`: obsolete for role when DB is available (role read from `users.role`).
- THP SSO: supplementary ADR if OAuth required.

## Alternatives not chosen (for now)

- Opaque session + Redis: higher ops load; deferred.
- Extended MVP login on staging: rejected (broad exposure).

## Links

- [Web/API plan](../guides/web-api-integration.md)
- Staging issue [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32)
- Branch `feat/55-auth-users-production`
