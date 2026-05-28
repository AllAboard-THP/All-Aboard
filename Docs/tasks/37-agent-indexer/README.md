# Tâche #37 — Phase 4 Agent Rubberduck & Intuition

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/37

## Objectif

Cadrer le backlog long terme **Agent Rubberduck + intégration Intuition** sans implémenter dans le MVP Phase 2 : ADR architecture, sous-tâches GitHub, statut epic ouvert en Triage.

## Livrables (cadrage)

| Livrable | Fichier / artefact |
|----------|-------------------|
| ADR Phase 4 | [Docs/adr/0004-agent-indexer-architecture.md](../../adr/0004-agent-indexer-architecture.md) |
| Sous-tâches backlog | Issues #66–#69 (enfants #37) |

## Sous-tâches

| Issue | Titre | Statut |
|-------|-------|--------|
| [#66](https://github.com/AllAboard-THP/All-Aboard/issues/66) | Scaffold `apps/agent` (healthcheck, stub LLM) | Triage — pas de dev immédiat |
| [#67](https://github.com/AllAboard-THP/All-Aboard/issues/67) | Bridge Intuition (publisher outbox + GraphQL) | Triage |
| [#68](https://github.com/AllAboard-THP/All-Aboard/issues/68) | Intégration API — remplacer heuristique Rubberduck | Triage — dépend #66 |
| [#69](https://github.com/AllAboard-THP/All-Aboard/issues/69) | CI/Dokploy Agent + retrait placeholder Indexer | Triage — dépend #66 |

## Décision architecture (2026-05-27)

- **Indexer** = infra **Intuition** (subnet + GraphQL) — pas de `apps/indexer` maison.
- All-Aboard développe un **bridge publisher** (#67) : outbox Postgres → SDK Intuition ; lecture via GraphQL Intuition.
- `infra/docker/Dockerfile.indexer` et service Dokploy « Indexer » = **legacy** — à retirer, ne pas réactiver.

## État actuel (Phase 2)

- **Stub Rubberduck** : `POST /help-requests` renvoie `hints.rubberduckEligible` si titre ≤ 6 mots ([`apps/api/src/app.ts`](../../../apps/api/src/app.ts)).
- **UI** : message stub dans [`help-request-form.tsx`](../../../apps/web/components/features/help-request-form.tsx).
- **`apps/agent`** : absent ; service Dokploy Agent **désactivé**.
- **Intuition** : aucune intégration code ; index doc dans [`intuition-documentation-index.md`](../../intuition-documentation-index.md).

## Critères de clôture cadrage (#37 — partial)

- [x] ADR 0004 rédigé
- [x] ADR révisé — indexer Intuition, pas `apps/indexer`
- [x] Sous-issues backlog créées et liées dans #37
- [ ] Implémentation (#66–#69) — **hors scope** de ce cadrage ; epic #37 reste ouverte

## Doc canonique (lecture)

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [Parcours MOC](../../moc-parcours-utilisateur.md)
- [Dataflow cible](../../dataflow-architecture.md)
- [Index doc Intuition](../../intuition-documentation-index.md)
- [Instance Dokploy — Agent/Indexer legacy](../../deploiement-dokploy-instance-allaboard.md)
