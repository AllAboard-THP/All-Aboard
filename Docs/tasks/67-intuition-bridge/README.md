# Tâche #67 — Bridge Intuition (outbox + publisher)

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/67

## Objectif

Relier la création de demandes d’aide Postgres à l’écosystème **Intuition** via un pattern **outbox** fiable : émission synchrone en base, publication asynchrone (stub log → SDK testnet ultérieur).

## Livrables

| Livrable | Emplacement |
|----------|-------------|
| Migration outbox + `intuition_published_at` | [`apps/api/drizzle/0004_outbox_intuition.sql`](../../../apps/api/drizzle/0004_outbox_intuition.sql) |
| Schéma Drizzle | [`apps/api/src/db/schema.ts`](../../../apps/api/src/db/schema.ts) |
| Module bridge | [`apps/api/src/intuition/`](../../../apps/api/src/intuition/) |
| Émission sur `POST /help-requests` | [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) |
| Poll publisher (process API) | [`apps/api/src/index.ts`](../../../apps/api/src/index.ts) |
| Types outbox | [`packages/types`](../../../packages/types/src/index.ts) |
| Spike lecture GraphQL | [intuition-graphql-spike.md](../37-agent-indexer/intuition-graphql-spike.md) |
| Variables env | [`.env.example`](../../../.env.example), [matrice](../../matrice-deploiement-dokploy-coolify.md) |

## Modèle

- **`outbox_events`** : `event_type` + `aggregate_id` (UUID demande) unique → idempotence à l’insert.
- **`help_requests.intuition_published_at`** : horodatage après publish stub (ou SDK réel).
- **Publisher** : poll `INTUITION_PUBLISHER_POLL_MS` (défaut 5s), batch 50 ; log `intuition_publish_stub` ; ne bloque pas le `201`.

## Règles MVP

1. `POST /help-requests` insère la demande puis `help_request.created` dans l’outbox (même transaction logique — séquentiel après insert).
2. Publisher **stub** uniquement : pas d’appel SDK bloquant pour le merge.
3. Double enqueue ou double poll → **un seul** stub publish par `helpRequestId`.
4. Pas de `apps/indexer` — lecture graphe via GraphQL Intuition (spike doc).

## Tests

- [`apps/api/src/intuition/publisher.test.ts`](../../../apps/api/src/intuition/publisher.test.ts) — idempotence enqueue + publish (nécessite `DATABASE_URL`).
- [`apps/api/src/app.test.ts`](../../../apps/api/src/app.test.ts) — outbox créé sur `POST /help-requests`.

## Suite (#68, SDK)

- Remplacer le stub par SDK Intuition testnet (`INTUITION_RPC_URL`, clés wallet).
- Événements additionnels : réponses, signaux, handoff Rubberduck (`help_request.rubberduck_handoff`).

## Liens

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [Epic #37](../37-agent-indexer/README.md)
- [Index doc Intuition](../../intuition-documentation-index.md)
