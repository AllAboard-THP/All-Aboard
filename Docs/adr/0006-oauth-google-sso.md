# ADR 0006 — Google sign-in (OAuth 2.0)

## Status

Accepted — 2026-06-09.

## Context

[ADR 0001](0001-authentication-strategy.md) establishes JWT + httpOnly cookie relayed by the Next BFF. [ADR 0003](0003-authentication-users-production.md) covers email/password; THP SSO was deferred. The landing login card requires "Continue with Google".

## Decision

1. **OAuth 2.0 authorization code + PKCE flow** on the Fastify API (official Google endpoints, config via `@fastify/oauth2` `GOOGLE_CONFIGURATION`).
2. **Same-origin web callback**: URI registered in Google Cloud Console points to BFF `GET /api/auth/google/callback`; BFF relays to API and propagates `Set-Cookie` (ADR 0001 pattern unchanged).
3. **CSRF state**: JWT signed (`JWT_SECRET`) embedding PKCE `code_verifier` — no cross-domain API/web OAuth cookie.
4. **`oauth_accounts` table**: link `(provider, provider_account_id)` → `users.id`.
5. **Nullable `users.password_hash`**: OAuth-only accounts without local password.
6. **First Google login**: auto-create (`role: student`); if `cguAcceptedAt` missing → redirect `/onboarding` (minimal profile + legal acceptance via `POST /legal/accept`).
7. **Existing email**: link Google account to existing user (no duplicate).
8. **No NextAuth**: API remains sole source of `access_token` JWT.

## Environment variables (API)

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web client (Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Associated secret |
| `OAUTH_GOOGLE_CALLBACK_URL` | **BFF** callback URI (e.g. `http://localhost:3000/api/auth/google/callback`) |
| `WEB_APP_URL` | Web origin for post-login redirects (e.g. `http://localhost:3000`) |

Without these variables, `GET /auth/google` responds `503 oauth_not_configured`.

## Runbook — Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → All-Aboard project.
2. **APIs & Services → OAuth consent screen**: External (or Internal if Workspace), scopes `openid`, `email`, `profile`.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. **Authorized JavaScript origins**: `http://localhost:3000`, web staging/prod URLs.
5. **Authorized redirect URIs** (exact match):
   - `http://localhost:3000/api/auth/google/callback`
   - `https://<web-domain>/api/auth/google/callback` per environment
6. Copy Client ID and Client Secret to Dokploy / API `.env`.

## Consequences

- Migration `0012_oauth_accounts.sql`.
- API routes: `GET /auth/google`, `GET /auth/google/callback`.
- BFF routes: `GET /api/auth/google`, `GET /api/auth/google/callback`.
- UI: Google branding button on login card; `/onboarding` page for new OAuth accounts.

## Links

- [ADR 0001](0001-authentication-strategy.md)
- [ADR 0003](0003-authentication-users-production.md)
- [Deployment matrix](../deployment/environment-variables.md)
