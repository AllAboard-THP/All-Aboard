# ADR 0003 — Authentification produit (users réels)

## Statut

Proposé — 2026-05-21 (à valider avant ouverture **staging public**).

## Contexte

L’[ADR 0001](0001-authentication-strategy.md) pose JWT + BFF pour la Phase 2. Le login MVP repose sur `MVP_LOGIN_PASSWORD` (mot de passe partagé) et des `userId` libres — acceptable en **dev interne**, insuffisant avant beta THP ou staging public.

## Décision (cible)

1. **Table `users`** Postgres : `id`, `email` ou identifiant stable, `password_hash`, `role` (`student` | `mentor`), timestamps.
2. **`POST /auth/login`** : vérifier hash (argon2/bcrypt) ; émettre le même JWT + cookie httpOnly (pas de changement BFF).
3. **Conserver** le pattern BFF et les claims JWT (`sub`, `role`) introduits pour le dashboard mentor.
4. **Supprimer** `MVP_LOGIN_PASSWORD` en staging/prod ; seed dev documenté.

## Conséquences

- Migration Drizzle + script seed dev.
- ADR 0001 reste valide pour le transport (cookie, BFF, Bearer).
- SSO THP : ADR complémentaire si OAuth requis.

## Alternatives non retenues (pour l’instant)

- Session opaque + Redis : charge ops supérieure ; reportée.
- Login MVP prolongé en staging : rejeté (exposition large).

## Liens

- [Plan Web/API](../plan-mise-en-place-web-api-donnees.md)
- Issue staging [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32)
