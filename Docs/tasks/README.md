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
| [78-phase2b-responses/](78-phase2b-responses/) | [#78 Phase 2b Réponses MOC](https://github.com/AllAboard-THP/All-Aboard/issues/78) — thread API/BFF/UI (#79–#81) |
| [api-rails-parity-phase1/](api-rails-parity-phase1/) | Parité Rails **Phase 1** — feed/subjects/help-requests enrichis (API livré) |
| [api-rails-parity-phase2/](api-rails-parity-phase2/) | Parité Rails **Phase 2** — likes, bookmarks, `/me/*`, CRUD réponses (API livré) |
| [api-rails-parity-phase3/](api-rails-parity-phase3/) | Parité Rails **Phase 3** — auth register, profils, CGU |
| [api-rails-parity-phase4/](api-rails-parity-phase4/) | Parité Rails **Phase 4** — resources, subject requests, mentor dashboard |
| [api-rails-parity-phase5/](api-rails-parity-phase5/) | Parité Rails **Phase 5** — messagerie REST |
| [api-rails-parity-phase6/](api-rails-parity-phase6/) | Parité Rails **Phase 6** — admin & modération — ✅ livré |
| [api-rails-parity/](api-rails-parity/) | **Hub** parité Rails phases 1–7 + lots A / 5b / 7 |
| [api-parity-delete-reject/](api-parity-delete-reject/) | Lot A — soft delete post + reject resource mentor (OpenAPI 0.8.1) |
| [api-rails-parity-phase5b/](api-rails-parity-phase5b/) | Phase 5b — chat WebSocket (OpenAPI 0.9.0) |
| [api-rails-parity-phase7/](api-rails-parity-phase7/) | Phase 7 — suggest-tags + `ai_summary` (OpenAPI 0.10.0) |

*(Ajouter une ligne ici à la création d’un nouveau dossier — une ligne par PR, conflits rares.)*

---

## Liens

- [Pilotage Project (.github/PROJECT.md)](../../.github/PROJECT.md)
- [Map of content](../map-of-content.md)
