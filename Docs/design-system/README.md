# Design system — canonical documentation

**Last updated:** 2026-05-20  
**Architecture decision:** [ADR 0002](../adr/0002-design-system-monorepo.md)  
**Agents:** [AGENTS.md](../../AGENTS.md) (Design system + verify sections)

This folder is the **source of truth** for contributing to the All-Aboard design system. The detailed working spec (PR 24a–#25 history) lives in Hermes: `WorkSpace/archives/2026/todo-legacy/allaboard-design-system-storybook-monorepo.md` — **do not duplicate** here; this hub summarizes **shipped** state and operational procedures.

---

## Navigation (Diátaxis)

| Type | Document | When to read |
|------|----------|--------------|
| **Explanation** | [architecture.md](architecture.md) | Why three packages (`ui`, `storybook`, `web`) |
| **How-to** | [contributor-guide.md](contributor-guide.md) | Add a shadcn component, a story, consume in Next |
| **How-to** | [app-shell.md](app-shell.md) | Change navigation / app layout (#25) |
| **Reference** | [verification-and-ci.md](verification-and-ci.md) | `pnpm` commands, hooks, GitHub Actions jobs |
| **Reference** | [delivery-log.md](delivery-log.md) | Delivery history (commits, issues) |
| **Decision** | [ADR 0002](../adr/0002-design-system-monorepo.md) | Stable contract post-review |

**GitHub issues:** [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24) (DS foundations) · [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25) (AppShell) · task docs: [tasks/24-design-system-monorepo](../tasks/24-design-system-monorepo/) · [tasks/25-app-shell-navigation](../tasks/25-app-shell-navigation/)

---

## Shipped state (summary)

| Batch | Status | Commit |
|-------|--------|--------|
| 24a–24f — `packages/ui`, Storybook, web, guardrails | ✅ | `60af213` (+ commits 24a–24e) |
| Graph regen `packages/ui` | ✅ | `0ae3067` |
| T21 — conditional Storybook CI | ✅ | `65a1596` |
| T22 — `verify:push` + SB build | ✅ | `65a1596` |
| #25 — AppShell + MOC routes | ✅ | `65a1596` |

**Pinned stack (MVP):** Tailwind **4.3** · shadcn **v4** · Storybook **10.4** · React **19** · Next **15** · Node **22+** · pnpm **9.15.4**.

---

## Code layout

```text
packages/ui/          @allaboard/ui — tokens, primitives, stories, tests
apps/storybook/       @allaboard/storybook — Storybook config only
apps/web/
  app/(app)/          product pages under AppShell
  app/health/         outside shell
  components/features/   domain (incl. app-shell*.tsx)
  components/blocks/     page-level shadcn blocks
```

---

## Quick start (new contributor)

```bash
# Monorepo root — Node 22+
pnpm install
pnpm setup:hooks          # once after clone

pnpm storybook            # UI catalogue: http://localhost:6006
pnpm --filter @allaboard/ui test
pnpm verify               # before commit / PR
```

**Git push:** use **SSH** for changes under `.github/workflows/` (OAuth tokens without `workflow` scope are rejected by GitHub).

```bash
git remote set-url origin git@github.com:AllAboard-THP/All-Aboard.git
```

---

## Non-negotiable rules

1. **Primitives** → `packages/ui` only (shadcn CLI from `apps/web`).
2. **Domain UI** → `apps/web/components/features/` (not `components/ui/`).
3. **Storybook** → config in `apps/storybook`; stories in `packages/ui`.
4. **`@allaboard/ui`** must not depend on `@allaboard/types`.
5. **ESLint:** no `apps/storybook` import from `web`, no `apps/*` import from `ui`.
6. After UI/SB/MVP doc change: `./scripts/graphify-update.sh` (CLI: `uv tool install graphifyy`).

---

## Upcoming (outside current doc)

| Topic | Issue / note |
|-------|----------------|
| Real SSR feed | [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) — reuses AppShell |
| Alert / Skeleton in UI | deferred post-#25 |
| Storybook catalogue deploy | `infra/docker/Dockerfile.storybook` (nginx, port 8080) — Dokploy matrix |

---

## External links

- [shadcn monorepo](https://ui.shadcn.com/docs/monorepo) · [Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4)
- [Turborepo + Storybook](https://turborepo.dev/docs/guides/tools/storybook)
- [Storybook 10 migration](https://storybook.js.org/docs/releases/migration-guide)
