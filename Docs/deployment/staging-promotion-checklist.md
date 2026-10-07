# Dev → staging promotion checklist

Reference issues [#31](https://github.com/AllAboard-THP/All-Aboard/issues/31) / [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32). **Do not deploy staging** until this checklist is validated by the team.

**Last dev validation:** 2026-05-25 (housekeeping after PR #50–#52).

**Staging promotion:** PR [#54](https://github.com/AllAboard-THP/All-Aboard/pull/54) merged 2026-05-26; HTTPS smoke + Bob journey validated **2026-05-27**. **ADR 0003:** PR [#63](https://github.com/AllAboard-THP/All-Aboard/pull/63) + Docker fix [#74](https://github.com/AllAboard-THP/All-Aboard/pull/74); auth hash + smoke validated **2026-05-29** — [staging runbook](runbooks/staging-phase2.md).

## Product journey (dev)

- [x] SSR feed + `/requests/[id]` links OK — `https://dev.allaboard.fr` + smoke `GET /feed` / BFF
- [x] Create `/help/new` → request detail OK — e2e CI (PR #52) + code PR #51
- [x] Duplicate 409 → link to existing request OK — API tests; browser validation optional
- [x] Mentor dashboard (`alice` + tags) OK — code PR #51; manual `alice` login recommended
- [x] `pnpm verify` OK on `Dev` — CI + local 2026-05-25
- [x] `pnpm smoke:dev` OK (HTTPS dev) — base smoke 2026-05-25; auth + create + `GET /help-requests/:id` when `MVP_LOGIN_PASSWORD` exported in Dokploy (see [dev runbook](runbooks/dev-phase2.md))

## Auth (blocking public staging)

- [x] [ADR 0003](../adr/0003-authentication-users-production.md) accepted (code 2026-05-28)
- [x] `MVP_LOGIN_PASSWORD` removed from staging Dokploy (2026-05-29)
- [x] Seed accounts `bob@dev.local` / `alice@dev.local` on staging Postgres (`DEV_SEED_PASSWORD` in Dokploy; email + hash login validated 2026-05-29)

## Dokploy staging infra

- [x] Dokploy `staging` env provisioned (Web, API, Postgres) — domains `staging.allaboard.fr` / `api-staging.allaboard.fr`
- [x] API Phase 2 vars (`DATABASE_URL`, `JWT_SECRET`, `DEV_SEED_PASSWORD`, `APP_ENV=staging`) — 2026-05-29; no `MVP_LOGIN_PASSWORD`
- [x] Internal Web `API_URL` → staging API consistent
- [x] ADR 0003 code deployed (PR #63 + #74, commit `d8e2372` — 2026-05-29)
- [x] ADR 0003 HTTPS smoke: `SMOKE_LOGIN_EMAIL=bob@dev.local` + `SMOKE_LOGIN_PASSWORD` (Dokploy seed) — login, create, detail OK (2026-05-29)
- [x] No secrets committed in the repository

## Quality

- [x] `pnpm test:e2e` (Playwright) OK on critical path — CI job `e2e`, PR #52
- [x] [Integration guide](../guides/web-api-integration.md) journal up to date
