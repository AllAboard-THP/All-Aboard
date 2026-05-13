# GitHub Project — All-Aboard MVP

**Board** : [github.com/orgs/AllAboard-THP/projects/3](https://github.com/orgs/AllAboard-THP/projects/3)

Ce document décrit l’organisation du projet GitHub pour l’équipe All-Aboard (3 développeurs + agents). La **timeline produit** reste dans [Docs/README.md](../Docs/README.md).

---

## Structure du Project

| Élément | Détail |
|---------|--------|
| **Nom** | All-Aboard MVP |
| **Owner** | Organisation `AllAboard-THP` |
| **Repo lié** | [AllAboard-THP/All-Aboard](https://github.com/AllAboard-THP/All-Aboard) |
| **Visibilité** | Privé (org) |

### Champs personnalisés

| Champ | Usage |
|-------|--------|
| **Status** | Workflow kanban **6 colonnes** (aligné Hermes Kanban — voir ci-dessous) |
| **Pilier** | `Frontend` · `Backend` · `Platform` · `Transverse` |
| **Phase** | Aligné sur la doc MVP (Phase 0–4 + Ops) |
| **Priorité** | P0 (bloquant) → P3 (basse) |
| **Taille** | XS → XL (estimation relative) |

### Board — colonnes Status (validé)

Inspiré du [Kanban Hermes](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/kanban-tutorial.md) (6 colonnes). Adapté à une équipe humaine + agents sur GitHub Issues.

| Colonne | Rôle | Quand l'utiliser |
|---------|------|------------------|
| **Triage** | Idées brutes, à spécifier | Nouvelle idée sans critères d'acceptation ; besoin d'un epic ou d'une spec |
| **Todo** | Backlog spécifié | Issue template rempli, dépendances non levées, ou pas encore assignée |
| **Ready** | Prêt à démarrer | Assignée + dépendances OK + critères clairs — peut être prise immédiatement |
| **In Progress** | En cours | Branche ouverte, dev actif |
| **Blocked** | Bloqué | Attente humaine : ADR, accès Dokploy, review, clarification produit |
| **Done** | Terminé | PR mergée sur `Dev` (ou livré si ops sans PR) |

**Différences vs Hermes** : pas de dispatcher automatique ni bouton « Specify » intégré — la promotion Triage → Todo est manuelle (ou via agent + template issue). Le reste du flux est volontairement identique pour faciliter le travail mixte humain / agent.

**Transitions typiques**

```text
Triage → Todo → Ready → In Progress → Done
                              ↓
                          Blocked → (débloqué) → In Progress
```

**Règles équipe**

1. Ne pas mettre en **Ready** sans assignee (ou pilier clair).
2. **In Progress** = une personne, une issue (WIP limit implicite 1–2 par dev).
3. **Blocked** : commenter l'issue avec la question / le bloqueur.
4. Epics restent en **Todo** tant que des enfants sont ouverts.

### Labels dépôt (miroir)

- `type:epic` · `type:task` · `type:adr` · `type:spike`
- `pilier:frontend` · `pilier:backend` · `pilier:platform` · `pilier:transverse`
- `phase:2` · `phase:3` · `phase:4` · `phase:ops`
- `priority:p0` … `priority:p3`

---

## Répartition équipe (3 dev)

| Pilier | Responsable suggéré | Epics / issues |
|--------|---------------------|----------------|
| **Frontend** | Dev UI/UX | #15, #24–30, #36 |
| **Backend** | Dev API | #16, #18–23 |
| **Platform** | Dev infra / intégration | #17, #31–35, #37 |

Epic transverse Phase 2 : **#13** (parent du lot auth + parcours).

### Ordre de démarrage recommandé

1. **#18** ADR auth (bloquant)
2. **#33** Postgres dev + **#19** feed réel (backend)
3. **#24** design system + **#25** shell (frontend, en parallèle)
4. **#31–32** checklist staging (platform, en parallèle)

---

## Vues recommandées (Project UI)

1. **Board — Status** (vue principale) : 6 colonnes Triage → Done
2. **Board — Pilier** : sous-groupes Frontend / Backend / Platform dans **In Progress**
3. **Table — Ready** : filtre `Status = Ready`, tri **Priorité** (file d'attente par dev)
4. **Table — Blocked** : filtre `Status = Blocked` (stand-up / déblocage)
5. **Table — Phase 2** : filtre `Phase = Phase 2 — Auth & parcours`
6. **Table — Ops** : filtre `Phase = Ops — Staging/Release`

---

## Workflow issue → PR

1. **Triage** : idée → compléter le template → passer en **Todo**
2. Assigner + lever dépendances → **Ready**
3. Prendre l'issue → **In Progress** ; branche `feat/<num>-court-sujet` depuis `Dev`
4. PR vers `Dev` ; `Closes #NN` ou `Refs #NN` ; `pnpm verify` (voir [AGENTS.md](../AGENTS.md))
5. Bloqué ? → **Blocked** + commentaire explicite
6. Merge → **Done**

### Definition of Done (tâche)

- CI verte sur la PR
- Champs Project à jour (Pilier, Phase, Priorité, Taille)
- Si changement Web/API transverse : journal dans [plan-mise-en-place-web-api-donnees.md](../Docs/plan-mise-en-place-web-api-donnees.md)

---

## Créer une nouvelle issue

- **Template** : `.github/ISSUE_TEMPLATE/task.yml` ou `epic.yml`
- Ajouter au Project : bouton **Projects** sur l’issue ou `gh project item-add 3 --owner AllAboard-THP --url <issue-url>`
- Renseigner les 4 champs custom

### Re-bootstrap (maintenance)

Script idempotent partiel (ne recrée pas les epics existants) :

```bash
.github/scripts/setup-project-items.sh
```

Nécessite `gh` avec scope `project` (`gh auth switch` compte ayant le scope).

---

## Inventaire initial (2026-05-13)

| # | Titre | Pilier |
|---|-------|--------|
| 13 | [Epic] Phase 2 — Auth & parcours | Transverse |
| 15 | [Epic] Frontend — UI/UX | Frontend |
| 16 | [Epic] Backend — API | Backend |
| 17 | [Epic] Platform — Staging | Platform |
| 18–23 | Tâches backend / ADR | Backend / Transverse |
| 24–30 | Tâches frontend | Frontend |
| 31–35 | Tâches ops | Platform |
| 36 | TanStack hors home | Frontend |
| 37 | [Epic] Phase 4 Agent/Indexer | Platform |

---

## Liens utiles

- [Docs/README.md](../Docs/README.md) — timeline MVP
- [Docs/To-do.md](../Docs/To-do.md) — promotion staging
- [Docs/map-of-content.md](../Docs/map-of-content.md) — cartographie doc
- [Dokploy instance](../Docs/deploiement-dokploy-instance-allaboard.md)
