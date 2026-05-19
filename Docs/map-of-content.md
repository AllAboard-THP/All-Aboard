# Map of content (MoC) — documentation All-Aboard

**Objectif** : une **source canonique** par sujet ; les autres fichiers **renvoient** ou complètent sans dupliquer la vérité opérationnelle.

**Mise à jour** : 2026-05-19 (audit kit UX **v1.7** ; plan intégration kit UX **v2.2**).

---

## 1. Inventaire des fichiers `Docs/`

| Fichier | Rôle (une phrase) |
|---------|-------------------|
| [README.md](README.md) | Point d’entrée : timeline MVP, état du dépôt, principes web/API/TanStack, hiérarchie des liens. |
| [map-of-content.md](map-of-content.md) | **Ce fichier** : MoC, graphe des liens, règles de maintenance. |
| [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) | Référence **Web ↔ API** : variables d’env, contrat `GET /feed`, chemins code, journal smoke, checklist Dokploy ciblée feed. |
| [To-do.md](To-do.md) | Actions **prioritaires** et promotion dev → staging (pas la timeline détaillée). |
| [plan-initialisation-turborepo-mvp.md](plan-initialisation-turborepo-mvp.md) | **Stub** post-bootstrap ; détail historique dans [archive/](archive/). |
| [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) | **Conventions** déploiement (services, ports, tables de variables par type). |
| [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) | **Faits observés** sur l’instance Dokploy (domaines, branches, `API_URL`, statut Agent/Indexer). |
| [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | MOC **produit** (parcours utilisateur), sans stack imposée. |
| [dataflow-architecture.md](dataflow-architecture.md) | Dataflow **cible** multi-services (vision). |
| [proposition-stack-technique-monorepo-2026.md](proposition-stack-technique-monorepo-2026.md) | Vision **stack v1+** (GraphQL, Prisma, etc.) — pas l’état du code MVP. |
| [vision/README.md](vision/README.md) | Index court des docs vision (liens vers proposition + dataflow). |
| [audit-integration-kit-ux-allaboard.md](audit-integration-kit-ux-allaboard.md) | **Audit** kit UX (**v1.7**) : inventaire **§8**, phasage, risques, **§11** ; mise en page GitHub. Exécution : [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md). Complète [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md). |
| [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md) | **Plan d’intégration** kit UX (**v2.2** — gate **L** validation locale pré-PR [§2.8](plan-integration-kit-ux-allaboard.md#validation-locale-avant-pr), **§0** chemin autonome, **§2.7** motion, **D7**, **D4**, **G0/G1**, phases **0–4**, **V/T/M/S/P**, Storybook, shadcn) ; inventaire [audit](audit-integration-kit-ux-allaboard.md) §8. |
| [procedure-tailwind-apps-web.md](procedure-tailwind-apps-web.md) | **Procédure Tailwind** `apps/web` : chaîne CSS, workflow, shadcn, Storybook, règles, migration v4. |
| [tokens-kit-web.md](tokens-kit-web.md) | Table token → CSS → classe (complète la procédure). |

Racine dépôt : [AGENTS.md](../AGENTS.md) (protocole PR / `pnpm verify`) ; [README.md](../README.md) racine si présent pour dev local — la **doc produit/architecture** canonique reste sous `Docs/`.

---

## 2. Graphe des liens (aperçu)

Flux principal (star vers README + plan opérationnel) :

```text
README.md ──┬──► plan-mise-en-place-web-api-donnees.md
            ├──► audit-integration-kit-ux-allaboard.md (kit UX / design system)
            ├──► plan-integration-kit-ux-allaboard.md (plan intégration + backlog)
            ├──► To-do.md
            ├──► matrice ──► deploiement-instance
            ├──► moc-parcours-utilisateur.md
            ├──► dataflow / proposition (vision)
            └──► map-of-content.md (ce fichier)

plan-mise-en-place ──► README, deploiement-instance, matrice, AGENTS

deploiement-instance ──► matrice (théorie), README, plan-mise-en-place (journal)

matrice ──► README, deploiement-instance
```

**Boucles** : README ↔ plan-mise-en-place (normal : timeline vs détail technique). Éviter d’ajouter une **troisième** copie de la même timeline dans d’autres fichiers — renvoyer vers README.

**Doublons sémantiques à éviter** : même tableau « état du dépôt » (un seul : README) ; même liste d’étapes bootstrap (stub + archive) ; tables **variables génériques** uniquement dans la **matrice**, valeurs **instance** (domaines, noms internes) uniquement dans **deploiement-instance**.

---

## 3. Table sujet → source canonique → renvois

| Sujet | Canonique | Les autres fichiers doivent… |
|-------|-----------|------------------------------|
| Timeline MVP, phases 0–4, « où en est le projet » | [README.md](README.md) | Renvoyer par lien ; pas de second tableau « aujourd’hui » contradictoire. |
| Variables `API_URL`, BFF `/api/feed`, contrat `/feed`, chemins code, journal smoke | [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) | Renvoyer ; pas de redefinition longue des conventions TanStack. |
| Tables variables par service (JWT, CORS, etc.) | [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) | Instance : ne pas recopier les grilles ; décrire faits + exceptions (ex. BFF). |
| Domaines, branches Git services, statut Dokploy, `API_URL` interne observé | [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) | Matrice : renvoi « détail instance » ; pas de liste de domaines dans la matrice. |
| Parcours utilisateur produit | [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | README Phase 2 : lien uniquement. |
| Architecture / stack long terme | [vision/README.md](vision/README.md) → proposition + dataflow | README « Vision long terme » : liens courts. |
| Actions prioritaires, promotion env | [To-do.md](To-do.md) | Ne pas dupliquer la timeline ; lien README. |
| Bootstrap Turborepo historique | [archive/plan-initialisation-turborepo-mvp-2026-01.md](archive/plan-initialisation-turborepo-mvp-2026-01.md) | Stub [plan-initialisation-turborepo-mvp.md](plan-initialisation-turborepo-mvp.md). |
| Protocole agent / CI locale | [AGENTS.md](../AGENTS.md) | Docs : mentionner `pnpm verify` seulement en renvoi. |
| Kit UX / design system (tokens, primitives, phasage) | [audit-integration-kit-ux-allaboard.md](audit-integration-kit-ux-allaboard.md) | **Audit §8** = inventaire ; [plan](plan-integration-kit-ux-allaboard.md) = tâches & tests. moc-parcours : parcours produit uniquement. |
| Plan d’intégration kit UX (phases, tests, merge) | [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md) | Audit **v1.7** §8 ; plan **v2.2** (gate **L** §2.8 pré-PR, §0 autonome, §2.7 motion, D7, D4 Playwright, G0/G1, phases 0–4, Storybook, shadcn, `apps/web`). |
| Validation locale pré-PR (kit UX) | [plan-integration-kit-ux-allaboard.md §2.8](plan-integration-kit-ux-allaboard.md#validation-locale-avant-pr) | **V** + **T** + **P** en local avant PR ; `push` sur `feature/*` ne déclenche pas la CI — renvoi plan, pas de troisième copie des commandes. |
| Procédure Tailwind (`apps/web`) | [procedure-tailwind-apps-web.md](procedure-tailwind-apps-web.md) | Plan §14 + [tokens-kit-web.md](tokens-kit-web.md) ; README `apps/web` : renvoi court. |

---

## 4. Règles de maintenance

1. **`API_URL` ou domaines Dokploy changent** : éditer d’abord [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) ; puis une ligne dans le *Journal* de [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) si impact smoke Web/API.
2. **Nouvelle variable d’environnement** (tous services) : ajouter ou mettre à jour la **matrice** ; l’instance ne liste pas les secrets — seulement les clés pertinentes côté observé.
3. **Contrat `GET /feed` ou chemins fichier web** : [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) + code ; mettre à jour le README seulement si la **phase** ou l’état MVP change.
4. **Phase terminée** : mettre à jour [README.md](README.md) (timeline + tableau d’état) et [To-do.md](To-do.md) ; éviter les cases à cocher fantômes ailleurs.
5. **Nouveau document dans `Docs/`** : ajouter une ligne au tableau §1 et une ligne à la table §3 (ou extension d’une ligne existante).

---

## Liens rapides

- [README — canonique](README.md)
- [Plan Web / API / données](plan-mise-en-place-web-api-donnees.md)
- [Matrice déploiement](matrice-deploiement-dokploy-coolify.md) · [Instance Dokploy](deploiement-dokploy-instance-allaboard.md)
