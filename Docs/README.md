# Documentation All-Aboard — point d’entrée canonique

Ce fichier est la **référence unique** pour l’ordre de lecture, la **timeline d’implémentation** et l’**écart assumé** entre le MVP dans le dépôt et la vision long terme. Les autres documents du dossier `Docs/` complètent ce cadre.

**Cartographie des rôles et des liens** (éviter les doublons) : [map-of-content.md](map-of-content.md).

**Priorité en cas de doute** : la **cohérence d’ingénierie** (contrat API stable, SSR interne vs client public, éviter le double travail) prime sur un découpage rigide des phases — voir [Principes pour limiter le rework](#principes-pour-limiter-le-rework) et le [plan opérationnel Web/API/données](plan-mise-en-place-web-api-donnees.md).

**Implémentation livrée** (merge sur `Dev`, 2026-05-12) : feed SSR via `API_URL`, socle `@tanstack/react-query`, BFF `GET /api/feed`, `useQuery` + **invalidation** sur la home (`invalidateQueries` / `['feed']`) — chemins code et journal dans le [plan opérationnel](plan-mise-en-place-web-api-donnees.md).

---

## Hiérarchie des documents

| Document | Rôle |
|----------|------|
| **Ce README** | Timeline, état du dépôt, principes web–API / auth / TanStack. |
| [map-of-content.md](map-of-content.md) | MoC : sujet → source canonique, graphe des liens, règles de maintenance. |
| [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) | Web ↔ API : env, contrat `/feed`, chemins code, journal smoke, checklist Dokploy (feed). |
| [To-do.md](To-do.md) | Actions prioritaires et promotion d’environnement (pas la timeline détaillée). |
| [plan-initialisation-turborepo-mvp.md](plan-initialisation-turborepo-mvp.md) | Stub post-bootstrap ; détail historique : [archive/plan-initialisation-turborepo-mvp-2026-01.md](archive/plan-initialisation-turborepo-mvp-2026-01.md). |
| [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) | Conventions déploiement + tables de variables **génériques**. |
| [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) | Faits observés sur l’instance Dokploy (domaines, branches, `API_URL`). |
| [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | Parcours produit (MOC), sans stack imposée. |
| [audit-integration-kit-ux-allaboard.md](audit-integration-kit-ux-allaboard.md) | Audit **kit UX** (**v1.7**) : inventaire **§8**, phasage, risques, **§11** ; mise en page GitHub. Exécution : [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md). |
| [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md) | **Plan d’intégration** kit UX (**v2.1** — **§0** chemin autonome, **§2.7** motion in-app, **D7**, **D4 Playwright**, **G0/G1**, phases **0–4**, Décommission **`thp-final`**, `apps/web`, **V/T/M/S/P**, Storybook, shadcn) ; détail §8 dans l’audit. |
| [vision/README.md](vision/README.md) | Index : dataflow cible + proposition stack v1+ (hors code MVP actuel). |

---

## Principes pour limiter le rework

1. **Contrat partagé d’abord** : types et JSON de `/feed` dans `packages/types` + API ; une seule source de vérité pour éviter les allers-retours UI.
2. **SSR avec `API_URL` interne** pour la donnée initiale du feed (Dokploy) ; ne pas basculer toute la home en client-only Query sans besoin (SEO, TTFB, complexité CORS).
3. **TanStack Query** : couche **client** (refresh, mutations). Le **socle** (`@tanstack/react-query` + `QueryClientProvider`) est **livré avec** le feed SSR (**Option B**). Extension à d’autres parcours / mutations : Phase 3 « résiduelle » ([plan opérationnel](plan-mise-en-place-web-api-donnees.md)).
4. **`NEXT_PUBLIC_*`** seulement pour ce que le navigateur doit appeler en direct vers l’API ; le serveur utilise `API_URL` sans préfixe public. Flux feed client actuel : **BFF** `/api/feed` (same-origin).

---

## Timeline d’implémentation (ordre recommandé)

Les phases restent un **guide** ; le détail technique (env, contrat `/feed`, smoke) est dans [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md).

### Phase 0 — Socle monorepo et déploiement **Web + API** (livré)

- Monorepo **pnpm** + **Turborepo**, `apps/web` (Next.js App Router), `apps/api` (**Fastify**, REST, `/health`, `/feed` mock).
- `packages/types` et configs ESLint/TypeScript partagées.
- CI, Dockerfiles **web** et **api**, déploiement Dokploy pour Web/API, Postgres par environnement.
- **Hors périmètre actif** : `apps/agent`, `apps/indexer` (Dokploy peut rester désactivé — voir fiche instance).

### Phase 1 — Couplage **Web ↔ API** et données serveur (livré)

- Feed branché sur l’API via **`API_URL`** (SSR) ; types partagés ; `fetch` serveur pour le rendu initial.
- Socle **`@tanstack/react-query` + `QueryClientProvider`** dans la même livraison que le feed (Option B).

### Phase 2 — **Auth** et premier parcours « demande d’aide » (à faire)

- ADR auth ; routes + persistance ; web aligné [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md).

### Phase 3 — TanStack Query **hors home / mutations** (résiduel)

- **Déjà livré sur la home** : `queryKey: ['feed']`, `fetch('/api/feed')` (BFF), **Rafraîchir** → `invalidateQueries({ queryKey: ['feed'] })` — voir [plan opérationnel](plan-mise-en-place-web-api-donnees.md).
- **Suite** : étendre `useQuery` / `useMutation` / conventions aux autres parcours ; documenter `queryKey`, `credentials` si auth cross-origin.
- **Ne pas** imposer **TanStack Router** tant que le routage reste sur **Next.js App Router**.

### Phase 4 — Services **Agent**, **Indexer**, blockchain, files d’attente

- Aligné sur [vision/README.md](vision/README.md) (dataflow + proposition stack) : réactivation Dokploy, Redis/BullMQ, etc., selon besoins produit.

### Vision long terme (hors timeline MVP stricte)

- GraphQL BFF, Prisma, packages dédiés : voir [vision/README.md](vision/README.md) ; migrations futures par **ADR**.

---

## État technique du dépôt

| Zone | État actuel (code) |
|------|-------------------|
| `apps/api` | Fastify REST, `/health`, `/feed` mock ; pas d’auth métier encore. |
| `apps/web` | Next App Router ; SSR feed ; BFF `GET /api/feed` ; TanStack installé + **invalidation** sur la home. |
| Auth | Absente dans web/api monorepo — **Phase 2**. |
| TanStack | Socle + usage home sur le feed — extension **Phase 3 résiduelle**. |
| `apps/thp-final` | Rails **obsolète** — **abandon définitif** ; retirer du dépôt et de la CI ([plan kit — Décommission](plan-integration-kit-ux-allaboard.md#decom-thp-final)). |

---

## Règles pour les agents et contributeurs

1. Lire **ce README**, [map-of-content.md](map-of-content.md) et le [plan opérationnel Web/API/données](plan-mise-en-place-web-api-donnees.md) avant une évolution transverse.
2. Toute décision qui **contredit** la vision long terme : **ADR** dans le dépôt.
3. Mettre à jour **ce fichier** quand une phase est **terminée** ou quand la timeline change (date courte en tête de section concernée).
4. Après un changement fonctionnel Web/API : mettre à jour le *Journal* (et si besoin les chemins code) dans [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) — même PR ou commit suivant sur la branche.

**Mise à jour canonique** : 2026-05-12.
