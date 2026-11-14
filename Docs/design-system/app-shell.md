# AppShell — application navigation (#25)

**Issue:** [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25)  
**Status:** shipped + canonical glass chrome (2026-06)  
**MOC journeys:** [product/user-journeys.md](../product/user-journeys.md)  
**Agent rule:** [.cursor/rules/app-chrome-shell.mdc](../../.cursor/rules/app-chrome-shell.mdc)

---

## Absolute rule — header & footer

**Glass header / footer** versions (`landing-shell-chrome`, enlarged brand, `AppAbstractBackground` mesh) are **canonical** for the entire MVP:

- **Existing:** feed, explore, mentor, landing auth, demo dashboard, Storybook patterns.
- **Future:** every new page **must** inherit from a parent shell — **never** hand-copied header/footer.

| Page type | Shell | Application |
|-----------|-------|-------------|
| Connected product | `AppShell` | Automatic via `app/[locale]/(app)/layout.tsx` |
| Marketing / auth | `LandingPageShell` | `LandingPublicHeader` + `AppFooter` |
| Sidebar dashboard | `StudentDashboardScreen` | Same chrome via `AppChromeHeader` / `AppChromeFooter` |
| Outside shell | `health`, API | No product chrome |

**Code source of truth:**

- Constants: `packages/ui/src/patterns/landing-layout.ts` (`APP_SHELL_*`, `APP_CHROME_BRAND_*`)
- Components: `packages/ui/src/patterns/app-chrome-shell.tsx`
- CSS: `packages/ui/src/styles/globals.css` (`.landing-shell-chrome`, `.app-stage`)

**Forbidden:** ad hoc `landing-chrome`, custom logo/text sizes, local opaque page background.

---

## Role

`AppShell` provides persistent **chrome** (header + footer + mesh) for product pages. Page content stays in `<main id="main-content">`.

---

## Route structure

```text
apps/web/app/
├── layout.tsx                      # root: Providers, globals.css
├── health/page.tsx                 # outside shell (no product nav)
├── [locale]/
│   ├── (public)/                   # landing, auth — LandingPageShell
│   │   └── layout.tsx
│   ├── (app)/                      # product — AppShell + sidebar automatic
│   │   ├── layout.tsx              # <AppShell>{children}</AppShell>
│   │   ├── feed/…
│   │   ├── dashboard/demo/         # dashboard (content only)
│   │   └── …
│   └── (public)/                   # landing, legal, auth — no sidebar
```

---

## Components

| File | Role |
|------|------|
| `components/features/app-shell.tsx` | Server: composes `AppShellLayout` |
| `components/features/app-shell-layout.tsx` | Client: header/footer + conditional sidebar |
| `components/features/app-shell-sidebar.tsx` | Client: `AppSidebar` + i18n links + context panel |
| `lib/app-shell-sidebar.ts` | Route exclusions; re-export active/context resolution |
| `packages/ui/…/app-sidebar.tsx` | Sidebar drawer (rail + drawers + context) |
| `packages/ui/…/app-sidebar-nav.ts` | Canonical routes, `resolveAppSidebarContext`, context links |
| `packages/ui/…/app-sidebar-provider.tsx` | Expand/collapse state + `--app-sidebar-width` |

---

## Sidebar drawer (2026-06)

Application sidebar is an internal **drawer** with three levels:

1. **Collapsible rail** — ~4rem (icons) ↔ ~18rem (labels); `localStorage` persistence via `AppSidebarProvider`.
2. **Vertical drawers** — Navigation / Community / Admin sections (accordion; active section opens on route change).
3. **Context panel** — page-specific sub-links (e.g. Help → "New request", Admin → Users / Moderation).

**Tokens** (`landing-layout.ts`):

- `APP_SIDEBAR_WIDTH_COLLAPSED` / `APP_SIDEBAR_WIDTH_EXPANDED`
- `APP_SIDEBAR_GRID_CLASS` — header synced via `--app-sidebar-width`

**Mobile** (`< md`): sidebar hidden in column; menu button → left `Sheet` with drawer forced expanded.

**Add a context link:**

1. Declare in `APP_SIDEBAR_CONTEXT` (`app-sidebar-nav.ts`).
2. Add i18n keys under `studentDashboard.sidebar.context.*` (`apps/web/messages/{fr,en}.json` + `student-dashboard-labels.ts` for Storybook).
3. Check `isAppSidebarItemActive` if parent route changes.

**Storybook:** `Patterns/AppSidebar` — collapsed/expanded states, badges, admin.

---

## New product page — checklist

1. Create route under `app/[locale]/(app)/…` — **do not** add `<header>` / `<footer>` in page.
2. Content only in `<main>` rendered by `AppShell`.
3. If global nav entry → add to `APP_SHELL_NAV`.
4. If special layout (full-height sidebar) → feature wrapper with `StudentDashboardScreen` or compose `AppChromeHeader` / `AppChromeFooter` from `@allaboard/ui/patterns/app-chrome-shell`.
5. `pnpm --filter web test` + `pnpm verify` before PR.

---

## Accessibility

- `<header>` (banner landmark)
- `<nav aria-label="Main navigation">`
- Single `<main id="main-content">`
- Visible focus via `Button` styles (`focus-visible:ring-*`)
- Active link: `aria-current="page"`

Tests: `apps/web/tests/app-shell.test.tsx`, `app-shell-nav.test.tsx`.

---

## Extend the shell

**Auth / connected zone:** `headerActions` slot in `AppShell` (product evolution).

**Do not** put API routes or health under `(app)`.

---

## Out of #25 scope (shipped later)

- Real feed / detail data → [#26](https://github.com/AllAboard-THP/All-Aboard/issues/26)
- Alert / Skeleton in `@allaboard/ui` → [PR #59](https://github.com/AllAboard-THP/All-Aboard/pull/59)
- Dashboard migration under `(app)/` with dedicated route group — technical backlog
