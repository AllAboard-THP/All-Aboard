# ADR 0005 — Web i18n (next-intl)

**Status:** Accepted — 2026-05-28  
**Issue:** [#75](https://github.com/AllAboard-THP/All-Aboard/issues/75)

## Context

The web MVP (`apps/web`) displayed the UI only in French (hardcoded strings, `lang="fr"`). To reach English-speaking users without duplicating the app, a Next.js-only i18n layer is needed — API and design system remain locale-agnostic.

## Decision

1. **Library:** [next-intl](https://next-intl.dev) v4 with Next.js 15 App Router.
2. **Locales:** `fr` (default), `en`.
3. **URLs:** `localePrefix: 'as-needed'` — French keeps current URLs (`/`, `/help/new`…); English is prefixed (`/en`, `/en/help/new`…).
4. **Messages:** JSON files in `apps/web/messages/{fr,en}.json`, namespaces per area (`nav`, `home`, `errors`…).
5. **Navigation:** `@/i18n/navigation` (`Link`, `useRouter`, `usePathname`) in domain code — not raw `next/link` in `components/features/`.
6. **Routing:** pages under `app/[locale]/(app)/`; `app/api/**` and `app/health/**` outside locale.
7. **API errors:** machine-readable codes unchanged on BFF/API; translation at display via `lib/map-api-error.ts`.
8. **User content:** help-request titles and response bodies **not translated**.

## Consequences

### Positive

- FR journey unchanged for existing e2e and bookmarks.
- Clear separation: tokens/components in `packages/ui`, domain copy in `apps/web/messages/`.
- LocaleSwitcher in AppShell to toggle FR ↔ EN on current page.

### Negative / constraints

- Every new page or feature component must use `@/i18n/navigation` and JSON keys (fr/en parity required).
- Vitest client tests: `tests/render-with-intl.tsx` helper; server components: mock `next-intl/server`.
- next-intl middleware: explicit matcher to exclude `/api`, `/health`, static assets.

## Key files

| File | Role |
|------|------|
| `apps/web/i18n/routing.ts` | Locales, defaultLocale, localePrefix |
| `apps/web/i18n/request.ts` | Per-request message loading |
| `apps/web/i18n/navigation.ts` | Locale-aware Link / router |
| `apps/web/middleware.ts` | Locale redirect / detection |
| `apps/web/messages/*.json` | FR/EN UI catalogue |
| `apps/web/lib/map-api-error.ts` | Error codes → `errors.*` keys |

## References

- Agent skill: `.cursor/skills/i18n-allaboard/SKILL.md`
- Cursor rule: `.cursor/rules/i18n.mdc`
- Task doc: `Docs/tasks/75-i18n-web/README.md`
