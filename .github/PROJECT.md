# GitHub Project — All-Aboard MVP

**Board** : [github.com/orgs/AllAboard-THP/projects/3](https://github.com/orgs/AllAboard-THP/projects/3)

Pilotage **tâches** (backlog, kanban 6 colonnes, roadmap, deps, vagues). **Architecture & produit** : [Docs/README.md](../Docs/README.md). **Doc de travail par issue** : [Docs/tasks/](../Docs/tasks/README.md).

---

## Champs Project

| Champ | Usage |
|-------|--------|
| **Status** | Triage → Todo → Ready → In Progress → Blocked → Done |
| **Pilier** | Frontend · Backend · Platform · Transverse |
| **Phase** | Aligné README MVP |
| **Priorité** | P0 → P3 |
| **Taille** | XS → XL |
| **Vague** | Lots parallèles (roadmap) |
| **Date début** / **Date cible** | Chevauchement = parallèle |

Configurer Roadmap : **group by Vague** ou **Pilier** ; deps = `blocked by` sur les issues.

---

## Board Status (Hermes-aligned)

| Colonne | Usage |
|---------|--------|
| Triage | Idée non spécifiée |
| Todo | Spécifié, pas prêt |
| Ready | Assigné, deps OK |
| In Progress | Dev actif |
| Blocked | Attente humaine |
| Done | Mergé / livré |

---

## Workflow issue → PR

1. Issue sur Project ; doc optionnelle dans `Docs/tasks/<NN>-slug/` ([convention](../Docs/tasks/README.md)).
2. `feat/<num>-slug` depuis `Dev` → PR → `pnpm verify` ([AGENTS.md](../AGENTS.md)).
3. Transverse Web/API : journal [plan opérationnel](../Docs/plan-mise-en-place-web-api-donnees.md).
4. ADR validé : `Docs/adr/` (brouillon dans `tasks/`).

---

## Vues recommandées

1. Board — Status  
2. Roadmap — group by **Vague**  
3. Table — Ready (tri Priorité)  
4. Table — Blocked  

---

## Scripts maintenance

```bash
.github/scripts/configure-project-status.sh
.github/scripts/configure-project-dependencies.sh
.github/scripts/enrich-issue-bodies.sh
```

---

## Labels

`type:epic` · `type:task` · `pilier:*` · `phase:*` · `priority:p*`

Templates : `.github/ISSUE_TEMPLATE/`
