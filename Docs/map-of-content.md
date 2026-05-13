# Map of content (MoC) — documentation All-Aboard

**Objectif** : une **source canonique** par sujet ; pas de doublon avec le [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3).

**Mise à jour** : 2026-05-13.

---

## 1. Inventaire `Docs/`

| Fichier / dossier | Rôle |
|-------------------|------|
| [README.md](README.md) | Phases MVP, état code, principes transverses. |
| [map-of-content.md](map-of-content.md) | **Ce fichier**. |
| [tasks/](tasks/README.md) | Doc **par issue** — `Docs/tasks/<NN>-slug/`. |
| [adr/](adr/README.md) | ADR validés (post-merge). |
| [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) | Web ↔ API transverse : env, `/feed`, journal. |
| [To-do.md](To-do.md) | **Stub** → Project GitHub (plus de checklist locale). |
| [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | Parcours produit. |
| [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md) | Variables déploiement génériques. |
| [deploiement-dokploy-instance-allaboard.md](deploiement-dokploy-instance-allaboard.md) | Faits instance Dokploy. |
| [vision/](vision/README.md) | Stack / dataflow cible. |
| [plan-initialisation-turborepo-mvp.md](plan-initialisation-turborepo-mvp.md) + [archive/](archive/) | Bootstrap historique. |

Hors `Docs/` : [AGENTS.md](../AGENTS.md), [.github/PROJECT.md](../.github/PROJECT.md), [README.md](../README.md) racine.

---

## 2. Sujet → source canonique

| Sujet | Canonique | Autres fichiers |
|-------|-----------|-----------------|
| Backlog, priorités, deps, roadmap, checklist staging | [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3) | To-do.md = lien ; pas de liste dans Docs/ |
| Workflow kanban / champs Project | [.github/PROJECT.md](../.github/PROJECT.md) | — |
| Doc notes d’**une** tâche en cours | `Docs/tasks/<NN>-slug/` | Issue GitHub liée |
| ADR validé | `Docs/adr/` | Brouillon dans `tasks/` |
| Phases MVP, état code, principes | [README.md](README.md) | — |
| Contrat `/feed`, env, journal smoke | [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) | — |
| Variables déploiement | [matrice](matrice-deploiement-dokploy-coolify.md) | [instance](deploiement-dokploy-instance-allaboard.md) |
| Parcours produit | [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) | — |
| Vision long terme | [vision/README.md](vision/README.md) | — |

---

## 3. Règles de maintenance

1. **Nouvelle tâche avec doc** : créer `Docs/tasks/<NN>-slug/` ; une ligne dans [tasks/README.md](tasks/README.md) index ; lien dans l’issue.
2. **Contrat Web/API ou smoke** : [plan-mise-en-place](plan-mise-en-place-web-api-donnees.md) + code ; pas dans `tasks/` sauf spike lié à une issue.
3. **Dokploy / domaines** : [instance](deploiement-dokploy-instance-allaboard.md) puis journal plan si impact smoke.
4. **Phase terminée** : tableau phases dans [README.md](README.md) uniquement.
5. **Ne pas** recréer listes de tâches ou inventaires d’issues dans `Docs/` — le Project est la vérité.

---

## Liens rapides

- [README](README.md) · [tasks/](tasks/README.md) · [Project #3](https://github.com/orgs/AllAboard-THP/projects/3) · [Plan Web/API](plan-mise-en-place-web-api-donnees.md)
