# Delivery journal — design system & shell

**Integration branch:** `Dev` (epics #24 / #25 merged)  
**Last documented delivery:** [PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59) — merge `933597e` (2026-05-27)

This journal traces **commits** and **issues** for audit and onboarding. Historical technical detail (snippets, T00–T23 tasklist) remains in Hermes spec `WorkSpace/Todo/allaboard-design-system-storybook-monorepo.md`.

---

## Epic #24 — Design system foundations

| PR / batch | Commit | Summary |
|----------|--------|--------|
| 24a T00–T03 | `e1600d9` | Scaffold `@allaboard/ui`, TW 4.3 catalog + SB 10.4, turbo |
| CI verify | `06a8ad8` | Exclude `thp-final` from verify/CI |
| 24b T04–T07 | `037e766` | `@allaboard/storybook` app, build:storybook |
| 24c T08–T11 | `41b9a4a` | shadcn primitives + stories + Vitest ui |
| 24d T12–T14 | `ceacc34` | Web: `@allaboard/ui`, `@source` v4, transpile |
| 24e T15–T16 | `5aa4914` | `components/features/`, primitive migration |
| 24f T17–T20 | `60af213` | ESLint boundaries, ADR 0002, AGENTS.md |
| Graph | `0ae3067` | Regen Graphify with `packages/ui` |

**Issue:** [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24) — **closed** on `Dev`.

---

## Post-24f — Storybook CI (T21–T22)

| Batch | Commit | Summary |
|-----|--------|--------|
| T21 + T22 + #25 | `65a1596` | CI `storybook` job (paths-filter), `verify:push` + SB, AppShell |

T21 detail: `changes` + `storybook` jobs, `storybook-static` artefact 7d.  
T22 detail: `verify:push` = `test && build && build:storybook`.

---

## Issue #25 — AppShell

| Element | Detail |
|---------|--------|
| Commit | `65a1596` (with T21–T22) |
| Routes | `(app)/` — feed, `/help/new`, `/requests/[id]`, `/mentor` |
| Tests | 16+ web tests (nav/shell + Phase 2 journeys) |
| Doc | [app-shell.md](app-shell.md) |

**Issue:** [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25) — **closed** on `Dev`.

---

## PR #59 — DS polish (11 primitives, SB catalogue)

| Element | Detail |
|---------|--------|
| Merge | `933597e` (2026-05-27) |
| Primitives | Alert, Skeleton, Select, Textarea, Sonner, Badge, Separator, … |
| Stories + tests | Extended Storybook catalogue; Vitest `@allaboard/ui` |
| CI | `storybook` job ran on PR (paths-filter) |

Optional T23.4 closure (Alert/Skeleton) — see [tasks/25-app-shell-navigation](../tasks/25-app-shell-navigation/README.md).

---

## Recommended merge criteria (recap)

- [x] `pnpm verify` green (Node 22)
- [x] `pnpm build:storybook` green
- [x] `apps/web` build with AppShell routes
- [x] ADR 0002 + hub [README.md](../README.md)
- [x] Issues #24 / #25 closed on `Dev`
- [x] PR CI with `storybook` job run ([PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59))

---

## Product backlog (doc)

| Issue | Depends on | Target doc |
|-------|-----------|-----------|
| [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) Real feed | #25 AppShell | Closed — Web/API plan |
| MOC responses (Phase 2b) | Phase 2 auth | `Docs/tasks/` + Web/API plan |
