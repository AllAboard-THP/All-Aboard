# ADR 0002 — Design system monorepo (`packages/ui` + `apps/storybook`)

## Status

Accepted — 2026-05-20 (Epic #24, PRs 24a–24e on `feat/design-system-ui-storybook`).

## Context

All-Aboard had inline styles in `apps/web` and no shared UI package. The product goal is a **design system** documented in Storybook, consumed by Next, without mixing domain logic, primitives, and documentation tooling.

## Decision

1. **`packages/ui` (`@allaboard/ui`)** — source of truth: Tailwind v4 tokens (`globals.css`, `@theme inline`), shadcn v4 primitives, colocated stories, light Vitest tests (`cn`, `Button`). **No** `@allaboard/types` dependency.
2. **`apps/storybook` (`@allaboard/storybook`)** — **documentation** app only (Storybook 10.4 + Vite); scans `packages/ui/**/*.stories`. **Excluded** from `web` Docker image.
3. **`apps/web`** — consumer: `transpilePackages`, `app/globals.css` with `@import "@allaboard/ui/globals.css"` and `@source` to `packages/ui`; domain in `components/features/`, local shadcn blocks in `components/blocks/`. **Forbidden**: `components/ui/` (regression).
4. **shadcn CLI** — run from `apps/web` (monorepo `components.json`); primitives generated in `packages/ui/src/components/`.
5. **ESLint guardrails** — `no-restricted-imports`: `web` ↮ `storybook`, `ui` ↮ `apps/*` (see `@allaboard/config-eslint/design-system-boundaries`).

## Consequences

- Stack: Tailwind **4.3**, shadcn **v4**, Storybook **10.4**, React 19, Next 15.
- Root scripts: `pnpm storybook`, `pnpm build:storybook`, `pnpm dev:ui` (Storybook).
- `pnpm verify` / MVP CI exclude `thp-final`; Graphify includes `packages/` (incl. `ui`).
- Product UI changes: import `@allaboard/ui/components/*` from features; new components via `pnpm dlx shadcn add` from `apps/web`.
- **CI (T21)**: conditional `storybook` job (`dorny/paths-filter`) on diff `packages/ui`, `apps/storybook`, lockfile, turbo, `ci.yml`; `storybook-static` artifact 7d.
- **Hooks (T22)**: `verify:push` includes `build:storybook` (local ↔ CI parity).
- **AppShell (#25)**: product routes under `app/(app)/`; shell documented in [app-shell.md](../design-system/app-shell.md) — outside `ui` package, domain in `components/features/`.

## Canonical documentation

Contributor hub (Diátaxis): [Docs/design-system/README.md](../design-system/README.md) — do not duplicate Hermes spec `WorkSpace/Todo/…`.

## Alternatives not chosen

- **Storybook in `apps/web`** — rejected (doc deps in prod, coupling).
- **Built UI package (tsup)** — rejected for MVP (source exports, Next/SB transpilation).
- **Wholesale merge `feature/ui-tailwind-foundation`** — rejected (cherry-pick v4 tokens only).

## Links

- [Epic #24 — task doc](https://github.com/AllAboard-THP/All-Aboard/issues/24) · [tasks/24](../tasks/24-design-system-monorepo/)
- [#25 AppShell](../tasks/25-app-shell-navigation/) · [app-shell.md](../design-system/app-shell.md)
- [Design system hub](../design-system/README.md) · [Documentation index](../INDEX.md)
- [AGENTS.md](../../AGENTS.md) — Design system section
- [shadcn monorepo](https://ui.shadcn.com/docs/monorepo)
