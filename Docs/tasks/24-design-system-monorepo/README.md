# Tâche #24 — Design system monorepo (`packages/ui` + Storybook)

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/24  
**Epic** : [#15 Frontend](https://github.com/AllAboard-THP/All-Aboard/issues/15)  
**Statut** : ✅ **Livré** (fondations + garde-fous + CI SB — voir journal)

## Objectif

Poser les **bases installées** : `packages/ui`, `apps/storybook`, branchement `apps/web`, garde-fous et CI Storybook conditionnelle.

## Doc canonique (lire en priorité)

| Document | Rôle |
|----------|------|
| **[Docs/design-system/README.md](../../design-system/README.md)** | **Hub contributeur** — navigation, état livré, règles |
| [ADR 0002](../../adr/0002-design-system-monorepo.md) | Décision architecture |
| [contributor-guide.md](../../design-system/contributor-guide.md) | Ajouter composant / story |
| [verification-and-ci.md](../../design-system/verification-and-ci.md) | verify, hooks, CI |
| [delivery-log.md](../../design-system/delivery-log.md) | Commits par lot |

Spec de travail détaillée (historique, snippets) : copie Hermes `WorkSpace/Todo/allaboard-design-system-storybook-monorepo.md` — **ne pas maintenir en double** dans le dépôt.

## Done (#24 + suites livrées sur la branche DS)

- [x] `pnpm --filter @allaboard/storybook dev` + `pnpm build:storybook`
- [x] Tokens + primitives (Button, Card, Input, Label) en story
- [x] `apps/web` build avec `@allaboard/ui` (`@source` v4, pas de purge)
- [x] `components/features/` + boundaries ESLint
- [x] ADR 0002, section AGENTS.md, Graphify `packages/ui`
- [x] CI job `storybook` (paths-filter) — commit `65a1596`
- [x] `verify:push` inclut `build:storybook`
- [x] AppShell #25 sur même branche (`65a1596`) — doc [tasks/25-app-shell-navigation](../25-app-shell-navigation/)

## Skills agents (`.agents/skills/`)

`shadcn` · `storybook` · `turborepo-monorepo` · `tailwind-design-system` · `design-system-patterns` · `storybook-story-writing`

## Hors scope initial #24 (traité ailleurs)

| Sujet | Où |
|-------|-----|
| Shell navigation | **#25** — [25-app-shell-navigation](../25-app-shell-navigation/) |
| Feed réelle | **#26** |
| Déploiement Chromatic | post-MVP |

## Liens

- [Docs/README.md](../../README.md)
- [AGENTS.md](../../../AGENTS.md)
- [Plan Web/API](../../plan-mise-en-place-web-api-donnees.md)
