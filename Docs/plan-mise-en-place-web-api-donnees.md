# Plan opérationnel — Web, API, données (SSR, env, TanStack Query)

Ce document détaille la **mise en place cohérente** du couplage `apps/web` ↔ `apps/api` et l’usage de **TanStack Query**, en privilégiant la **logique d’ingénierie** (contrat stable, moins de rework) plutôt qu’un calendrier rigide. Il complète [README.md](README.md) (point d’entrée canonique) et [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md).

**Mise à jour** : 2026-05-12. **Décision projet** : **Option B** — la Phase 1 inclut toujours le **socle TanStack Query** (`@tanstack/react-query` + `QueryClientProvider`) dans la **même PR** que le feed SSR ; les `useQuery` / mutations restent en Phase 3 sauf besoin explicite.

---

## Avant build / merge (garde-fous)

À vérifier avant `pnpm verify` et ouverture de PR :

1. **Socle TanStack** : dépendance + `providers.tsx` + enveloppe dans `layout.tsx` présents dans la même livraison que le feed SSR (aligné Option B).
2. **`API_URL`** cohérent en local ; pas de secrets dans le dépôt ; `.env.example` à jour.
3. **API joignable** sur le port attendu pour tester le SSR.
4. Si **fetch navigateur** direct vers l’origine Fastify : `NEXT_PUBLIC_API_URL` + **CORS** côté Fastify. **Alternative implémentée** : Route Handler **BFF** `GET /api/feed` sur Next (same-origin) pour `useQuery` sans CORS ni variable publique.
5. **Contrat `GET /feed`** stable ou types/tests mis à jour dans le même changement.

Checklist détaillée et todos d’exécution : plan Cursor `web-api-tanstack_rollout_3f8a0c2e.plan.md` (workspace). Todos YAML **`doc-impl-*`** : mettre à jour la doc **dans la foulée** du code (même PR ou commit suivant sur la branche).

---

## Documentation au fil de l’implémentation

À cocher au fur et à mesure (aligné sur les todos `doc-impl-*` du plan Cursor) :

- [x] **Après SSR feed** (`types`, `lib/api-server`, page async, tests) : chemins et cache documentés ci-dessous ; README racine inchangé (comportement `pnpm dev` identique).
- [x] **Après socle TanStack** : `providers.tsx`, `layout`, dépendance ; pas de nouvelle variable d’env (client via BFF `/api/feed`).
- [x] **Après merge / vérif Dokploy** : smoke dev exécuté (voir *Journal*) ; pas de changement de domaines ni de nom de service à reporter dans [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md).
- [x] **Après Phase 3 client** (`useQuery`, **invalidation** `invalidateQueries`) : `queryKey` `['feed']`, fetch same-origin vers **BFF** `/api/feed` ; pas de `NEXT_PUBLIC_API_URL` pour ce flux ; matrice env inchangée.

### Journal (smoke / déploiement)

| Date | Environnement | Note |
|------|----------------|------|
| 2026-05-12 | CI / local | `pnpm turbo run lint typecheck test build --filter=web --filter=api --filter=@allaboard/types` OK sur branche `feat/phase1-web-api-feed`. |
| 2026-05-12 | Dokploy **dev** (post-merge PR #9) | MCP `application-one` : Web + API `applicationStatus: done`, derniers déploiements **done** sans `errorMessage`. Vérif HTTP : `https://dev.allaboard.fr` (SSR feed + page), `https://api-dev.allaboard.fr/feed` (JSON), `https://dev.allaboard.fr/api/feed` (BFF). Monitoring time-series vide (pas de métriques remontées dans la réponse MCP). |
| 2026-05-12 | Doc / code | Phase 3 plan : `invalidateQueries` sur `['feed']` + tests ; doc `plan-mise-en-place`, `Docs/README`, `README` racine, `matrice` alignés (todos plan `doc-impl-*` / `phase3-client`). |

---

## Principe directeur (éviter de refaire le travail)

1. **Stabiliser le contrat** avant d’étaler l’UI : schéma JSON de `GET /feed`, types dans `packages/types`, parsing défensif côté web.
2. **SSR pour la donnée initiale** du feed (ou des pages sensibles perf/SEO) : `fetch` depuis le serveur Next vers **`API_URL` interne** (réseau Dokploy). Ne pas remplacer ce flux par du client-only Query sur la home sans besoin explicite.
3. **TanStack Query** : utile pour le **client** (rafraîchissement, mutations, invalidation). **Décision** : poser le **socle** (`@tanstack/react-query` + `QueryClientProvider` dans `layout`) **dans la même livraison** que le branchement SSR du feed (Option B) ; les `useQuery` / mutations suivent en Phase 3 quand le produit l’exige, sans contredire le point 2 (le feed initial reste SSR).
4. **Variables d’URL** : ne pas mélanger les contextes — interne pour le serveur, public pour le navigateur (voir ci-dessous).

---

## Variables d’environnement

| Variable | Où | Rôle |
|----------|-----|------|
| `API_URL` | Serveur Next uniquement (SSR, Server Actions, Route Handlers) | Base URL **interne** vers le service API Dokploy (ex. `http://<nom-service-api>:4000`). **Pas** de préfixe `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_API_URL` | Bundlé côté client | Origine **HTTPS publique** de l’API pour `fetch` / `useQuery` **direct** depuis le navigateur. Non requis si le client appelle un **Route Handler** Next (BFF) same-origin (ex. `/api/feed` actuel). |
| `CORS_ALLOWED_ORIGINS` | API Fastify | Requis si le **navigateur** appelle l’API sur un autre host ; inutile pour le seul SSR serveur→API interne. |

Référence instance : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) (« double exposition », note sur mise à jour du nom interne après redeploy).

