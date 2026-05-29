# Plan opérationnel — Web, API, données (SSR, env, TanStack Query)

Référence **canonique** pour le couplage `apps/web` ↔ `apps/api` : variables, contrat `GET /feed`, chemins code, journal de smoke, checklist Dokploy ciblée feed. La **timeline** des phases est dans [README.md](README.md) ; la **cartographie** des docs dans [map-of-content.md](map-of-content.md). Les **faits instance** (domaines, `API_URL` interne) : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md).

**Mise à jour** : 2026-05-27. **Décision** : **Option B** — socle TanStack dans la même livraison que le feed SSR ; home feed client + invalidation livrés (voir *Journal*). **Phase 2 (MVP dépôt)** : Postgres + `GET /feed` réel, `POST /help-requests`, JWT + BFF auth, stubs MOC (doublon, Rubberduck) — ADR [0001](adr/0001-authentication-strategy.md). **MVP parcours Bob (dev)** : livré sur `Dev` + Dokploy dev (PR #50–#52) ; validation housekeeping 2026-05-25 — voir [staging-checklist.md](staging-checklist.md).

---

## Avant PR (garde-fous)

1. Socle TanStack : `providers.tsx` + `layout` si toucher le feed SSR.
2. `API_URL` cohérent en local ; pas de secrets ; [.env.example](../.env.example) à jour si nouvelle variable.
3. API joignable sur le port attendu pour le SSR.
4. Fetch client : **BFF** `GET /api/feed` (implémenté) évite CORS et `NEXT_PUBLIC_API_URL` pour ce flux.
5. Contrat `GET /feed` : types + tests alignés dans le même changement.

---

## Livrables doc (Phase 1–3 home — complété 2026-05-12)

SSR feed, socle Query, merge Dokploy dev, `useQuery` + `invalidateQueries` sur `['feed']`, BFF `/api/feed`, tests et doc matrice/README — voir *Journal* pour les smokes.

### Journal (smoke / déploiement)

| Date | Environnement | Note |
|------|----------------|------|
| 2026-05-12 | CI / local | `pnpm turbo run lint typecheck test build --filter=web --filter=api --filter=@allaboard/types` OK sur branche `feat/phase1-web-api-feed`. |
| 2026-05-12 | Dokploy **dev** (post-merge PR #9) | Web + API déployés ; HTTP : `https://dev.allaboard.fr`, `https://api-dev.allaboard.fr/feed`, `https://dev.allaboard.fr/api/feed`. |
| 2026-05-12 | Doc / code | Phase 3 : `invalidateQueries` + tests ; docs alignés. |
| 2026-05-12 | Dokploy **dev** (post-merge PR #10) | Smoke navigateur : SSR + client `useQuery` + **Rafraîchir** OK. Log LocatorJS = extension navigateur, hors app. |
| 2026-05-14 | CI / local | Phase 2 MVP : Drizzle + Postgres (`DATABASE_URL`), migrations au démarrage API, JWT (`JWT_SECRET`, `MVP_LOGIN_PASSWORD`), BFF `/api/auth/login` + `/api/help-requests`, page `/help/new` ; CI : service Postgres + `pnpm --filter api run db:migrate` avant les tests ; `docker-compose.yml` pour Postgres local. |
| 2026-05-19 | CI / local | Compléments Phase 2 : tests API/BFF étendus, contrats HTTP documentés ci-dessous, `pnpm smoke:dev` ([scripts/smoke-dev.sh](../scripts/smoke-dev.sh)). Smoke Dokploy dev HTTPS : voir [runbook-dokploy-dev-phase2.md](runbook-dokploy-dev-phase2.md). |
| 2026-05-20 | Dokploy **dev** (Phase 2) | Vars API (`DATABASE_URL`, `JWT_SECRET`, `MVP_LOGIN_PASSWORD`, `PORT`, `NODE_ENV`) ; redeploy API ; `pnpm smoke:dev` OK ; `/help/new` + feed SSR (`https://dev.allaboard.fr`) OK. ADR [0001](adr/0001-authentication-strategy.md) accepté ([#18](https://github.com/AllAboard-THP/All-Aboard/issues/18)). |
| 2026-05-21 | Dokploy **dev** (Sprint 0) | Rebase local sur `origin/Dev` ; `pnpm smoke:dev` rejoué OK (`/health`, `/feed`, BFF `/api/feed`) ; clôture ops [#33](https://github.com/AllAboard-THP/All-Aboard/issues/33), [#34](https://github.com/AllAboard-THP/All-Aboard/issues/34), epic backend [#16](https://github.com/AllAboard-THP/All-Aboard/issues/16). |
| 2026-05-21 | CI / local | Parcours MOC : `GET /help-requests/:id`, `GET /mentor/feed`, `GET /auth/me` ; pages `/requests/[id]`, `/mentor` ; TanStack mutation création + query détail ; smoke `GET /help-requests/:id` ; Playwright e2e socle ; [ADR 0003](adr/0003-authentication-users-production.md) proposé ; [staging-checklist](staging-checklist.md). |
| 2026-05-24 | CI / local | Playwright e2e complet (#35) : scénarios feed + création → détail ; job CI `e2e` (paths-filter `apps/web`) ; script `pnpm test:e2e`. Clôture epic frontend [#15](https://github.com/AllAboard-THP/All-Aboard/issues/15). |
| 2026-05-25 | Dokploy **dev** + CI | Housekeeping MVP dev : `pnpm smoke:dev` OK (health, feed, BFF `/api/feed`) ; smoke auth + `GET /help-requests/:id` si `MVP_LOGIN_PASSWORD` aligné Dokploy ([runbook](runbook-dokploy-dev-phase2.md)) ; `pnpm verify:commit` OK local ; parcours Bob validé (code PR #51, e2e CI PR #52) ; [staging-checklist](staging-checklist.md) section dev cochée. |
| 2026-05-25 | Dokploy **staging** (ops #32) | Env staging confirmé (MCP) ; vars API Phase 2 posées ; promotion code PR [#54](https://github.com/AllAboard-THP/All-Aboard/pull/54) `Dev`→`staging` ; smoke HTTPS staging post-merge — [runbook staging](runbook-dokploy-staging-phase2.md). |
| 2026-05-27 | Dokploy **staging** (clôture #32 / #17) | PR #54 mergée ; API deploy OK ; Web redeploy manuel (build auto 2026-05-26 en erreur) ; `pnpm smoke:dev` OK (health, feed UUID, BFF `/api/feed`, auth + création + `GET /help-requests/:id`) ; parcours Bob navigateur OK (`/`, `/help/new`, 409, `/mentor` alice) — [runbook](runbook-dokploy-staging-phase2.md), [checklist](staging-checklist.md). |
| 2026-05-28 | Code **ADR 0003** | Table `users`, login `{ email, password }` (hash argon2), seed `bob@dev.local` / `alice@dev.local` via `DEV_SEED_PASSWORD` ; fallback `MVP_LOGIN_PASSWORD` dev/CI seulement ; smoke `SMOKE_LOGIN_EMAIL` + `SMOKE_LOGIN_PASSWORD`. Ops staging : retirer `MVP_LOGIN_PASSWORD` après seed Dokploy. |
| 2026-05-29 | Dokploy **staging** (ops ADR 0003) | PR #63 + #74 mergées ; `MVP_LOGIN_PASSWORD` retiré ; seed users au boot ; smoke HTTPS complet (`bob@dev.local`, création, détail) ; parcours `/help/new` navigateur OK ; fix crash Swagger (`openapi.yaml` dans image Docker). |

---

## Principes (rappel)

1. Contrat `/feed` stable : `packages/types`, parsing défensif côté web.
2. **SSR** via `API_URL` interne pour la donnée initiale du feed.
3. **TanStack** : rafraîchissement / invalidation côté client ; le feed initial reste SSR.
4. Ne pas mélanger contextes d’URL (table ci-dessous).

---

## Variables d’environnement

| Variable | Où | Rôle |
|----------|-----|------|
| `API_URL` | Serveur Next uniquement | Base URL **interne** vers l’API Dokploy (ex. `http://<nom-service-api>:4000`). Pas de `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_API_URL` | Client | Origine HTTPS si le **navigateur** appelle l’API directement. **Non utilisé** pour le feed actuel (BFF same-origin). |
| `DATABASE_URL` | API | Connexion Postgres (Drizzle). Sans elle : `GET /feed` → 503, pas de persistance. |
| `JWT_SECRET` | API | Signature JWT (min. 32 caractères en prod). Voir [ADR 0001](adr/0001-authentication-strategy.md). |
| `DEV_SEED_PASSWORD` | API | Mot de passe des comptes seed `bob@dev.local` / `alice@dev.local` ([ADR 0003](adr/0003-authentication-users-production.md)). Utilisé par `db:migrate` / `db:seed`. |
| `MVP_LOGIN_PASSWORD` | API | **Dev/CI uniquement** : alias seed + fallback login sans DB. **Interdit** staging/prod (`APP_ENV`). |
| `MVP_MENTOR_USER_IDS` | API | Fallback MVP uniquement (rôle mentor si pas de DB). Obsolète quand `users` est seedé. |
| `CORS_ALLOWED_ORIGINS` | API Fastify | Liste d’origines séparées par des virgules : si définie, `@fastify/cors` est enregistré (`credentials: true`). **N/A** tant que le navigateur n’appelle pas l’API en direct (BFF). |
| `OPENAPI_DOCS` | API | Override explicite pour Swagger UI (`true` / `false`). Par défaut : docs actifs si `APP_ENV` ≠ `production`. Spec : [`apps/api/openapi.yaml`](../apps/api/openapi.yaml), UI : `GET /docs`. |

Référence instance : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md). Tables détaillées par service : [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md).

---

## Contrats API (`apps/api`)

Source de vérité types : [packages/types/src/index.ts](../packages/types/src/index.ts). Spec OpenAPI 3.1 : [apps/api/openapi.yaml](../apps/api/openapi.yaml) (Swagger UI `GET /docs` en dev/staging — [issue #49](https://github.com/AllAboard-THP/All-Aboard/issues/49)). Implémentation : [apps/api/src/app.ts](../apps/api/src/app.ts). Auth : [ADR 0001](adr/0001-authentication-strategy.md).

### Codes d’erreur communs (corps JSON)

| `error` | HTTP typique | Signification |
|---------|--------------|---------------|
| `invalid_body` | 400 | Corps JSON invalide ou hors schéma Zod |
| `unauthorized` | 401 | JWT absent ou invalide (`POST /help-requests`) |
| `invalid_credentials` | 401 | Mot de passe login incorrect |
| `duplicate` | 409 | Titre déjà existant (`existingId` présent) |
| `not_found` | 404 | Demande absente (`GET /help-requests/:id`) |
| `database_unavailable` | 503 | `DATABASE_URL` absent ou DB injoignable |
| `login_not_configured` | 503 | Login indisponible (pas de DB + pas de fallback dev) |
| `insert_failed` | 500 | Échec insertion (rare) |

### `GET /health`

- **200** : `{ "status": "ok" }` — healthcheck Dokploy / smoke.

### `GET /feed`

- **200** : `{ "items": HelpRequest[] }` — `HelpRequest` : `id`, `title`, `authorId`, `createdAt` ; `tags?: string[]` optionnel.
- **503** : `{ "error": "database_unavailable" }`
- Public (pas de JWT).

Exemple :

```json
{ "items": [{ "id": "uuid", "title": "…", "authorId": "bob", "createdAt": "2026-05-19T12:00:00.000Z", "tags": ["rails"] }] }
```

### `POST /auth/login`

- **Corps** : `{ "email": string, "password": string }` (voir [ADR 0003](adr/0003-authentication-users-production.md)). Alias legacy dev : `{ "userId": "bob"|"alice", "password" }` si fallback MVP actif.
- **200** : `{ "ok": true, "userId": string, "role": "student" | "mentor" }` + cookie httpOnly `access_token` (JWT `sub` = email, `role` depuis `users`).
- **400** : `{ "error": "invalid_body" }`
- **401** : `{ "error": "invalid_credentials" }`
- **503** : `{ "error": "login_not_configured" }`

### `GET /auth/me`

- **Auth** : `Authorization: Bearer <jwt>`.
- **200** : `{ "userId": string, "role": "student" | "mentor" }`.
- **401** : `{ "error": "unauthorized" }`.

### `GET /help-requests/:id`

- **200** : `HelpRequestDetailResponse` — `{ "item": HelpRequest, "responses": Response[] }` (MVP : `responses` toujours `[]`).
- **404** : `{ "error": "not_found" }`
- **503** : `{ "error": "database_unavailable" }`
- Public (pas de JWT).

### `GET /mentor/feed`

- **200** : `{ "items": HelpRequest[] }` — demandes avec au moins un tag (filtrage mentor/domaine MVP).
- **503** : `{ "error": "database_unavailable" }`
- Public (garde UI mentor côté Web via `/api/auth/me`).

### `POST /help-requests`

- **Auth** : en-tête `Authorization: Bearer <jwt>` (le BFF lit le cookie `access_token` côté Next et forward le Bearer).
- **Corps** : `CreateHelpRequestBody` — `{ "title": string, "tags"?: string[] }` (`title` 1–500 caractères).
- **201** : `CreateHelpRequestResponse` — `{ "item": HelpRequest, "hints"?: { "rubberduckEligible": true } }`  
  - `hints.rubberduckEligible` : stub MOC si le titre comporte **≤ 6 mots** ; absent sinon.
- **400** / **401** / **503** : voir table ci-dessus.
- **409** : `{ "error": "duplicate", "existingId": string }` (normalisation espaces / casse sur le titre).

---

## BFF Next (`apps/web` — same-origin)

Le navigateur appelle le **Web** ; les Route Handlers relaient vers `API_URL` (serveur).

| Route BFF | Upstream API | Notes |
|-----------|--------------|--------|
| `GET /api/feed` | `GET /feed` | **502** si upstream ou JSON invalide |
| `GET /api/help-requests/:id` | `GET /help-requests/:id` | **404** propage ; **502** si upstream invalide |
| `GET /api/mentor/feed` | `GET /mentor/feed` | **502** si upstream ou JSON invalide |
| `GET /api/auth/me` | `GET /auth/me` | **401** `{ "error": "missing_token" }` si cookie absent |
| `POST /api/auth/login` | `POST /auth/login` | Propage `Set-Cookie` upstream |
| `POST /api/help-requests` | `POST /help-requests` | **401** `{ "error": "missing_token" }` si cookie absent ; forward Bearer |

---

## Smoke post-déploiement

Script : [scripts/smoke-dev.sh](../scripts/smoke-dev.sh) — commande racine `pnpm smoke:dev`.

Variables optionnelles :

| Variable | Défaut | Rôle |
|----------|--------|------|
| `BASE_WEB` | `https://dev.allaboard.fr` | Origine Next |
| `BASE_API` | `https://api-dev.allaboard.fr` | Origine Fastify |
| `MVP_LOGIN_PASSWORD` | (vide) | Si défini : smoke `POST /auth/login` + `POST /help-requests` sur l’API |

Exemples :

```bash
# Dev HTTPS (Dokploy)
pnpm smoke:dev

# Local (API + Web démarrés)
BASE_WEB=http://127.0.0.1:3000 BASE_API=http://127.0.0.1:4000 SMOKE_LOGIN_PASSWORD=dev-only-password pnpm smoke:dev
```

Runbook manuel Dokploy : [runbook-dokploy-dev-phase2.md](runbook-dokploy-dev-phase2.md).

---

## E2E Playwright (#35)

Config : [apps/web/playwright.config.ts](../apps/web/playwright.config.ts) — démarre **API** (port 4000) puis **Web** (port 3000) si `PLAYWRIGHT_SKIP_WEBSERVER` absent.

Scénarios : [apps/web/e2e/](../apps/web/e2e/) — feed (navigation shell) + création demande (login MVP → détail → retour feed).

| Commande | Contexte |
|----------|----------|
| `pnpm test:e2e` | Local : Postgres requis (`DATABASE_URL`, voir [scripts/e2e-playwright.sh](../scripts/e2e-playwright.sh)) |
| `pnpm --filter web run test:e2e` | Idem, sans wrapper migrations |
| `PLAYWRIGHT_SKIP_WEBSERVER=1 pnpm --filter web run test:e2e` | Stack déjà lancée (`pnpm dev:local`) |

**CI** : job `e2e` dans [.github/workflows/ci.yml](../.github/workflows/ci.yml) (paths-filter `apps/web`, Postgres service, `MVP_LOGIN_PASSWORD=ci-test-login-password`).

---

### Chemins code

| Élément | Emplacement |
|---------|-------------|
| `FeedResponse` | `packages/types/src/index.ts` |
| `HelpRequestDetailResponse`, `AuthMeResponse`, `MentorFeedResponse` | `packages/types/src/index.ts` |
| `getApiBaseUrl`, `parseFeedResponse`, `fetchFeed`, `fetchHelpRequest`, `fetchMentorFeed`, `fetchAuthMe` | `apps/web/lib/api-server.ts` |
| Page feed async + `fetchFeed` | `apps/web/app/(app)/page.tsx` |
| UI feed SSR / erreur / vide | `apps/web/components/features/home-content.tsx` |
| Page détail demande | `apps/web/app/(app)/requests/[id]/page.tsx`, `help-request-detail-content.tsx` |
| Dashboard mentor | `apps/web/app/(app)/mentor/page.tsx` |
| BFF `GET /api/feed` | `apps/web/app/api/feed/route.ts` |
| BFF `GET /api/help-requests/[id]`, `GET /api/mentor/feed`, `GET /api/auth/me` | `apps/web/app/api/help-requests/[id]/route.ts`, `mentor/feed/route.ts`, `auth/me/route.ts` |
| BFF `POST /api/auth/login`, `POST /api/help-requests` | `apps/web/app/api/auth/login/route.ts`, `apps/web/app/api/help-requests/route.ts` |
| Schéma SQL + migrations Drizzle | `apps/api/src/db/schema.ts`, `apps/api/drizzle/` |
| Démarrage API (migrations) | `apps/api/src/index.ts`, `apps/api/src/migrate.ts` |
| Formulaire création demande | `apps/web/app/(app)/help/new/page.tsx`, `help-request-form.tsx` |
| `QueryClientProvider` | `apps/web/app/providers.tsx`, `apps/web/app/layout.tsx` |
| `useQuery` feed + détail | `feed-client-preview.tsx` (`['feed']`), `help-request-detail-client.tsx` (`['help-request', id]`) |
| `useMutation` création | `help-request-form.tsx` — invalidation `['feed']`, redirect `/requests/[id]` |
| Tests | `apps/web/tests/api-server.test.ts`, `bff-phase2.test.ts`, `home-content.test.tsx` ; `apps/api/src/app.test.ts` |
| Smoke | `scripts/smoke-dev.sh` (`pnpm smoke:dev`) — inclut `GET /help-requests/:id` si auth smoke |
| E2E Playwright | `apps/web/e2e/`, `playwright.config.ts`, `scripts/e2e-playwright.sh` (`pnpm test:e2e`) |

**Cache** : `fetchFeed` — `next: { revalidate: 60 }` ; BFF `/api/feed` — `cache: 'no-store'`.

---

## Phase 3 client — conventions (état dépôt)

| Convention | Choix actuel |
|--------------|--------------|
| `queryKey` feed | `['feed']` |
| `queryKey` détail demande | `['help-request', id]` |
| Fetch client (home) | **BFF** `GET /api/feed` |
| Fetch client (détail) | **BFF** `GET /api/help-requests/:id` |
| Création demande | `useMutation` + `invalidateQueries({ queryKey: ['feed'] })` |
| Invalidation feed | `invalidateQueries({ queryKey: ['feed'] })` |
| Auth cross-origin | ADR requise si `credentials: 'include'` vers une autre origine |

---

## Checklist Dokploy (feed / Web–API)

- [x] **Web** : `API_URL` vers le service API **interne** même environnement, port 4000 — **validé** smoke dev (SSR + BFF).
- [x] **API `CORS_ALLOWED_ORIGINS`** : **N/A** pour le flux home + formulaire MVP (client → BFF). L’API enregistre CORS **uniquement** si la variable est définie (fetch client cross-origin futur) — voir [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md).
- [ ] **Après recréation / renommage** de service : revalider `API_URL` sur le service Web (noms internes Dokploy).

---

## Historique (décision tranchée)

L’ancienne variante « Phase 1 SSR sans TanStack » n’est plus suivie. Chemin unique : **Option B** (SSR feed + socle Query + extension client sur la home).

---

## Liens

- [README documentation canonique](README.md)
- [Map of content](map-of-content.md)
- [Matrice déploiement et variables](matrice-deploiement-dokploy-coolify.md)

---

## Alignement `.env.example`

Le fichier [.env.example](../.env.example) documente SSR vs client ; le garder synchronisé avec la section *Variables d’environnement* ci-dessus.
