# Task #37 — Phase 4 All-Aboard Agent & Intuition

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/37

## Goal

Frame and deliver Phase 4 backlog **`apps/agent` (All-Aboard agent) + Rubberduck handoff (external) + Intuition integration**: architecture ADR, sub-tasks #66–#69, MVP implementation merged on `Dev` (2026-06-03).

**Rubberduck** is not `apps/agent`: AI service owned by another team; All-Aboard redirects users for certain requests. **`apps/agent`** orchestrates in-app AI and handoff decisions.

## Deliverables (framing)

| Deliverable | File / artifact |
|-------------|-----------------|
| Phase 4 ADR | [Docs/adr/0004-agent-indexer-architecture.md](../../adr/0004-agent-indexer-architecture.md) |
| Backlog sub-tasks | Issues #66–#69 (children of #37) |

## Sub-tasks

| Issue | Title | PR | Status |
|-------|-------|-----|--------|
| [#66](https://github.com/AllAboard-THP/All-Aboard/issues/66) | `apps/agent` scaffold (healthcheck, agent + handoff stubs) | [#93](https://github.com/AllAboard-THP/All-Aboard/pull/93) | Shipped — [`apps/agent`](../../../apps/agent/README.md) |
| [#67](https://github.com/AllAboard-THP/All-Aboard/issues/67) | Intuition bridge (outbox publisher + GraphQL) | [#94](https://github.com/AllAboard-THP/All-Aboard/pull/94) | Shipped — [README](../67-intuition-bridge/README.md), [GraphQL spike](./intuition-graphql-spike.md) |
| [#68](https://github.com/AllAboard-THP/All-Aboard/issues/68) | API integration — Rubberduck handoff via agent | [#95](https://github.com/AllAboard-THP/All-Aboard/pull/95) | Shipped — [README](../68-agent-handoff/README.md) |
| [#69](https://github.com/AllAboard-THP/All-Aboard/issues/69) | Agent CI/Dokploy + Indexer placeholder removal | [#96](https://github.com/AllAboard-THP/All-Aboard/pull/96) | Shipped — [README](../69-agent-ci-dokploy/README.md), CI job `agent` |

## Architecture decision (2026-05-27)

- **Indexer** = **Intuition** infra (subnet + GraphQL) — no in-house `apps/indexer`.
- All-Aboard builds a **publisher bridge** (#67): Postgres outbox → Intuition SDK; read via Intuition GraphQL.
- `infra/docker/Dockerfile.indexer` and Dokploy "Indexer" service = **legacy** — remove, do not reactivate.

## Architecture decision (2026-06-02)

- **`apps/agent`** = **All-Aboard** AI agent (in-app responses, orchestration).
- **Rubberduck** = **external** product; `POST /routing/evaluate` → `suggestRubberduckRedirect` (no respond route on agent).

## Current state (Phase 4 MVP — 2026-06-03)

- **Rubberduck handoff**: `POST /help-requests` calls `apps/agent` `POST /routing/evaluate` with heuristic fallback ([`apps/api/src/agent/routing.ts`](../../../apps/api/src/agent/routing.ts)).
- **UI**: external Rubberduck redirect when `RUBBERDUCK_URL` configured ([`help-request-form.tsx`](../../../apps/web/components/features/help-request-form.tsx)).
- **`apps/agent`**: scaffold (#66), Docker CI + `/health` smoke (#69); Dokploy Agent service **disabled** until human ops validation.
- **Intuition**: outbox + stub publisher (#67); testnet SDK and GraphQL read evolving post-MVP.

## Closure criteria (#37)

- [x] ADR 0004 drafted
- [x] ADR revised — Intuition indexer, not `apps/indexer`
- [x] ADR 0004 accepted (2026-06-01) — #66–#69 implementation unblocked
- [x] ADR revised (2026-06-02) — `apps/agent` distinct from Rubberduck
- [x] Backlog sub-issues created and linked in #37
- [x] #66–#69 implementation merged on `Dev` (PRs #93, #94, #95, #96)
- [x] Epic #37 closed (2026-06-03)

## Canonical reading

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [User journeys](../../product/user-journeys.md)
- [Target dataflow](../../architecture/dataflow.md)
- [Intuition docs index](../../integrations/intuition-docs-index.md)
- [Dokploy instance — Agent/Indexer legacy](../../deployment/dokploy-instance.md)
