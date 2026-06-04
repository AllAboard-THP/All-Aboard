# Issue #75 — Web i18n (next-intl)

## Scope

- `apps/web` only (API and `packages/ui` unchanged per issue).
- Locales: `fr` (default, no URL prefix), `en` (`/en/...`).
- `localePrefix: as-needed` via `next-intl` middleware.

## Layout

| Path | Role |
|------|------|
| `apps/web/i18n/routing.ts` | Locales + prefix strategy |
| `apps/web/i18n/request.ts` | Server message loading |
| `apps/web/i18n/navigation.ts` | Locale-aware `Link`, `useRouter`, `usePathname` |
| `apps/web/messages/{fr,en}.json` | UI copy |
| `apps/web/middleware.ts` | Locale detection / redirects |
| `apps/web/app/[locale]/(app)/` | Localized app routes |
| `apps/web/app/api/` | BFF (no locale segment) |

## UI

- `LocaleSwitcher` in `AppShell` header (`data-testid="locale-switcher"`).
- Feature strings extracted to message namespaces: `nav`, `feed`, `helpNew`, `helpForm`, `helpRequest`, `mentor`, `locale`.

## Verification

```bash
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web test:e2e
pnpm verify
```

E2E: `e2e/i18n.spec.ts` (FR `/`, EN `/en`, switcher, `/en/help/new`).

## Branch

`feat/75-i18n-web` — `Refs #75`
