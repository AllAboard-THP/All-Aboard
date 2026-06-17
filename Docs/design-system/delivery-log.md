# Journal de livraison — design system & shell

**Branche d’intégration** : `Dev` (epics #24 / #25 mergées)  
**Dernière livraison documentée** : [PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59) — merge `933597e` (2026-05-27)

Ce journal trace les **commits** et **issues** pour l’audit et l’onboarding. Le détail technique historique (snippets, tasklist T00–T23) reste dans le spec Hermes `WorkSpace/Todo/allaboard-design-system-storybook-monorepo.md`.

---

## Epic #24 — Fondations design system

| PR / lot | Commit | Résumé |
|----------|--------|--------|
| 24a T00–T03 | `e1600d9` | Scaffold `@allaboard/ui`, catalog TW 4.3 + SB 10.4, turbo |
| CI verify | `06a8ad8` | Exclusion `thp-final` de verify/CI |
| 24b T04–T07 | `037e766` | App `@allaboard/storybook`, build:storybook |
| 24c T08–T11 | `41b9a4a` | Primitives shadcn + stories + Vitest ui |
| 24d T12–T14 | `ceacc34` | Web : `@allaboard/ui`, `@source` v4, transpile |
| 24e T15–T16 | `5aa4914` | `components/features/`, migration primitives |
| 24f T17–T20 | `60af213` | ESLint boundaries, ADR 0002, AGENTS.md |
| Graph | `0ae3067` | Regen Graphify avec `packages/ui` |

**Issue** : [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24) — **clos** sur `Dev`.

---

## Post-24f — CI Storybook (T21–T22)

| Lot | Commit | Résumé |
|-----|--------|--------|
| T21 + T22 + #25 | `65a1596` | Job CI `storybook` (paths-filter), `verify:push` + SB, AppShell |

Détail T21 : jobs `changes` + `storybook`, artefact `storybook-static` 7j.  
Détail T22 : `verify:push` = `test && build && build:storybook`.

---

## Issue #25 — AppShell

| Élément | Détail |
|---------|--------|
| Commit | `65a1596` (avec T21–T22) |
| Routes | `(app)/` — feed, `/help/new`, `/requests/[id]`, `/mentor` |
| Tests | 16+ tests web (nav/shell + parcours Phase 2) |
| Doc | [app-shell.md](app-shell.md) |

**Issue** : [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25) — **clos** sur `Dev`.

---

## PR #59 — Polish DS (11 primitives, catalogue SB)

| Élément | Détail |
|---------|--------|
| Merge | `933597e` (2026-05-27) |
| Primitives | Alert, Skeleton, Select, Textarea, Sonner, Badge, Separator, … |
| Stories + tests | Catalogue Storybook étendu ; Vitest `@allaboard/ui` |
| CI | Job `storybook` exécuté sur la PR (paths-filter) |

Clôture optionnelle T23.4 (Alert/Skeleton) — voir [tasks/25-app-shell-navigation](../tasks/25-app-shell-navigation/README.md).

---

## Critères de merge recommandés (récap)

- [x] `pnpm verify` vert (Node 22)
- [x] `pnpm build:storybook` vert
- [x] `apps/web` build avec routes AppShell
- [x] ADR 0002 + hub [README.md](README.md)
- [x] Issues #24 / #25 clos sur `Dev`
- [x] PR CI avec job `storybook` exécuté ([PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59))

---

## Suite produit (backlog doc)

| Issue | Dépend de | Doc cible |
|-------|-----------|-----------|
| [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) Feed réelle | #25 AppShell | Clos — plan Web/API |
| Réponses MOC (Phase 2b) | Phase 2 auth | `Docs/tasks/` + plan Web/API |
| Filtrage / notifications mentor | backlog produit | MOC + epic à créer |
