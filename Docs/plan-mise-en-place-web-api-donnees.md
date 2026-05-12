# Plan opérationnel — Web, API, données (SSR, env, TanStack Query)

Ce document détaille la **mise en place cohérente** du couplage `apps/web` ↔ `apps/api` et l’usage de **TanStack Query**, en privilégiant la **logique d’ingénierie** (contrat stable, moins de rework) plutôt qu’un calendrier rigide. Il complète [README.md](README.md) (point d’entrée canonique) et [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md).

**Mise à jour** : 2026-05-12. **Décision projet** : **Option B** — la Phase 1 inclut toujours le **socle TanStack Query** (`@tanstack/react-query` + `QueryClientProvider`) dans la **même PR** que le feed SSR ; les `useQuery` / mutations restent en Phase 3 sauf besoin explicite.

---

## Avant build / merge (garde-fous)

À vérifier avant `pnpm verify` et ouverture de PR :

1. **Socle TanStack** : dépendance + `providers.tsx` + enveloppe dans `layout.tsx` présents dans la même livraison que le feed SSR (aligné Option B).
2. **`API_URL`** cohérent en local ; pas de secrets dans le dépôt ; `.env.example` à jour.
3. **API joignable** sur le port attendu pour tester le SSR.
4. Si **fetch navigateur** vers l’API dans cette PR : `NEXT_PUBLIC_API_URL` + **CORS** côté Fastify configurés.
5. **Contrat `GET /feed`** stable ou types/tests mis à jour dans le même changement.

Checklist détaillée et todos d’exécution : plan Cursor `web-api-tanstack_rollout_3f8a0c2e.plan.md` (workspace). Todos YAML **`doc-impl-*`** : mettre à jour la doc **dans la foulée** du code (même PR ou commit suivant sur la branche).

---

## Documentation au fil de l’implémentation

À cocher au fur et à mesure (aligné sur les todos `doc-impl-*` du plan Cursor) :

- [ ] **Après SSR feed** (`types`, `lib/api-server`, page async, tests) : mettre à jour ce fichier — contrat JSON réel, chemins de fichiers, choix `revalidate` / `no-store` ; [README.md](../README.md) racine si le dev local change.
- [ ] **Après socle TanStack** : ce fichier + [Docs/README.md](README.md) (état « socle posé ») ; [.env.example](../.env.example) si nouvelle variable liée au client.
- [ ] **Après merge / vérif Dokploy** : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) si fait observable change ; sinon entrée dans le *Journal* ci-dessous.
- [ ] **Après Phase 3 client** (`useQuery` / mutations) : ce fichier (conventions `queryKey`, URL publique vs BFF) ; [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) si nouvelles variables ; lien ADR si auth cross-origin.

### Journal (smoke / déploiement)

| Date | Environnement | Note |
|------|----------------|------|
| | | |

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
| `NEXT_PUBLIC_API_URL` | Bundlé côté client | Origine **HTTPS publique** de l’API (`https://api-dev…`, etc.) pour `fetch` / `useQuery` depuis le navigateur. À renseigner quand un composant client appelle l’API directement ; sinon peut attendre. |
| `CORS_ALLOWED_ORIGINS` | API Fastify | Requis si le **navigateur** appelle l’API sur un autre host ; inutile pour le seul SSR serveur→API interne. |

Référence instance : [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) (« double exposition », note sur mise à jour du nom interne après redeploy).

Ne pas committer de secrets ; voir [.env.example](../.env.example) à la racine du monorepo.

---

## Contrat `GET /feed`

- **Réponse attendue** (alignée sur l’API actuelle) : `{ "items": HelpRequest[] }` où `HelpRequest` est défini dans `packages/types`.
- **Évolution** : toute modification de forme impose mise à jour conjointe **api** + **types** + **web** + tests — documenter dans le message de commit / PR.

---

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
- Tests avec `QueryClient` de test.

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
