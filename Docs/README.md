# Documentation All-Aboard — point d'entrée canonique

Référence **architecture et produit** du dépôt. Le **pilotage des tâches** (backlog, kanban, roadmap, deps) vit sur le [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3) — ne pas dupliquer ici.

**Cartographie** : [map-of-content.md](map-of-content.md) · **Doc par issue** : [tasks/README.md](tasks/README.md) · **Pilotage** : [.github/PROJECT.md](../.github/PROJECT.md)

**Priorité en cas de doute** : cohérence d'ingénierie (contrat API, SSR/BFF) — [Principes](#principes-pour-limiter-le-rework) et [plan opérationnel](plan-mise-en-place-web-api-donnees.md).

**Livré** (2026-05-12) : feed SSR `API_URL`, TanStack home, BFF `/api/feed` — [journal](plan-mise-en-place-web-api-donnees.md). **Extension 2026-05-20** : Phase 2 MVP (Postgres, auth JWT, création demande, BFF, ADR 0001) — même plan et [ADR](adr/0001-authentication-strategy.md).

---

## Hiérarchie des documents

| Document | Rôle |
|----------|------|
| **Ce README** | Phases MVP, état code, principes transverses. |
| [map-of-content.md](map-of-content.md) | MoC : sujet → source canonique. |
| [tasks/README.md](tasks/README.md) | Doc **par issue** (`Docs/tasks/<NN>-slug/`). |
| [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) | Web ↔ API : env, `/feed`, chemins code, journal smoke. |
| [runbook-dokploy-dev-phase2.md](runbook-dokploy-dev-phase2.md) | Checklist manuelle Dokploy **dev** (Postgres, secrets, smoke). |
| [adr/](adr/) | Décisions d'architecture ; ex. [0001-authentication-strategy.md](adr/0001-authentication-strategy.md), [0002 design system](adr/0002-design-system-monorepo.md). |
| [design-system/](design-system/README.md) | **Hub DS** (Diátaxis) : architecture, guide contributeur, CI, AppShell, journal. |
| [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | Parcours produit (MOC). |
| [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) | Variables déploiement (générique). |
| [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) | Faits instance Dokploy. |
| [vision/README.md](vision/README.md) | Stack / dataflow cible (hors MVP code). |
| [plan-initialisation-turborepo-mvp.md](plan-initialisation-turborepo-mvp.md) | Stub bootstrap ; [archive](archive/plan-initialisation-turborepo-mvp-2026-01.md). |

**Tâches & priorités** : [GitHub Project](https://github.com/orgs/AllAboard-THP/projects/3) — pas de liste détaillée dans `Docs/`.

---

## Principes pour limiter le rework

1. **Contrat partagé** : `packages/types` + API ; une PR transverse = api + types + web + tests.
2. **SSR** via `API_URL` interne ; feed client via **BFF** `/api/feed` (same-origin).
3. **TanStack Query** : couche client ; socle livré avec le feed ([plan opérationnel](plan-mise-en-place-web-api-donnees.md)).
4. **`NEXT_PUBLIC_*`** uniquement si le navigateur appelle l'API en direct.

---

## Timeline (phases)

| Phase | État | Référence travail |
|-------|------|-------------------|
| 0 — Socle monorepo, Web/API, Dokploy | Livré | plan opérationnel (journal) |
| 1 — Feed SSR + types | Livré | idem |
| 2 — Auth + parcours demande d'aide | **Livré** (MVP dépôt ; durcissement / staging à suivre) | [ADR 0001](adr/0001-authentication-strategy.md), [MOC](moc-parcours-utilisateur.md), epic [#13](https://github.com/AllAboard-THP/All-Aboard/issues/13) |
| 3 — TanStack hors home | Partiel (home OK) | [#36](https://github.com/AllAboard-THP/All-Aboard/issues/36) |
| 4 — Design system + shell navigation | **Livré** (dépôt) | [design-system/](design-system/README.md), [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24), [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25) |
| 5 — Agent / Indexer | Backlog | [#37](https://github.com/AllAboard-THP/All-Aboard/issues/37), [vision](vision/README.md) |

---

## État technique du dépôt

| Zone | État |
|------|------|
| `apps/api` | Fastify : `/health`, Postgres + Drizzle, `GET /feed`, `POST /auth/login`, `POST /help-requests` (JWT), stubs doublon / Rubberduck ; migrations au démarrage. |
| `apps/web` | SSR feed ; BFF ; `/help/new` ; **AppShell** (`app/(app)/`, nav MOC) — [app-shell.md](design-system/app-shell.md) ; `@allaboard/ui` + features/blocks. |
| `packages/ui` + `apps/storybook` | Design system + catalogue SB — [design-system/README.md](design-system/README.md). |
| Auth | JWT (cookie `access_token` + relais BFF Bearer) — [ADR 0001](adr/0001-authentication-strategy.md). Login MVP par `MVP_LOGIN_PASSWORD`. |
| TanStack | Socle + usage home sur le feed — extension **Phase 3 résiduelle**. |
| `apps/thp-final` | Rails historique — hors MVP JS sauf décision explicite. |

---

## Règles contributeurs

1. Évolution **transverse** Web/API : lire ce README + plan opérationnel ; mettre à jour le *Journal* si smoke/contrat change.
2. Évolution **une tâche** : doc dans `Docs/tasks/<NN>-slug/` ; lien dans l'issue GitHub.
3. Décision archi **validée** : `Docs/adr/` (brouillon dans `tasks/`).
4. Phase **terminée** : mettre à jour le tableau ci-dessus (date en tête de section si besoin).

**Mise à jour** : 2026-05-20.
