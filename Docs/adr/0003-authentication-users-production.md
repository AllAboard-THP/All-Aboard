# ADR 0003 — Authentification produit (users réels)

## Statut

Accepté — 2026-05-28 (implémentation MVP : table `users`, login par hash, seed dev/CI).

## Contexte

L’[ADR 0001](0001-authentication-strategy.md) pose JWT + BFF pour la Phase 2. Le login MVP repose sur `MVP_LOGIN_PASSWORD` (mot de passe partagé) et des `userId` libres — acceptable en **dev interne**, insuffisant avant beta THP ou staging public.

## Décision

1. **Table `users`** Postgres : `id` (uuid), `email` (unique), `password_hash` (argon2id), `role` (`student` | `mentor`), `created_at`.
2. **`POST /auth/login`** : corps `{ email, password }` (alias legacy `{ userId: "bob"|"alice", password }` → `bob@dev.local` / `alice@dev.local` **uniquement** si fallback MVP actif). Vérification hash argon2 ; JWT + cookie httpOnly inchangés (`sub` = email, `role` depuis la DB).
3. **Conserver** le pattern BFF et les claims JWT ([ADR 0001](0001-authentication-strategy.md)).
4. **Seed** : `pnpm --filter api run db:migrate` exécute migrations puis seed idempotent si `DEV_SEED_PASSWORD` ou `MVP_LOGIN_PASSWORD` est défini (comptes `bob@dev.local`, `alice@dev.local` — mots de passe **hors repo**).
5. **Staging / prod** : pas de `MVP_LOGIN_PASSWORD` ; pas de fallback MVP (`APP_ENV=staging|production`). Comptes équipe via seed manuel Dokploy (`db:seed` + `DEV_SEED_PASSWORD`) ou procédure ops documentée.

## Conséquences

- Migration Drizzle `0001_users.sql` + script `db:seed`.
- ADR 0001 reste valide pour le transport (cookie, BFF, Bearer).
- `MVP_MENTOR_USER_IDS` : obsolète pour le rôle quand la DB est disponible (rôle lu depuis `users.role`).
- SSO THP : ADR complémentaire si OAuth requis.

## Alternatives non retenues (pour l’instant)

- Session opaque + Redis : charge ops supérieure ; reportée.
- Login MVP prolongé en staging : rejeté (exposition large).

## Liens

- [Plan Web/API](../plan-mise-en-place-web-api-donnees.md)
- Issue staging [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32)
- Branche `feat/55-auth-users-production`
