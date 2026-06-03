# Tâche #37 — Phase 4 Agent All-Aboard & Intuition

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/37

## Objectif

Cadrer et livrer le backlog Phase 4 **`apps/agent` (agent All-Aboard) + handoff Rubberduck (externe) + intégration Intuition** : ADR architecture, sous-tâches #66–#69, implémentation MVP merge sur `Dev` (2026-06-03).

**Rubberduck** n’est pas `apps/agent` : service IA géré par une autre équipe ; All-Aboard redirige l’utilisateur pour certaines demandes. **`apps/agent`** orchestre l’IA in-app et la décision de handoff.

## Livrables (cadrage)

| Livrable | Fichier / artefact |
|----------|-------------------|
| ADR Phase 4 | [Docs/adr/0004-agent-indexer-architecture.md](../../adr/0004-agent-indexer-architecture.md) |
| Sous-tâches backlog | Issues #66–#69 (enfants #37) |

## Sous-tâches

| Issue | Titre | PR | Statut |
|-------|-------|-----|--------|
| [#66](https://github.com/AllAboard-THP/All-Aboard/issues/66) | Scaffold `apps/agent` (healthcheck, stubs agent + handoff) | [#93](https://github.com/AllAboard-THP/All-Aboard/pull/93) | Livré — [`apps/agent`](../../../apps/agent/README.md) |
| [#67](https://github.com/AllAboard-THP/All-Aboard/issues/67) | Bridge Intuition (publisher outbox + GraphQL) | [#94](https://github.com/AllAboard-THP/All-Aboard/pull/94) | Livré — [README](../67-intuition-bridge/README.md), [spike GraphQL](./intuition-graphql-spike.md) |
| [#68](https://github.com/AllAboard-THP/All-Aboard/issues/68) | Intégration API — handoff Rubberduck via agent | [#95](https://github.com/AllAboard-THP/All-Aboard/pull/95) | Livré — [README](../68-agent-handoff/README.md) |
| [#69](https://github.com/AllAboard-THP/All-Aboard/issues/69) | CI/Dokploy Agent + retrait placeholder Indexer | [#96](https://github.com/AllAboard-THP/All-Aboard/pull/96) | Livré — [README](../69-agent-ci-dokploy/README.md), job CI `agent` |

## Décision architecture (2026-05-27)

- **Indexer** = infra **Intuition** (subnet + GraphQL) — pas de `apps/indexer` maison.
- All-Aboard développe un **bridge publisher** (#67) : outbox Postgres → SDK Intuition ; lecture via GraphQL Intuition.
- `infra/docker/Dockerfile.indexer` et service Dokploy « Indexer » = **legacy** — à retirer, ne pas réactiver.

## Décision architecture (2026-06-02)

- **`apps/agent`** = agent IA **All-Aboard** (réponses in-app, orchestration).
- **Rubberduck** = produit **externe** ; `POST /routing/evaluate` → `suggestRubberduckRedirect` (pas de route respond sur l’agent).

## État actuel (Phase 4 MVP — 2026-06-03)

- **Handoff Rubberduck** : `POST /help-requests` appelle `apps/agent` `POST /routing/evaluate` avec fallback heuristique ([`apps/api/src/agent/routing.ts`](../../../apps/api/src/agent/routing.ts)).
- **UI** : redirect externe Rubberduck si `RUBBERDUCK_URL` configurée ([`help-request-form.tsx`](../../../apps/web/components/features/help-request-form.tsx)).
- **`apps/agent`** : scaffold (#66), CI Docker + smoke `/health` (#69) ; service Dokploy Agent **désactivé** jusqu’à validation ops humaine.
- **Intuition** : outbox + publisher stub (#67) ; SDK testnet et lecture GraphQL en évolution post-MVP.

## Critères de clôture (#37)

- [x] ADR 0004 rédigé
- [x] ADR révisé — indexer Intuition, pas `apps/indexer`
- [x] ADR 0004 accepté (2026-06-01) — implémentation #66–#69 débloquée
- [x] ADR révisé (2026-06-02) — `apps/agent` distinct de Rubberduck
- [x] Sous-issues backlog créées et liées dans #37
- [x] Implémentation #66–#69 merge sur `Dev` (PRs #93, #94, #95, #96)
- [x] Epic #37 fermée (2026-06-03)

## Doc canonique (lecture)

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [Parcours MOC](../../moc-parcours-utilisateur.md)
- [Dataflow cible](../../dataflow-architecture.md)
- [Index doc Intuition](../../intuition-documentation-index.md)
- [Instance Dokploy — Agent/Indexer legacy](../../deploiement-dokploy-instance-allaboard.md)
