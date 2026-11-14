# Task #24 — Design system monorepo (`packages/ui` + Storybook)

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/24  
**Epic:** [#15 Frontend](https://github.com/AllAboard-THP/All-Aboard/issues/15)  
**Status:** ✅ **Shipped** (foundations + guardrails + SB CI — see journal)

## Goal

Lay **installed foundations**: `packages/ui`, `apps/storybook`, `apps/web` wiring, guardrails and conditional Storybook CI.

## Canonical docs (read first)

| Document | Role |
|----------|------|
| **[Docs/design-system/README.md](../../design-system/README.md)** | **Contributor hub** — navigation, shipped state, rules |
| [ADR 0002](../../adr/0002-design-system-monorepo.md) | Architecture decision |
| [contributor-guide.md](../../design-system/contributor-guide.md) | Add component / story |
| [verification-and-ci.md](../../design-system/verification-and-ci.md) | verify, hooks, CI |
| [delivery-log.md](../../design-system/delivery-log.md) | Commits by batch |

Detailed work spec (history, snippets): Hermes copy `WorkSpace/archives/2026/todo-legacy/allaboard-design-system-storybook-monorepo.md` — **do not maintain duplicate** in repo.

## Done (#24 + follow-ups shipped on DS branch)

- [x] `pnpm --filter @allaboard/storybook dev` + `pnpm build:storybook`
- [x] Tokens + primitives (Button, Card, Input, Label) in story
- [x] `apps/web` build with `@allaboard/ui` (`@source` v4, no purge)
- [x] `components/features/` + ESLint boundaries
- [x] ADR 0002, AGENTS.md section, Graphify `packages/ui`
- [x] CI job `storybook` (paths-filter) — commit `65a1596`
- [x] `verify:push` includes `build:storybook`
- [x] AppShell #25 on same branch (`65a1596`) — doc [tasks/25-app-shell-navigation](../25-app-shell-navigation/)

## Agent skills (`.agents/skills/`)

`shadcn` · `storybook` · `turborepo-monorepo` · `tailwind-design-system` · `design-system-patterns` · `storybook-story-writing`

## Out of initial #24 scope (handled elsewhere)

| Topic | Where |
|-------|-------|
| Shell navigation | **#25** — [25-app-shell-navigation](../25-app-shell-navigation/) |
| Real feed | **#26** |
| Chromatic deploy | post-MVP |

## Links

- [Docs/README.md](../../README.md)
- [AGENTS.md](../../../AGENTS.md)
- [Web/API plan](../../guides/web-api-integration.md)
