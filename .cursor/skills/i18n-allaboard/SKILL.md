---
name: i18n-allaboard
description: >-
  Conventions i18n All-Aboard (next-intl, apps/web). Use when adding or
  migrating translated UI strings, locale routing, LocaleSwitcher, or messages
  JSON in apps/web.
---

# i18n — All-Aboard (`apps/web`)

## Stack

- **next-intl** · App Router Next.js 15
- Locales : `fr` (default), `en`
- URLs : `localePrefix: 'as-needed'` — FR `/`, EN `/en/...`
- Messages : `apps/web/messages/fr.json`, `en.json`

## Navigation

```tsx
import { Link, useRouter, usePathname } from "@/i18n/navigation";
```

Ne pas importer `next/link` ni `next/navigation` dans `apps/web/components/features/`.

## Traductions

| Contexte | API |
|----------|-----|
| Server Component | `getTranslations('namespace')` from `next-intl/server` |
| Client Component | `useTranslations('namespace')` |
| Dates | `formatDateTime(iso, locale)` — `apps/web/lib/format-datetime.ts` |
| Erreurs API | `map-api-error.ts` + clés `errors.*` — codes API inchangés |

## Hors scope

- `packages/ui` — pas de textes métier
- `apps/api` — pas de traduction JSON côté API
- Contenu utilisateur (titres demandes) — non traduit

## Parité JSON

`fr.json` et `en.json` doivent avoir **exactement les mêmes clés**.

## Issue

GitHub #75 · branche `feat/75-i18n-web`
