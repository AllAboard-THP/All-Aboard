# Tâche #24 — Design system monorepo (`packages/ui` + Storybook)

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/24  
**Epic** : [#15 Frontend](https://github.com/AllAboard-THP/All-Aboard/issues/15)

## Objectif

Poser les **bases installées** : `packages/ui`, `apps/storybook`, branchement minimal `apps/web`.

Spec détaillée (snippets, ordre PR interne) : copie Hermes `WorkSpace/Todo/allaboard-design-system-storybook-monorepo.md`.

## Done (#24 closable)

- `pnpm --filter @allaboard/storybook dev` + `pnpm build:storybook`
- Tokens + au moins Button en story
- `apps/web` build avec `@allaboard/ui` (CSS non purgé)
- `pnpm verify` vert

## Skills agents (`.agents/skills/`)

`shadcn` · `storybook` · `turborepo-monorepo` · `tailwind-design-system` · `design-system-patterns` · `storybook-story-writing`

## Hors scope #24

- Shell → **#25** · migration features complète · ESLint/ADR/CI Storybook → PRs suivantes

## Doc canonique

- [Docs/README.md](../../README.md)
- [Plan Web/API](../../plan-mise-en-place-web-api-donnees.md)
- [AGENTS.md](../../../AGENTS.md)