Ne pas committer de secrets ; voir [.env.example](../.env.example) à la racine du monorepo.

---

## Contrat `GET /feed`

- **Réponse attendue** (alignée sur l’API actuelle) : `{ "items": HelpRequest[] }` où `HelpRequest` est défini dans `packages/types`.
- **Évolution** : toute modification de forme impose mise à jour conjointe **api** + **types** + **web** + tests — documenter dans le message de commit / PR.

### Chemins code (référence — 2026-05-12)

| Élément | Emplacement |
|---------|-------------|
| `FeedResponse` | `packages/types/src/index.ts` |
| `getApiBaseUrl`, `parseFeedResponse`, `fetchFeed` | `apps/web/lib/api-server.ts` |
| Page async + `fetchFeed` | `apps/web/app/page.tsx` |
| UI liste SSR / erreur | `apps/web/components/home-content.tsx` |
| BFF `GET /api/feed` | `apps/web/app/api/feed/route.ts` |
| `QueryClientProvider` | `apps/web/app/providers.tsx`, enveloppe `apps/web/app/layout.tsx` |
| `useQuery` + invalidation | `apps/web/components/feed-client-preview.tsx` — `queryKey: ['feed']`, `fetch('/api/feed')`, bouton **Rafraîchir** → `queryClient.invalidateQueries({ queryKey: ['feed'] })` |
| Tests | `apps/web/tests/api-server.test.ts`, `feed-client-preview.test.tsx` |

**Cache SSR** : `fetchFeed` utilise `next: { revalidate: 60 }` (ISR 1 min pour la home). Le BFF `/api/feed` utilise `cache: 'no-store'` pour refléter l’API au moment de la requête client.

## Ordre d’exécution recommandé

### 0. Branche Git

Créer une branche depuis la branche d’intégration habituelle (ex. `Dev`), pousser sur `origin`, ouvrir PR ; `pnpm verify` avant merge ([AGENTS.md](../AGENTS.md)).

### 1. Types et utilitaire serveur

- Exporter `FeedResponse` (ou équivalent) dans `packages/types`.
- Module `apps/web` (ex. `lib/api-server.ts`) : `getApiBaseUrl()` = `process.env.API_URL ?? 'http://127.0.0.1:4000'`, `fetchFeed()` avec gestion d’erreur (timeout, JSON invalide, 5xx).

### 2. UI SSR

- Page ou composant **async** serveur consommant `fetchFeed()`, affichage liste + état d’erreur en dev.

### 3. Socle TanStack Query (**même livraison** que 1–2 — Option B retenue)

- `pnpm add @tanstack/react-query` dans `apps/web`.
- Fichier client `providers.tsx` : `QueryClientProvider` + création du `QueryClient` (pattern singleton côté client pour App Router).
- `layout.tsx` : envelopper `children` avec ce provider. Le feed principal reste rendu par **SSR** ; Query est prêt pour boutons « Rafraîchir », formulaires, etc.

### 4. Extension client (quand le besoin existe)

- `useQuery` avec `queryKey` stable (ex. `['feed']`), URL = `NEXT_PUBLIC_API_URL` + chemin, ou Route Handler Next en BFF pour limiter CORS.
- **Invalidation** : `queryClient.invalidateQueries({ queryKey: ['feed'] })` pour forcer un refetch (ex. bouton « Rafraîchir » sur la home).
- Tests avec `QueryClient` de test.

### Phase 3 client — conventions TanStack (état dépôt)

| Convention | Choix actuel |
|--------------|--------------|
| `queryKey` feed | `['feed']` — à réutiliser pour toute lecture/invalidation du même agrégat |
| Origine fetch client | **BFF** `GET /api/feed` (same-origin) ; pas de `NEXT_PUBLIC_API_URL` tant que le client ne tape pas l’API publique directement |
| Invalidation | `useQueryClient().invalidateQueries({ queryKey: ['feed'] })` après action utilisateur ou mutation future |
| Auth cross-origin | Pas encore ; une **ADR** sera requise si `credentials: 'include'` vers une origine API distincte |

### 5. Post-merge Dokploy

- Vérifier `API_URL` sur le service Web après déploiement ; smoke page feed.

---

## Checklist Dokploy (par environnement)

- [ ] **Web** : `API_URL` pointe vers le nom **interne** du service API du même environnement, port 4000.
- [ ] **API** : `CORS_ALLOWED_ORIGINS` inclut l’origine web **publique** si le client appelle l’API HTTPS.
- [ ] Après recréation / renommage de service : revalider `API_URL` (les noms internes peuvent changer).

---

## Variantes (historique)

L’ancienne variante « stricte » (Phase 1 SSR **sans** installer TanStack) n’est **plus** suivie pour ce dépôt. Le chemin canonique est **Option B** : SSR feed + socle Query + provider dans la **même PR** ; extension `useQuery` / mutations en Phase 3.

---

## Liens

- [README documentation canonique](README.md)
- [Matrice déploiement et variables](matrice-deploiement-dokploy-coolify.md)

---

## Alignement avec `.env.example` (racine du monorepo)

Le fichier [.env.example](../.env.example) contient les commentaires **SSR vs client** et les variables `API_URL` / `NEXT_PUBLIC_API_URL` (commentée). À garder synchronisé avec cette section en cas d’évolution.
