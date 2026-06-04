# Issue #68 — API→Agent handoff Rubberduck

**Statut** : livré — merge [PR #95](https://github.com/AllAboard-THP/All-Aboard/pull/95) sur `Dev` (2026-06-03).

## Objectif

Remplacer l’heuristique API (`wordCount <= 6`) par un appel à **`apps/agent`** (`POST /routing/evaluate`), avec fallback local si l’agent est indisponible. Côté web, redirection vers **Rubberduck** (service externe) via BFF.

## Livrables

| Zone | Fichier | Rôle |
|------|---------|------|
| API client | [`apps/api/src/agent/routing.ts`](../../../apps/api/src/agent/routing.ts) | HTTP → agent, timeout 2s, fallback |
| API | [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) | `evaluateRouting` injectable ; mappe `suggestRubberduckRedirect` → `hints.rubberduckEligible` |
| Web BFF | [`apps/web/app/api/rubberduck/redirect/route.ts`](../../../apps/web/app/api/rubberduck/redirect/route.ts) | Expose `RUBBERDUCK_URL` (serveur uniquement) |
| Web UI | [`apps/web/components/features/help-request-form.tsx`](../../../apps/web/components/features/help-request-form.tsx) | Redirect externe si URL configurée |
| Env | [`.env.example`](../../../.env.example) | `AGENT_URL`, `RUBBERDUCK_URL` |

## Variables

- **`AGENT_URL`** (API) — ex. `http://127.0.0.1:4100` ; absent → fallback heuristique locale.
- **`RUBBERDUCK_URL`** (web) — URL produit externe ; absent → message in-app après handoff.

## Tests

- `apps/api/src/agent/routing.test.ts` — client + fallback
- `apps/api/src/app.test.ts` — injection `evaluateRouting`
- `apps/web/tests/rubberduck-redirect.test.ts`, `bff-phase2.test.ts` — BFF redirect

## Références

- [ADR 0004](../../adr/0004-agent-indexer-architecture.md)
- [#66](https://github.com/AllAboard-THP/All-Aboard/issues/66) scaffold agent (prérequis)
- Epic [#37](https://github.com/AllAboard-THP/All-Aboard/issues/37)
