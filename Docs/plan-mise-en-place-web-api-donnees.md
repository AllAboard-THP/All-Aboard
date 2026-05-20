# Plan opérationnel — Web, API, données (SSR, env, TanStack Query)

Référence **canonique** pour le couplage `apps/web` ↔ `apps/api` : variables, contrat `GET /feed`, chemins code, journal de smoke, checklist Dokploy ciblée feed. La **timeline** des phases est dans [README.md](README.md) ; la **cartographie** des docs dans [map-of-content.md](map-of-content.md). Les **faits instance** (domaines, `API_URL` interne) : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md).

**Mise à jour** : 2026-05-19. **Décision** : **Option B** — socle TanStack dans la même livraison que le feed SSR ; home feed client + invalidation livrés (voir *Journal*). **Phase 2 (MVP dépôt)** : Postgres + `GET /feed` réel, `POST /help-requests`, JWT + BFF auth, stubs MOC (doublon, Rubberduck) — ADR [0001](adr/0001-authentication-strategy.md).

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
| `MVP_LOGIN_PASSWORD` | API | Mot de passe attendu pour `POST /auth/login` (MVP). |
| `CORS_ALLOWED_ORIGINS` | API Fastify | Liste d’origines séparées par des virgules : si définie, `@fastify/cors` est enregistré (`credentials: true`). **N/A** tant que le navigateur n’appelle pas l’API en direct (BFF). |

Référence instance : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md). Tables détaillées par service : [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md).

---

## Contrats API (`apps/api`)

Source de vérité types : [packages/types/src/index.ts](../packages/types/src/index.ts). Implémentation : [apps/api/src/app.ts](../apps/api/src/app.ts). Auth : [ADR 0001](adr/0001-authentication-strategy.md).

### Codes d’erreur communs (corps JSON)

| `error` | HTTP typique | Signification |
|---------|--------------|---------------|
| `invalid_body` | 400 | Corps JSON invalide ou hors schéma Zod |
| `unauthorized` | 401 | JWT absent ou invalide (`POST /help-requests`) |
| `invalid_credentials` | 401 | Mot de passe login incorrect |
| `duplicate` | 409 | Titre déjà existant (`existingId` présent) |
| `database_unavailable` | 503 | `DATABASE_URL` absent ou DB injoignable |
| `login_not_configured` | 503 | `MVP_LOGIN_PASSWORD` absent sur l’API |
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

- **Corps** : `{ "userId": string, "password": string }` (min. 1 caractère chacun).
- **200** : `{ "ok": true, "userId": string }` + cookie httpOnly `access_token` (JWT).
- **400** : `{ "error": "invalid_body" }`
- **401** : `{ "error": "invalid_credentials" }`
- **503** : `{ "error": "login_not_configured" }`

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
BASE_WEB=http://127.0.0.1:3000 BASE_API=http://127.0.0.1:4000 MVP_LOGIN_PASSWORD=dev-only-password pnpm smoke:dev
```

Runbook manuel Dokploy : [runbook-dokploy-dev-phase2.md](runbook-dokploy-dev-phase2.md).

---

### Chemins code

| Élément | Emplacement |
|---------|-------------|
| `FeedResponse` | `packages/types/src/index.ts` |
| `getApiBaseUrl`, `parseFeedResponse`, `fetchFeed` | `apps/web/lib/api-server.ts` |
| Page async + `fetchFeed` | `apps/web/app/page.tsx` |
| UI liste SSR / erreur | `apps/web/components/home-content.tsx` |
| BFF `GET /api/feed` | `apps/web/app/api/feed/route.ts` |
| BFF `POST /api/auth/login`, `POST /api/help-requests` | `apps/web/app/api/auth/login/route.ts`, `apps/web/app/api/help-requests/route.ts` |
| Schéma SQL + migrations Drizzle | `apps/api/src/db/schema.ts`, `apps/api/drizzle/` |
| Démarrage API (migrations) | `apps/api/src/index.ts`, `apps/api/src/migrate.ts` |
| Formulaire création demande | `apps/web/app/help/new/page.tsx`, `apps/web/components/help-request-form.tsx` |
| `QueryClientProvider` | `apps/web/app/providers.tsx`, `apps/web/app/layout.tsx` |
| `useQuery` + invalidation | `apps/web/components/feed-client-preview.tsx` — `queryKey: ['feed']`, `fetch('/api/feed')`, **Rafraîchir** → `invalidateQueries({ queryKey: ['feed'] })` |
| Tests | `apps/web/tests/api-server.test.ts`, `feed-client-preview.test.tsx`, `bff-phase2.test.ts` ; `apps/api/src/app.test.ts` |
| Smoke | `scripts/smoke-dev.sh` (`pnpm smoke:dev`) |

**Cache** : `fetchFeed` — `next: { revalidate: 60 }` ; BFF `/api/feed` — `cache: 'no-store'`.

---

## Phase 3 client — conventions (état dépôt)

| Convention | Choix actuel |
|--------------|--------------|
| `queryKey` feed | `['feed']` |
| Fetch client (home) | **BFF** `GET /api/feed` |
| Invalidation | `invalidateQueries({ queryKey: ['feed'] })` |
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
