# Issue #68 — API→Agent Rubberduck handoff

**Status:** shipped — merged [PR #95](https://github.com/AllAboard-THP/All-Aboard/pull/95) on `Dev` (2026-06-03).

## Goal

Replace the API heuristic (`wordCount <= 6`) with a call to **`apps/agent`** (`POST /routing/evaluate`), with local fallback when the agent is unavailable. On web, redirect to **Rubberduck** (external service) via BFF.

## Deliverables

| Area | File | Role |
|------|------|------|
| API client | [`apps/api/src/agent/routing.ts`](../../../apps/api/src/agent/routing.ts) | HTTP → agent, 2s timeout, fallback |
| API | [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) | Injectable `evaluateRouting`; maps `suggestRubberduckRedirect` → `hints.rubberduckEligible` |
| Web BFF | [`apps/web/app/api/rubberduck/redirect/route.ts`](../../../apps/web/app/api/rubberduck/redirect/route.ts) | Exposes `RUBBERDUCK_URL` (server only) |
| Web UI | [`apps/web/components/features/help-request-form.tsx`](../../../apps/web/components/features/help-request-form.tsx) | External redirect when URL configured |
| Env | [`.env.example`](../../../.env.example) | `AGENT_URL`, `RUBBERDUCK_URL` |

## Variables

- **`AGENT_URL`** (API) — e.g. `http://127.0.0.1:4100`; when absent → local heuristic fallback.
- **`RUBBERDUCK_URL`** (web) — external product URL; when absent → in-app message after handoff.

## Tests

- `apps/api/src/agent/routing.test.ts` — client + fallback
- `apps/api/src/app.test.ts` — `evaluateRouting` injection
- `apps/web/tests/rubberduck-redirect.test.ts`, `bff-phase2.test.ts` — BFF redirect

## References

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [#66](https://github.com/AllAboard-THP/All-Aboard/issues/66) agent scaffold (prerequisite)
- Epic [#37](https://github.com/AllAboard-THP/All-Aboard/issues/37)
