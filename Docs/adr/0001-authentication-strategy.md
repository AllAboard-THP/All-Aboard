# ADR 0001 — MVP authentication (Phase 2)

## Status

Accepted — 2026-05-14 (implementation aligned with this document).

## Context

All-Aboard exposes a Fastify API (`apps/api`) and a Next app (`apps/web`) with a same-origin **BFF** (`/api/*`) for the feed. Phase 2 requires protecting help-request creation while limiting rework (CORS, TanStack `credentials`, Dokploy secrets).

## Decision

1. **JWT tokens (HS256)** signed with `JWT_SECRET`, carried in an **httpOnly** cookie named `access_token` (issued by API on `POST /auth/login`).
2. **The browser does not talk directly to Fastify** for MVP authenticated flows: the **Next Route Handler** relays the request to the API and forwards the incoming cookie as `Authorization: Bearer <jwt>` (cookie read server-side in Next only).
3. **Fastify** validates the JWT via `@fastify/jwt` on protected routes (e.g. `POST /help-requests`). `GET /feed` remains **public** for MVP.
4. **Browser CORS → API**: **out of scope** while the BFF pattern is the rule — no mandatory `NEXT_PUBLIC_API_URL` for MVP auth. A future "client direct to API" evolution would require a supplementary ADR + `CORS_ALLOWED_ORIGINS` + TanStack `credentials`.

## Consequences

- Variables: `JWT_SECRET` (API, required outside tests); no server session or Redis for this slice.
- MVP login: `POST /auth/login` with JSON body `{ "userId": string, "password": string }`; expected password is `MVP_LOGIN_PASSWORD` (env), allowing a shared demo account in dev. **Replace** before any broad exposure (user hash, registration, etc.).
- Web: authenticated forms go through `POST /api/help-requests` (and future BFFs) which forward the bearer.

## Alternatives not chosen

- **Opaque session cookie + Postgres store**: closer to some classic Next flows, but higher operational load for MVP.
- **JWT only in client memory (localStorage)**: rejected (XSS).

## Links

- [Web/API plan](../guides/web-api-integration.md)
- [Deployment matrix](../deployment/environment-variables.md)
