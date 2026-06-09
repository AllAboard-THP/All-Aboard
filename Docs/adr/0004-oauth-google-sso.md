# ADR 0004 — Connexion Google (OAuth 2.0)

## Statut

Accepté — 2026-06-09.

## Contexte

L’[ADR 0001](0001-authentication-strategy.md) pose JWT + cookie httpOnly relayé par le BFF Next. L’[ADR 0003](0003-authentication-users-production.md) couvre email/mot de passe ; le SSO THP était reporté. La carte Connexion landing requiert « Continuer avec Google ».

## Décision

1. **Flux OAuth 2.0 authorization code + PKCE** côté API Fastify (endpoints Google officiels, config via `@fastify/oauth2` `GOOGLE_CONFIGURATION`).
2. **Callback same-origin web** : l’URI enregistrée dans Google Cloud Console pointe vers le BFF `GET /api/auth/google/callback` ; le BFF relaie vers l’API et propage `Set-Cookie` (pattern ADR 0001 inchangé).
3. **State CSRF** : JWT signé (`JWT_SECRET`) embarquant `code_verifier` PKCE — pas de cookie OAuth cross-domaine API/web.
4. **Table `oauth_accounts`** : liaison `(provider, provider_account_id)` → `users.id`.
5. **`users.password_hash` nullable** : comptes OAuth-only sans mot de passe local.
6. **Premier login Google** : création auto (`role: student`) ; si `cguAcceptedAt` absent → redirect `/onboarding` (profil minimal + acceptation CGU via `POST /legal/accept`).
7. **Email existant** : liaison du compte Google au user existant (pas de doublon).
8. **Pas NextAuth** : l’API reste seule source du JWT `access_token`.

## Variables d’environnement (API)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Client OAuth 2.0 Web (Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Secret associé |
| `OAUTH_GOOGLE_CALLBACK_URL` | URI callback **BFF** (ex. `http://localhost:3000/api/auth/google/callback`) |
| `WEB_APP_URL` | Origine web pour redirects post-login (ex. `http://localhost:3000`) |

Sans ces variables, `GET /auth/google` répond `503 oauth_not_configured`.

## Runbook — Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → projet All-Aboard.
2. **APIs & Services → OAuth consent screen** : External (ou Internal si Workspace), scopes `openid`, `email`, `profile`.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. **Authorized JavaScript origins** : `http://localhost:3000`, URLs web staging/prod.
5. **Authorized redirect URIs** (exact match) :
   - `http://localhost:3000/api/auth/google/callback`
   - `https://<domaine-web>/api/auth/google/callback` par environnement
6. Copier Client ID et Client Secret dans Dokploy / `.env` API.

## Conséquences

- Migration `0012_oauth_accounts.sql`.
- Routes API : `GET /auth/google`, `GET /auth/google/callback`.
- Routes BFF : `GET /api/auth/google`, `GET /api/auth/google/callback`.
- UI : bouton branding Google sur la carte Connexion ; page `/onboarding` pour nouveaux comptes OAuth.

## Liens

- [ADR 0001](0001-authentication-strategy.md)
- [ADR 0003](0003-authentication-users-production.md)
- [Matrice déploiement](../matrice-deploiement-dokploy-coolify.md)
