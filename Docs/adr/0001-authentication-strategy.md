# ADR 0001 — Authentification MVP (Phase 2)

## Statut

Accepté — 2026-05-14 (implémentation alignée sur ce document).

## Contexte

All-Aboard expose une API Fastify (`apps/api`) et une app Next (`apps/web`) avec **BFF** same-origin (`/api/*`) pour le feed. La Phase 2 exige de protéger la création de demandes d’aide tout en limitant le rework (CORS, TanStack `credentials`, secrets Dokploy).

## Décision

1. **Jetons JWT (HS256)** signés avec `JWT_SECRET`, transportés dans un cookie **httpOnly** nommé `access_token` (émission côté API sur `POST /auth/login`).
2. **Le navigateur ne parle pas directement à Fastify** pour les flux authentifiés MVP : le **Route Handler Next** relaie la requête vers l’API et transmet le cookie entrant en en-tête `Authorization: Bearer <jwt>` (lecture du cookie côté serveur Next uniquement).
3. **Fastify** valide le JWT via `@fastify/jwt` sur les routes protégées (ex. `POST /help-requests`). `GET /feed` reste **public** pour le MVP.
4. **CORS navigateur → API** : **hors périmètre** tant que le pattern BFF reste la règle — pas de `NEXT_PUBLIC_API_URL` obligatoire pour l’auth MVP. Une évolution « client direct vers l’API » exigerait ADR complémentaire + `CORS_ALLOWED_ORIGINS` + TanStack `credentials`.

## Conséquences

- Variables : `JWT_SECRET` (API, obligatoire hors tests) ; pas de session serveur ni Redis pour cette tranche.
- Login MVP : `POST /auth/login` avec corps JSON `{ "userId": string, "password": string }` ; le mot de passe attendu est `MVP_LOGIN_PASSWORD` (env), permettant un compte de démo partagé en dev. **À remplacer** avant toute exposition large (hash utilisateur, inscription, etc.).
- Web : les formulaires authentifiés passent par `POST /api/help-requests` (et futurs BFF) qui forwardent le bearer.

## Alternatives non retenues

- **Session cookie opaque + store Postgres** : plus proche de certains parcours Next classiques, mais charge opérationnelle supérieure pour le MVP.
- **JWT uniquement en mémoire client (localStorage)** : rejeté (XSS).

## Liens

- [Plan Web/API](../plan-mise-en-place-web-api-donnees.md)
- [Matrice déploiement](../matrice-deploiement-dokploy-coolify.md)
