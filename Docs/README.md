# Documentation All-Aboard — point d’entrée canonique

Ce fichier est la **référence unique** pour l’ordre de lecture, la **timeline d’implémentation** et l’**écart assumé** entre le MVP dans le dépôt et la vision long terme. Les autres documents du dossier `Docs/` complètent ce cadre ; en cas de conflit apparent, **ce README l’emporte** pour « ce qu’on fait maintenant » et « quand ».

---

## Hiérarchie des documents

| Document | Rôle |
|----------|------|
| **Ce README** | Timeline, état MVP, règles de priorité TanStack / auth / web–API. |
| [To-do.md](To-do.md) | Priorités opérationnelles (env, promotion, checklist). |
| [plan-initialisation-turborepo-mvp.md](plan-initialisation-turborepo-mvp.md) | Historique et checklists d’initialisation monorepo ; voir ici pour le **phasing** à jour. |
| [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | Parcours produit (MOC), sans stack imposée. |
| [dataflow-architecture.md](dataflow-architecture.md) | Vue dataflow **cible** multi-canal ; le MVP actuel est un sous-ensemble. |
| [proposition-stack-technique-monorepo-2026.md](proposition-stack-technique-monorepo-2026.md) | **Vision** v1+ (GraphQL, Prisma, packages `auth`, etc.) — **pas** la description du code présent aujourd’hui. |
| [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) | Convention déploiement par service + variables d’environnement (cible + instance). |
| [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) | Fait observé sur l’instance Dokploy (domaines, `API_URL`, Postgres, Agent/Indexer). |

---

## Timeline d’implémentation (ordre recommandé)

Les phases sont **séquentielles** sauf mention ; une phase peut commencer avant la fin absolue de la précédente pour des spikes courts, mais la **doc canonique** fixe l’ordre de priorité.

### Phase 0 — Socle monorepo et déploiement **Web + API** (référence : aujourd’hui)

- Monorepo **pnpm** + **Turborepo**, `apps/web` (Next.js App Router), `apps/api` (**Fastify**, REST, `/health`, `/feed` mock).
- `packages/types` et configs ESLint/TypeScript partagées.
- CI, Dockerfiles **web** et **api**, déploiement Dokploy pour Web/API, Postgres par environnement.
- **Hors périmètre actif** : `apps/agent`, `apps/indexer` (ressources Dokploy pouvant rester désactivées tant que le code n’existe pas — voir fiche instance).

**Livrable** : build vert, URLs Web/API par environnement, pas de dette documentaire sur « ce qui est mock ».

### Phase 1 — Couplage **Web ↔ API** et données serveur

- Brancher le **feed** (SSR ou route serveur) sur l’API via **`API_URL`** (déjà décrit pour Dokploy dans la fiche instance).
- Côté API : évolution du mock vers contrat stable (types partagés, éventuellement validation **zod**).
- **Pas d’obligation** TanStack à cette phase : `fetch` côté serveur Next suffit pour le SSR.

**Livrable** : page(s) consommant `/feed` de manière alignée avec la prod (même contrat).

### Phase 2 — **Auth** et premier parcours « demande d’aide »

- Choisir et documenter le mode d’auth (sessions cookies httpOnly, JWT, ou autre) dans une **ADR** ; variables type `JWT_SECRET` / `SESSION_SECRET` (matrice) deviennent **effectives** selon le choix.
- API : routes d’auth + persistance minimale (ou intégration progressive vers Postgres hors mock).
- Web : flux alignés avec le [MOC parcours utilisateur](moc-parcours-utilisateur.md).

**Livrable** : utilisateur peut s’authentifier et enclencher un parcours demande d’aide minimal bout-en-bout (même simplifié).

### Phase 3 — **TanStack Query** (client)

- Introduire **`@tanstack/react-query`** lorsque des **composants client** font des appels répétés à l’API (feed interactif, formulaires, invalidation après mutation).
- **Ne pas** imposer **TanStack Router** tant que le routage reste porté par **Next.js App Router** (complexité inutile pour le MVP).
- Documenter dans le code : `QueryClientProvider`, conventions de `queryKey`, gestion des cookies / credentials si auth cross-origin.

**Livrable** : couche client data homogène, tests de comportement sur au moins un flux critique.

### Phase 4 — Services **Agent**, **Indexer**, blockchain, files d’attente

- Aligné sur [dataflow-architecture.md](dataflow-architecture.md) et [proposition-stack-technique-monorepo-2026.md](proposition-stack-technique-monorepo-2026.md) : réactivation Dokploy, Redis/BullMQ, etc., selon besoins produit.

### Vision long terme (hors timeline MVP stricte)

- **GraphQL** BFF, **Prisma**, **Supabase**/Postgres unifié, packages `packages/auth`, `api-client`, etc. : décrits dans la **proposition stack 2026** ; migration progressive par ADR quand la Phase 2–3 est stable.

---

## État technique du dépôt (rappel)

| Zone | Aujourd’hui | Après Phase 1–3 (cible doc) |
|------|-------------|-----------------------------|
| `apps/api` | Fastify REST, mock | REST (+ auth), persistance |
| `apps/web` | Next, pages vitrine / health | SSR + client, puis Query si besoin client |
| Auth | Absente dans web/api monorepo | Phase 2 |
| TanStack | Non installé | Phase 3 (`react-query` si besoin) |
| `apps/thp-final` | Rails (Devise) — historique | Hors timeline du nouveau MVP JS sauf décision explicite de convergence |

---

## Règles pour les agents et contributeurs

1. Lire **ce README** avant d’implémenter une grosse fonctionnalité pour respecter l’ordre des phases.
2. Toute décision qui **contredit** la vision long terme ou **anticipe** une phase future : **ADR** dans le dépôt (dossier dédié ou `Docs/` selon convention d’équipe).
3. Mettre à jour **ce fichier** quand une phase est **terminée** ou quand la timeline change (date courte en tête de section concernée).

**Mise à jour canonique** : 2026-05-12.
