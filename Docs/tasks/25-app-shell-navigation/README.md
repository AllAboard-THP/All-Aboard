# Task #25 — Navigation shell & layout

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/25  
**Status:** ✅ **Shipped** — commit `65a1596`  
**Depends on:** #24 (`@allaboard/ui`, `apps/web` structure)

## Goal

App Router shell: persistent navigation, header, MOC journey zones (home, create, detail, mentor).

## Canonical docs

- **[app-shell.md](../../design-system/app-shell.md)** — routes, components, a11y, extension
- [design-system/README.md](../../design-system/README.md) — DS context
- [product/user-journeys.md](../../product/user-journeys.md) — product journeys

## Shipped

- [x] Route group `app/(app)/` + `AppShell` / `AppShellNav`
- [x] Pages `/`, `/help/new` migrated under shell
- [x] Pages `/requests/[id]` (SSR detail) and `/mentor` (mentor dashboard)
- [x] `/health` outside shell
- [x] Vitest tests (nav + landmarks)
- [x] T23.4 Alert / Skeleton UI — shipped via [PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59) (`@allaboard/ui`, 2026-05-27)

## Acceptance criteria (#25)

- [x] Nav between product pages
- [x] Minimal responsive layout · landmarks / focus

## Next

- [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26) — real SSR feed (closed; reuses AppShell)

## Files

| File | Role |
|------|------|
| `README.md` | This file |
| Code | `apps/web/app/(app)/`, `components/features/app-shell*.tsx` |
