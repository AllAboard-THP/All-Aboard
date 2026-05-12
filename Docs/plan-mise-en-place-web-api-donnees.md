# Plan opérationnel — Web, API, données (SSR, env, TanStack Query)

Référence **canonique** pour le couplage `apps/web` ↔ `apps/api` : variables, contrat `GET /feed`, chemins code, journal de smoke, checklist Dokploy ciblée feed. La **timeline** des phases est dans [README.md](README.md) ; la **cartographie** des docs dans [map-of-content.md](map-of-content.md). Les **faits instance** (domaines, `API_URL` interne) : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md).

**Mise à jour** : 2026-05-12. **Décision** : **Option B** — socle TanStack dans la même livraison que le feed SSR ; home feed client + invalidation livrés (voir *Journal*).

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
| `CORS_ALLOWED_ORIGINS` | API Fastify | Si le navigateur appelle l’API sur un autre host ; inutile pour SSR seul ni pour le flux home via BFF. |

Référence instance : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md). Tables détaillées par service : [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md).

---

## Contrat `GET /feed`

- Réponse : `{ "items": HelpRequest[] }` — `HelpRequest` dans `packages/types`.
- Évolution : mettre à jour **api** + **types** + **web** + tests dans le même changement.

### Chemins code

| Élément | Emplacement |
|---------|-------------|
| `FeedResponse` | `packages/types/src/index.ts` |
| `getApiBaseUrl`, `parseFeedResponse`, `fetchFeed` | `apps/web/lib/api-server.ts` |
| Page async + `fetchFeed` | `apps/web/app/page.tsx` |
| UI liste SSR / erreur | `apps/web/components/home-content.tsx` |
| BFF `GET /api/feed` | `apps/web/app/api/feed/route.ts` |
| `QueryClientProvider` | `apps/web/app/providers.tsx`, `apps/web/app/layout.tsx` |
| `useQuery` + invalidation | `apps/web/components/feed-client-preview.tsx` — `queryKey: ['feed']`, `fetch('/api/feed')`, **Rafraîchir** → `invalidateQueries({ queryKey: ['feed'] })` |
| Tests | `apps/web/tests/api-server.test.ts`, `feed-client-preview.test.tsx` |

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
- [x] **API `CORS_ALLOWED_ORIGINS`** : **N/A** pour le flux home actuel (client → BFF same-origin). À compléter quand le navigateur appellera l’API HTTPS directement — voir [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md).
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
