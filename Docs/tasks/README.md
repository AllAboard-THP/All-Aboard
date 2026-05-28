# Documentation par tâche (`Docs/tasks/`)

**Backlog, priorités, dépendances, roadmap** : source canonique = [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3) (issues + champs Vague / Status). Ne pas recopier ces listes dans `Docs/`.

Ce dossier accueille la **doc de travail liée à une issue** — notes, spikes, brouillons ADR, captures — **isolée par numéro d’issue** pour limiter les conflits de merge entre collaborateurs.

---

## Convention de nommage

```text
Docs/tasks/<NN>-<slug-court>/
```

| Élément | Règle | Exemple |
|---------|--------|---------|
| `NN` | Numéro d’issue GitHub | `18` |
| `slug` | kebab-case, 2–4 mots | `adr-auth` |
| Dossier | `Docs/tasks/18-adr-auth/` | |

Chaque dossier contient au minimum un **`README.md`** avec :

- lien vers l’issue : `https://github.com/AllAboard-THP/All-Aboard/issues/<NN>`
- objectif en une phrase (copie ou résumé de l’issue)
- fichiers du dossier listés

Modèle vierge : [_template/README.md](_template/README.md).

---

## Où écrire quoi

| Contenu | Emplacement |
|---------|-------------|
| Checklist tâche, statut, assignation, deps | **Issue GitHub** + Project |
| Notes / brouillons / spec détaillée **d’une** tâche | `Docs/tasks/<NN>-<slug>/` |
| Décision d’architecture **validée** (ADR final) | `Docs/adr/` (après merge PR) — brouillon peut rester dans `tasks/` |
| Contrat API, env, journal smoke **transverse** | [plan-mise-en-place-web-api-donnees.md](../plan-mise-en-place-web-api-donnees.md) |
| Timeline phases, principes MVP | [README.md](../README.md) |
| Parcours produit (MOC) | [moc-parcours-utilisateur.md](../moc-parcours-utilisateur.md) |
| Design system (hub contributeur) | [design-system/README.md](../design-system/README.md) |
| Infra Dokploy (faits instance) | [deploiement-dokploy-instance-allaboard.md](../deploiement-dokploy-instance-allaboard.md) |

---

## Workflow collaborateur

1. Prendre une issue sur le [Project](https://github.com/orgs/AllAboard-THP/projects/3) → **In Progress**.
2. Créer `Docs/tasks/<NN>-<slug>/` si besoin de doc (copier `_template/`).
3. Dans l’issue : section **Documentation** → ajouter le lien vers `Docs/tasks/<NN>-<slug>/`.
4. Dans le `README.md` du dossier : lien retour vers l’issue.
5. PR : `Refs #NN` ; doc transverse seulement si contrat Web/API change.

**Ne pas** éditer le même fichier `Docs/` partagé que d’autres tâches en parallèle — utiliser le sous-dossier dédié.

---

## Index des dossiers tâche

| Dossier | Issue |
|---------|-------|
| [18-adr-auth/](18-adr-auth/) | [#18 ADR auth](https://github.com/AllAboard-THP/All-Aboard/issues/18) |
| [24-design-system-monorepo/](24-design-system-monorepo/) | [#24 Design system](https://github.com/AllAboard-THP/All-Aboard/issues/24) — ✅ livré |
| [25-app-shell-navigation/](25-app-shell-navigation/) | [#25 AppShell](https://github.com/AllAboard-THP/All-Aboard/issues/25) — ✅ livré |
| [49-openapi/](49-openapi/) | [#49 OpenAPI](https://github.com/AllAboard-THP/All-Aboard/issues/49) — ✅ livré (spike + spec MVP) |
| [37-agent-indexer/](37-agent-indexer/) | [#37 Phase 4 Agent/Intuition](https://github.com/AllAboard-THP/All-Aboard/issues/37) — ADR 0004 (indexer Intuition + bridge #67) |

*(Ajouter une ligne ici à la création d’un nouveau dossier — une ligne par PR, conflits rares.)*

---

## Liens

- [Pilotage Project (.github/PROJECT.md)](../../.github/PROJECT.md)
- [Map of content](../map-of-content.md)
