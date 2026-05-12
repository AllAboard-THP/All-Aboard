# Documentation All-Aboard — point d’entrée canonique

Ce fichier est la **référence unique** pour l’ordre de lecture, la **timeline d’implémentation** et l’**écart assumé** entre le MVP dans le dépôt et la vision long terme. Les autres documents du dossier `Docs/` complètent ce cadre.

**Priorité en cas de doute** : la **cohérence d’ingénierie** (contrat API stable, SSR interne vs client public, éviter le double travail) prime sur un découpage rigide des phases — voir [Principes pour limiter le rework](#principes-pour-limiter-le-rework) et le [plan opérationnel Web/API/données](plan-mise-en-place-web-api-donnees.md).

**Implémentation récente** (2026-05-12, branche `feat/phase1-web-api-feed`) : feed SSR via `API_URL`, socle `@tanstack/react-query`, BFF `GET /api/feed` pour `useQuery` same-origin, exemple `queryKey: ['feed']` — chemins dans le [plan opérationnel — section chemins code](plan-mise-en-place-web-api-donnees.md).

---

## Hiérarchie des documents

| Document | Rôle |
|----------|------|
| **Ce README** | Timeline, état MVP, règles web–API / auth / TanStack. |
| [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) | **Plan opérationnel détaillé** : env, contrat `/feed`, SSR vs Query, checklist Dokploy, ordre d’exécution. |
| [To-do.md](To-do.md) | Priorités opérationnelles (env, promotion, checklist). |
| [plan-initialisation-turborepo-mvp.md](plan-initialisation-turborepo-mvp.md) | Historique et checklists d’initialisation monorepo ; voir ici pour le **phasing** à jour. |
| [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | Parcours produit (MOC), sans stack imposée. |
| [dataflow-architecture.md](dataflow-architecture.md) | Vue dataflow **cible** multi-canal ; le MVP actuel est un sous-ensemble. |
| [proposition-stack-technique-monorepo-2026.md](proposition-stack-technique-monorepo-2026.md) | **Vision** v1+ (GraphQL, Prisma, packages `auth`, etc.) — **pas** la description du code présent aujourd’hui. |
| [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) | Convention déploiement par service + variables d’environnement (cible + instance). |
| [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) | Fait observé sur l’instance Dokploy (domaines, `API_URL`, Postgres, Agent/Indexer). |

---

## Principes pour limiter le rework

1. **Contrat partagé d’abord** : types et JSON de `/feed` dans `packages/types` + API ; une seule source de vérité pour éviter les allers-retours UI.
2. **SSR avec `API_URL` interne** pour la donnée initiale du feed (Dokploy) ; ne pas basculer toute la home en client-only Query sans besoin (SEO, TTFB, complexité CORS).
3. **TanStack Query** : couche **client** (refresh, mutations). Le **socle** (`@tanstack/react-query` + `QueryClientProvider`) est **obligatoire en Phase 1** dans la même livraison que le feed SSR (**Option B** tranchée) ; les `useQuery` / mutations étendues suivent en Phase 3 ([plan opérationnel](plan-mise-en-place-web-api-donnees.md)).
4. **`NEXT_PUBLIC_*`** seulement pour ce que le navigateur doit appeler ; le serveur utilise `API_URL` sans préfixe public.

---

## Timeline d’implémentation (ordre recommandé)

Les phases restent un **guide** ; le détail d’exécution (env, contrat `/feed`, Dokploy) est dans [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md). **Décision** : Phase 1 = SSR feed **+** socle TanStack (pas de variante A/B).

### Phase 0 — Socle monorepo et déploiement **Web + API** (référence : aujourd’hui)

- Monorepo **pnpm** + **Turborepo**, `apps/web` (Next.js App Router), `apps/api` (**Fastify**, REST, `/health`, `/feed` mock).
- `packages/types` et configs ESLint/TypeScript partagées.
- CI, Dockerfiles **web** et **api**, déploiement Dokploy pour Web/API, Postgres par environnement.
- **Hors périmètre actif** : `apps/agent`, `apps/indexer` (ressources Dokploy pouvant rester désactivées tant que le code n’existe pas — voir fiche instance).

**Livrable** : build vert, URLs Web/API par environnement, pas de dette documentaire sur « ce qui est mock ».

### Phase 1 — Couplage **Web ↔ API** et données serveur

- Brancher le **feed** (SSR ou route serveur) sur l’API via **`API_URL`** (fiche instance Dokploy).
- Côté API : évolution du mock vers contrat stable (types partagés, éventuellement validation **zod**).
- **`fetch` côté serveur** pour le rendu initial du feed (obligatoire pour ce flux).
- **Socle `@tanstack/react-query` + provider** : **obligatoire** dans la même PR que le feed SSR (Option B) ; le feed **ne doit pas** être remplacé par du seul client Query sur les pages critiques sans décision explicite.

**Livrable** : page(s) consommant `/feed` alignée prod **et** socle Query installé + provider actif (tests SSR inchangés).

### Phase 2 — **Auth** et premier parcours « demande d’aide »

- Choisir et documenter le mode d’auth (sessions cookies httpOnly, JWT, ou autre) dans une **ADR** ; variables type `JWT_SECRET` / `SESSION_SECRET` (matrice) deviennent **effectives** selon le choix.
- API : routes d’auth + persistance minimale (ou intégration progressive vers Postgres hors mock).
- Web : flux alignés avec le [MOC parcours utilisateur](moc-parcours-utilisateur.md).

**Livrable** : utilisateur peut s’authentifier et enclencher un parcours demande d’aide minimal bout-en-bout (même simplifié).

### Phase 3 — **TanStack Query** (usage client étendu)

- **`useQuery` / `useMutation` / invalidation** lorsque des composants client en ont besoin (déjà possible si le socle a été posé en Phase 1).
- **Ne pas** imposer **TanStack Router** tant que le routage reste porté par **Next.js App Router**.
- Documenter dans le code : conventions de `queryKey`, `NEXT_PUBLIC_API_URL` ou BFF, `credentials` si auth cross-origin.

**Livrable** : flux client data homogènes sur au moins un parcours critique + tests.

### Phase 4 — Services **Agent**, **Indexer**, blockchain, files d’attente

- Aligné sur [dataflow-architecture.md](dataflow-architecture.md) et [proposition-stack-technique-monorepo-2026.md](proposition-stack-technique-monorepo-2026.md) : réactivation Dokploy, Redis/BullMQ, etc., selon besoins produit.

### Vision long terme (hors timeline MVP stricte)

- **GraphQL** BFF, **Prisma**, **Supabase**/Postgres unifié, packages `packages/auth`, `api-client`, etc. : décrits dans la **proposition stack 2026** ; migration progressive par ADR quand la Phase 2–3 est stable.

---

## État technique du dépôt (rappel)

| Zone | Aujourd’hui | Après Phase 1–3 (cible doc) |
|------|-------------|-----------------------------|
| `apps/api` | Fastify REST, mock | REST (+ auth), persistance |
| `apps/web` | Next, pages vitrine / health | SSR feed + **socle** TanStack en Phase 1 ; usage client Query Phase 3 |
| Auth | Absente dans web/api monorepo | Phase 2 |
| TanStack | Non installé | Socle en Phase 1 ; usage étendu Phase 3 |
| `apps/thp-final` | Rails (Devise) — historique | Hors timeline du nouveau MVP JS sauf décision explicite de convergence |

---

## Règles pour les agents et contributeurs

1. Lire **ce README** et le [plan opérationnel Web/API/données](plan-mise-en-place-web-api-donnees.md) avant une évolution transverse.
2. Toute décision qui **contredit** la vision long terme : **ADR** dans le dépôt.
3. Mettre à jour **ce fichier** quand une phase est **terminée** ou quand la timeline change (date courte en tête de section concernée).
4. **Implémentation** : après chaque bloc fonctionnel (SSR, socle TanStack, merge, client Query), exécuter les tâches **`doc-impl-*`** décrites dans [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) (section *Documentation au fil de l’implémentation*) — même PR ou commit immédiat sur la branche.

**Mise à jour canonique** : 2026-05-12.
