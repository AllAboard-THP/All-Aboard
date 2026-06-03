# Tâche #37 — Phase 4 Agent All-Aboard & Intuition

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/37

## Objectif

Cadrer le backlog long terme **`apps/agent` (agent All-Aboard) + handoff Rubberduck (externe) + intégration Intuition** sans implémenter dans le MVP Phase 2 : ADR architecture, sous-tâches GitHub, statut epic ouvert en Triage.

**Rubberduck** n’est pas `apps/agent` : service IA géré par une autre équipe ; All-Aboard redirige l’utilisateur pour certaines demandes. **`apps/agent`** orchestre l’IA in-app et la décision de handoff.

## Livrables (cadrage)

| Livrable | Fichier / artefact |
|----------|-------------------|
| ADR Phase 4 | [Docs/adr/0004-agent-indexer-architecture.md](../../adr/0004-agent-indexer-architecture.md) |
| Sous-tâches backlog | Issues #66–#69 (enfants #37) |

## Sous-tâches

| Issue | Titre | Statut |
|-------|-------|--------|
| [#66](https://github.com/AllAboard-THP/All-Aboard/issues/66) | Scaffold `apps/agent` (healthcheck, stubs agent + handoff) | Livré — [`apps/agent`](../../../apps/agent/README.md) |
| [#67](https://github.com/AllAboard-THP/All-Aboard/issues/67) | Bridge Intuition (publisher outbox + GraphQL) | Livré — [README](../67-intuition-bridge/README.md), [spike GraphQL](./intuition-graphql-spike.md) |
| [#68](https://github.com/AllAboard-THP/All-Aboard/issues/68) | Intégration API — handoff Rubberduck via agent | Triage — dépend #66 |
| [#69](https://github.com/AllAboard-THP/All-Aboard/issues/69) | CI/Dokploy Agent + retrait placeholder Indexer | Triage — dépend #66 |

## Décision architecture (2026-05-27)

- **Indexer** = infra **Intuition** (subnet + GraphQL) — pas de `apps/indexer` maison.
- All-Aboard développe un **bridge publisher** (#67) : outbox Postgres → SDK Intuition ; lecture via GraphQL Intuition.
- `infra/docker/Dockerfile.indexer` et service Dokploy « Indexer » = **legacy** — à retirer, ne pas réactiver.

## Décision architecture (2026-06-02)

- **`apps/agent`** = agent IA **All-Aboard** (réponses in-app, orchestration).
- **Rubberduck** = produit **externe** ; `POST /routing/evaluate` → `suggestRubberduckRedirect` (pas de route respond sur l’agent).

## État actuel (Phase 2)

- **Stub handoff Rubberduck** : `POST /help-requests` renvoie `hints.rubberduckEligible` si titre ≤ 6 mots ([`apps/api/src/app.ts`](../../../apps/api/src/app.ts)).
- **UI** : message stub dans [`help-request-form.tsx`](../../../apps/web/components/features/help-request-form.tsx).
- **`apps/agent`** : scaffold livré (#66) ; service Dokploy Agent **désactivé** jusqu’à #69.
- **Intuition** : aucune intégration code ; index doc dans [`intuition-documentation-index.md`](../../intuition-documentation-index.md).

## Critères de clôture cadrage (#37 — partial)

- [x] ADR 0004 rédigé
- [x] ADR révisé — indexer Intuition, pas `apps/indexer`
- [x] ADR 0004 accepté (2026-06-01) — implémentation #66–#69 débloquée
- [x] ADR révisé (2026-06-02) — `apps/agent` distinct de Rubberduck
- [x] Sous-issues backlog créées et liées dans #37
- [ ] Implémentation (#66–#69) — **hors scope** de ce cadrage ; epic #37 reste ouverte

## Doc canonique (lecture)

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [Parcours MOC](../../moc-parcours-utilisateur.md)
- [Dataflow cible](../../dataflow-architecture.md)
- [Index doc Intuition](../../intuition-documentation-index.md)
- [Instance Dokploy — Agent/Indexer legacy](../../deploiement-dokploy-instance-allaboard.md)
