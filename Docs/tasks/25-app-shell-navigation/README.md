# Tâche #25 — Shell navigation & layout

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/25  
**Statut** : ✅ **Livré** — commit `65a1596`  
**Dépend de** : #24 (`@allaboard/ui`, structure `apps/web`)

## Objectif

Shell App Router : navigation persistante, header, zones parcours MOC (accueil, création, détail, mentor).

## Doc canonique

- **[app-shell.md](../../design-system/app-shell.md)** — routes, composants, a11y, extension
- [design-system/README.md](../../design-system/README.md) — contexte DS
- [moc-parcours-utilisateur.md](../../moc-parcours-utilisateur.md) — parcours produit

## Livré

- [x] Route group `app/(app)/` + `AppShell` / `AppShellNav`
- [x] Pages `/`, `/help/new` migrées sous le shell
- [x] Pages `/requests/[id]` (détail SSR) et `/mentor` (dashboard mentor)
- [x] `/health` hors shell
- [x] Tests Vitest (nav + landmarks)
- [x] T23.4 Alert / Skeleton UI — livré via [PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59) (`@allaboard/ui`, 2026-05-27)

## Critères d’acceptation (#25)

- [x] Nav entre pages produit
- [x] Layout responsive minimal · landmarks / focus

## Suite

- [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) — feed réelle SSR (clos ; réutilise AppShell)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce fichier |
| Code | `apps/web/app/(app)/`, `components/features/app-shell*.tsx` |
