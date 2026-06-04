# Checklist promotion dev → staging

Référence issue [#31](https://github.com/AllAboard-THP/All-Aboard/issues/31) / [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32). **Ne pas déployer staging** tant que cette checklist n’est pas validée par l’équipe.

**Dernière validation dev** : 2026-05-25 (housekeeping post PR #50–#52).

**Promotion staging** : PR [#54](https://github.com/AllAboard-THP/All-Aboard/pull/54) mergée 2026-05-26 ; validation smoke HTTPS + parcours Bob **2026-05-27**. **ADR 0003** : PR [#63](https://github.com/AllAboard-THP/All-Aboard/pull/63) + fix Docker [#74](https://github.com/AllAboard-THP/All-Aboard/pull/74) ; validation auth hash + smoke **2026-05-29** — [runbook staging](runbook-dokploy-staging-phase2.md).

## Parcours produit (dev)

- [x] Feed SSR + liens `/requests/[id]` OK — `https://dev.allaboard.fr` + smoke `GET /feed` / BFF
- [x] Création `/help/new` → détail demande OK — e2e CI (PR #52) + code PR #51
- [x] Doublon 409 → lien demande existante OK — tests API ; validation navigateur optionnelle
- [x] Dashboard mentor (`alice` + tags) OK — code PR #51 ; validation manuelle login `alice` recommandée
- [x] `pnpm verify` OK sur `Dev` — CI + local 2026-05-25
- [x] `pnpm smoke:dev` OK (HTTPS dev) — base smoke 2026-05-25 ; auth + création + `GET /help-requests/:id` si `MVP_LOGIN_PASSWORD` Dokploy exporté (voir [runbook](runbook-dokploy-dev-phase2.md))

## Auth (bloquant staging public)

- [x] [ADR 0003](adr/0003-authentication-users-production.md) accepté (code 2026-05-28)
- [x] `MVP_LOGIN_PASSWORD` retiré de staging Dokploy (2026-05-29)
- [x] Comptes seed `bob@dev.local` / `alice@dev.local` sur Postgres staging (`DEV_SEED_PASSWORD` Dokploy ; login email + hash validé 2026-05-29)

## Infra Dokploy staging

- [x] Env Dokploy `staging` provisionné (Web, API, Postgres) — domaines `staging.allaboard.fr` / `api-staging.allaboard.fr`
- [x] Vars API Phase 2 (`DATABASE_URL`, `JWT_SECRET`, `DEV_SEED_PASSWORD`, `APP_ENV=staging`) — 2026-05-29 ; pas de `MVP_LOGIN_PASSWORD`
- [x] `API_URL` interne Web → API staging cohérent
- [x] Code ADR 0003 déployé (PR #63 + #74, commit `d8e2372` — 2026-05-29)
- [x] Smoke HTTPS ADR 0003 : `SMOKE_LOGIN_EMAIL=bob@dev.local` + `SMOKE_LOGIN_PASSWORD` (seed Dokploy) — login, création, détail OK (2026-05-29)
- [x] Aucun secret committé dans le dépôt

## Qualité

- [x] `pnpm test:e2e` (Playwright) OK sur parcours critique — CI job `e2e`, PR #52
- [x] Journal [plan opérationnel](../plan-mise-en-place-web-api-donnees.md) à jour
