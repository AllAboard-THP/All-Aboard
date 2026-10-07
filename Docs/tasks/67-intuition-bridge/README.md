# Task #67 — Intuition bridge (outbox + publisher)

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/67

## Goal

Connect Postgres help-request creation to the **Intuition** ecosystem via a reliable **outbox** pattern: synchronous DB write, asynchronous publish (stub log → testnet SDK later).

## Deliverables

| Deliverable | Location |
|-------------|----------|
| Outbox migration + `intuition_published_at` | [`apps/api/drizzle/0004_outbox_intuition.sql`](../../../apps/api/drizzle/0004_outbox_intuition.sql) |
| Drizzle schema | [`apps/api/src/db/schema.ts`](../../../apps/api/src/db/schema.ts) |
| Bridge module | [`apps/api/src/intuition/`](../../../apps/api/src/intuition/) |
| Emit on `POST /help-requests` | [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) |
| Publisher poll (API process) | [`apps/api/src/index.ts`](../../../apps/api/src/index.ts) |
| Outbox types | [`packages/types`](../../../packages/types/src/index.ts) |
| GraphQL read spike | [intuition-graphql-spike.md](../37-agent-indexer/intuition-graphql-spike.md) |
| Env variables | [`.env.example`](../../../.env.example), [matrix](../../deployment/environment-variables.md) |

## Model

- **`outbox_events`**: `event_type` + `aggregate_id` (request UUID) unique → insert idempotence.
- **`help_requests.intuition_published_at`**: timestamp after stub publish (or real SDK).
- **Publisher**: poll `INTUITION_PUBLISHER_POLL_MS` (default 5s), batch 50; log `intuition_publish_stub`; does not block `201`.

## MVP rules

1. `POST /help-requests` inserts the request then `help_request.created` in outbox (same logical transaction — sequential after insert).
2. **Stub** publisher only: no blocking SDK call for merge.
3. Double enqueue or double poll → **one** stub publish per `helpRequestId`.
4. No `apps/indexer` — graph read via Intuition GraphQL (spike doc).

## Tests

- [`apps/api/src/intuition/publisher.test.ts`](../../../apps/api/src/intuition/publisher.test.ts) — enqueue + publish idempotence (requires `DATABASE_URL`).
- [`apps/api/src/app.test.ts`](../../../apps/api/src/app.test.ts) — outbox created on `POST /help-requests`.

## Follow-up (#68, SDK)

- Replace stub with Intuition testnet SDK (`INTUITION_RPC_URL`, wallet keys).
- Additional events: responses, signals, Rubberduck handoff (`help_request.rubberduck_handoff`).

## Links

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [Epic #37](../37-agent-indexer/README.md)
- [Intuition docs index](../../integrations/intuition-docs-index.md)
