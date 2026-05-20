# ADR 0002 — Design system monorepo (`packages/ui` + `apps/storybook`)

## Statut

Accepté — 2026-05-20 (Epic #24, PRs 24a–24e sur `feat/design-system-ui-storybook`).

## Contexte

All-Aboard avait des styles inline dans `apps/web` et pas de package UI partagé. L’objectif produit est un **design system** documenté (Storybook), consommé par Next, sans mélanger métier, primitives et outillage doc.

## Décision

1. **`packages/ui` (`@allaboard/ui`)** — source de vérité : tokens Tailwind v4 (`globals.css`, `@theme inline`), primitives shadcn v4, stories colocalisées, tests Vitest légers (`cn`, `Button`). **Pas** de dépendance `@allaboard/types`.
2. **`apps/storybook` (`@allaboard/storybook`)** — application **documentation** uniquement (Storybook 10.4 + Vite) ; scan `packages/ui/**/*.stories`. **Hors** image Docker `web`.
3. **`apps/web`** — consommateur : `transpilePackages`, `app/globals.css` avec `@import "@allaboard/ui/globals.css"` et `@source` vers `packages/ui` ; métier dans `components/features/`, blocks shadcn locaux dans `components/blocks/`. **Interdit** : `components/ui/` (régression).
4. **CLI shadcn** — exécutée depuis `apps/web` (`components.json` monorepo) ; les primitives sont générées dans `packages/ui/src/components/`.
5. **Garde-fous ESLint** — `no-restricted-imports` : `web` ↮ `storybook`, `ui` ↮ `apps/*` (voir `@allaboard/config-eslint/design-system-boundaries`).

## Conséquences

- Stack : Tailwind **4.3**, shadcn **v4**, Storybook **10.4**, React 19, Next 15.
- Scripts racine : `pnpm storybook`, `pnpm build:storybook`, `pnpm dev:ui` (Storybook).
- `pnpm verify` / CI MVP excluent `thp-final` ; Graphify inclut `packages/` (dont `ui`).
- Évolutions UI produit : importer `@allaboard/ui/components/*` depuis les features ; nouveaux composants via `pnpm dlx shadcn add` depuis `apps/web`.
- **CI (T21)** : job `storybook` conditionnel (`dorny/paths-filter`) sur diff `packages/ui`, `apps/storybook`, lockfile, turbo, `ci.yml` ; artefact `storybook-static` 7j.
- **Hooks (T22)** : `verify:push` inclut `build:storybook` (parité locale ↔ CI).
- **AppShell (#25)** : routes produit sous `app/(app)/` ; shell documenté dans [app-shell.md](../design-system/app-shell.md) — hors package `ui`, métier dans `components/features/`.

## Documentation canonique

Hub contributeur (Diátaxis) : [Docs/design-system/README.md](../design-system/README.md) — ne pas dupliquer le spec Hermes `WorkSpace/Todo/…`.

## Alternatives non retenues

- **Storybook dans `apps/web`** — rejeté (deps doc en prod, coupling).
- **Package UI buildé (tsup)** — rejeté pour le MVP (exports source, transpilation Next/SB).
- **Merge wholesale `feature/ui-tailwind-foundation`** — rejeté (cherry-pick tokens v4 uniquement).

## Liens

- [Epic #24 — doc tâche](https://github.com/AllAboard-THP/All-Aboard/issues/24) · [tasks/24](../tasks/24-design-system-monorepo/)
- [#25 AppShell](../tasks/25-app-shell-navigation/) · [app-shell.md](../design-system/app-shell.md)
- [Hub design-system](../design-system/README.md) · [Map of content](../map-of-content.md)
- [AGENTS.md](../../AGENTS.md) — section Design system
- [shadcn monorepo](https://ui.shadcn.com/docs/monorepo)
