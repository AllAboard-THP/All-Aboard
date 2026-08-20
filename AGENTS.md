# Instructions for agents (All-Aboard)

This repository uses **Git + CI** guardrails; this file defines the common protocol for any agent (Cursor, Claude Code, Codex, etc.).

## Hindsight (agent memory)

Shared bank **`hermes`** — mandatory tag **`project:all-aboard`**.

1. **New session** (non-trivial): MCP `recall` with `tags: ["project:all-aboard"]`, `tags_match: any_strict`, `budget: mid` (prefetch IDE via `.cursor/hooks/`).
2. **`retain`** as the discussion unfolds for stable decisions/preferences: `project:all-aboard` + `area:<domain>` + `source:cursor-session`.
3. Details: `.cursor/rules/hindsight.mdc`, `.cursor/references/hindsight-tagging.md`.

**Timeline, MVP and docs**: [Docs/README.md](Docs/README.md) (EN), [Docs/INDEX.md](Docs/INDEX.md), [Docs/guides/web-api-integration.md](Docs/guides/web-api-integration.md). **Design system / UI**: [Docs/design-system/README.md](Docs/design-system/README.md) (canonical hub). **Tasks**: [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3). **Per-issue docs**: `Docs/tasks/<NN>-slug/` ([convention](Docs/tasks/README.md)).

## `apps/thp-final` — THP artifact (reference only)

`apps/thp-final` is a **historical version** of the All-Aboard project (Rails 8, THP project). It served as a **functional mockup**: user journeys, screens, product ideas.

**Do not use it as a development base.** The active MVP lives in `apps/web`, `apps/api` and `packages/`.

| Do | Don't |
|----|-------|
| Consult it for **inspiration** (UX, journeys, business vocabulary) | Copy or port Rails/React code from `thp-final` |
| Rely on `Docs/` and the API contract for decisions | Propose changes in `apps/thp-final` without an explicit human decision |
| Treat the folder as **reference material** | Include it in MVP architecture analysis (Graphify, ADR, refactors) |

Presence in the monorepo: **Git subtree** kept as an archive. **Outside** `pnpm verify`, `pnpm dev` and MVP CI (`lint`, `typecheck`, `test`, `build`, `dev` via `--filter=!thp-final`) — run manually from `apps/thp-final` if needed (Ruby/Bundler).

## Before proposing a commit or PR

1. Run:

   ```bash
   pnpm verify
   ```

   Equivalent to `pnpm verify:commit` then `pnpm verify:push` (lint, typecheck, tests, build via Turbo, Storybook build).

   **Local DB tests**: if [`.env.local.dev`](.env.local.dev.example) exists at the root (copy of `.env.local.dev.example`) and Postgres is running (`docker compose up -d`), `pnpm test` / `pnpm verify` automatically load the env and run the API suite against the database. Otherwise: unit tests only (message `test-with-db: DATABASE_URL unset`).

   **Web ESLint**: `pnpm lint` checks that `next` is installed correctly (`scripts/check-node-modules.sh`). On broken symlink: `pnpm install --frozen-lockfile`.

2. If a step fails: fix, re-run `pnpm verify`, then propose the commit.

3. Summarize for the human: commands run, success/failure, relevant error message.

## Git rules

- Do not use `git commit --no-verify` or `git push --no-verify` without explicit human agreement.
- Hooks versioned under `githooks/` (after `pnpm setup:hooks`) enforce:
  - **pre-commit**: `pnpm verify:commit`
  - **pre-push**: `pnpm verify:push`

## CI

PRs and pushes on the main branch trigger the GitHub Actions workflow that re-runs the checks in a clean environment.

- Job **`verify`**: lint, typecheck, API migrations, tests, build (excluding `apps/thp-final`).
- Job **`storybook`** (conditional): `pnpm build:storybook` only if the diff touches `packages/ui/**`, `apps/storybook/**`, lockfile, `turbo.json`, `package.json` or `.github/workflows/ci.yml` (`dorny/paths-filter`).

## Design system (Epic #24, #25)

**Full docs**: [Docs/design-system/README.md](Docs/design-system/README.md) (architecture, contributor guide, CI, AppShell, journal).

**Total** separation: primitives and tokens in the UI package, documentation in Storybook, business logic in `apps/web`.

| Package / app | Role | Forbidden |
|---------------|------|-----------|
| `packages/ui` (`@allaboard/ui`) | TW v4 tokens, shadcn primitives, stories, `cn` / `Button` tests | Importing `apps/*` or `@allaboard/types` |
| `apps/storybook` | Storybook 10 — scans `packages/ui/**/*.stories` | Importing `apps/web` or `apps/api`; not in Docker `web` |
| `apps/web` | Pages, BFF, `components/features/`, `components/blocks/` | `components/ui/`; importing `apps/storybook` |

**Add a shadcn component** (from the root or `apps/web`):

```bash
cd apps/web
pnpm dlx shadcn@latest add <component>
```

The CLI writes into `packages/ui/src/components/` (see `apps/web/components.json` and `packages/ui/components.json`).

**Consume in web**:

```tsx
import { Button } from "@allaboard/ui/components/button";
import "@allaboard/ui/globals.css"; // via app/globals.css + @source (see layout)
```

**Useful checks**: `pnpm storybook` · `pnpm build:storybook` · `pnpm --filter @allaboard/ui test` · [verification-and-ci.md](Docs/design-system/verification-and-ci.md) · ADR [0002](Docs/adr/0002-design-system-monorepo.md).

**Chrome header/footer (absolute MVP)**: [.cursor/rules/app-chrome-shell.mdc](.cursor/rules/app-chrome-shell.mdc) · [app-shell.md](Docs/design-system/app-shell.md) · `AppChromeHeader` / `AppChromeFooter` components in `packages/ui/src/patterns/app-chrome-shell.tsx`. `(app)/` pages → automatic shell via layout; do not duplicate the chrome in pages.

## Graphify (MVP codebase map)

Knowledge graph at the root: `graphify-out/` (`GRAPH_REPORT.md`, `graph.json`, `graph.html`).

- **Corpus**: `apps/web`, `apps/api`, `packages`, `Docs` — **not** `apps/thp-final` (historical Rails, outside MVP).
- **Before** an architecture question: read `graphify-out/GRAPH_REPORT.md`.
- **After** code/doc changes in the MVP corpus:

  ```bash
  ./scripts/graphify-update.sh
  ```

  CLI prerequisite: `uv tool install graphifyy` (PyPI `graphifyy`, binary `graphify` on `PATH`, typically `~/.local/bin`).

  AST only (0 LLM tokens). Semantic doc extraction: `/graphify` with an API key (`graphify extract …`).
