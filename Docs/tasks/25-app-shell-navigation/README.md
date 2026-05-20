# Tâche #25 — Shell navigation & layout

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/25  
**Statut** : ✅ **Livré** — commit `65a1596`  
**Dépend de** : #24 (`@allaboard/ui`, structure `apps/web`)

## Objectif

Shell App Router : navigation persistante, header, zones parcours MOC (accueil, création, détail stub, mentor stub).

## Doc canonique

- **[app-shell.md](../../design-system/app-shell.md)** — routes, composants, a11y, extension
- [design-system/README.md](../../design-system/README.md) — contexte DS
- [moc-parcours-utilisateur.md](../../moc-parcours-utilisateur.md) — parcours produit

## Livré

- [x] Route group `app/(app)/` + `AppShell` / `AppShellNav`
- [x] Pages `/`, `/help/new` migrées sous le shell
- [x] Stubs `/requests/[id]`, `/mentor`
- [x] `/health` hors shell
- [x] Tests Vitest (nav + landmarks)
- [ ] T23.4 alert/skeleton UI — **reporté** (hors scope MVP)

## Critères d’acceptation (#25)

- [x] Nav entre pages stub ou réelles
- [x] Layout responsive minimal · landmarks / focus

## Suite

- [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) — feed réelle SSR (réutilise AppShell)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce fichier |
| Code | `apps/web/app/(app)/`, `components/features/app-shell*.tsx` |
