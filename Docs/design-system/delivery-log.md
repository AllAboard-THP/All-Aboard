# Journal de livraison — design system & shell

**Branche polish** : `feat/design-storybook-polish` (base `Dev`) — **kit MVP 100 %**  
**Dernière livraison documentée** : 2026-05-26

Ce journal trace les **commits** et **issues** pour l’audit et l’onboarding. Le détail technique historique (snippets, tasklist T00–T23) reste dans le spec Hermes `WorkSpace/Todo/allaboard-design-system-storybook-monorepo.md`.

---

## Branche `feat/design-storybook-polish` — kit MVP 100 % (2026-05-26)

| Lot | Résumé |
|-----|--------|
| Storybook polish | Alert, Skeleton, Input invalid, Card FeedEmpty, Button Loading |
| Primitives | Badge, Textarea, Separator + stories autodocs |
| Patterns | EmptyState (+ NotFound, MentorFeedEmpty), ErrorAlert, FeedItemCard, FormField, PageHeader, LoadingFeed |
| Foundations SB | Typography, Spacing & Radius, Motion, Welcome.mdx, tokens enrichis |
| Intégration app | Badge tags (feed, détail, mentor), Alert, Separator, Textarea titre, Skeleton feed + détail |
| Tests UI | alert, badge, skeleton (+ button, utils existants) |

**Inventaire `@allaboard/ui`** : Alert, Badge, Button, Card, Input, Label, Separator, Skeleton, Textarea — + `patterns/` (6 story files) + `foundations/` (5 entrées SB).

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

**Issue** : [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24) — fondations **closables** après merge `Dev`.

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
| Routes | `(app)/`, stubs `/requests/[id]`, `/mentor` |
| Tests | 16 tests web (dont 4 nav/shell) |
| Doc | [app-shell.md](app-shell.md) |

---

## Critères de merge recommandés (récap)

- [x] `pnpm verify` vert (Node 22)
- [x] `pnpm build:storybook` vert
- [x] `apps/web` build avec routes AppShell
- [x] ADR 0002 + hub [README.md](README.md)
- [ ] Issue #24 / #25 checkboxes GitHub à jour après merge sur `Dev`
- [ ] Au moins une PR CI avec job `storybook` exécuté (validation T21 en prod)

---

## Suite produit (backlog doc)

| Issue | Dépend de | Doc cible |
|-------|-----------|-----------|
| [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) Feed réelle | #25 AppShell | `Docs/tasks/` + plan Web/API |
| Toast / Select | backlog | shadcn — hors scope MVP actuel |
