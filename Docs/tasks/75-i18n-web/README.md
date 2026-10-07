# Issue #75 — Web i18n (next-intl)

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/75  
**ADR** : [0005 — i18n web (next-intl)](../../adr/0005-i18n-web-next-intl.md)  
**Branche** : `feat/i18n-75-complete` — `Refs #75`

## Objectif

Internationaliser `apps/web` (FR défaut, EN préfixé) sans toucher à l'API ni à `packages/ui`. Couche erreurs BFF/API traduite à l'affichage.

## Scope

- `apps/web` uniquement (API et `packages/ui` inchangés).
- Locales : `fr` (défaut, pas de préfixe URL), `en` (`/en/...`).
- `localePrefix: as-needed` via middleware next-intl.
- Contenu utilisateur (titres, réponses) : **non traduit**.

## Livrables

### Infra i18n (socle initial)

- [x] `i18n/routing.ts`, `request.ts`, `navigation.ts` + middleware
- [x] Pages sous `app/[locale]/(app)/` ; BFF `app/api/**` hors locale
- [x] `LocaleSwitcher` dans `AppShell` (`data-testid="locale-switcher"`)
- [x] Messages FR/EN — namespaces feature (`nav`, `feed`, `helpNew`, `helpForm`, `helpRequest`, `mentor`, `locale`)
- [x] Tests Vitest : `tests/render-with-intl.tsx`, mocks `next-intl/server`

### Lot 1 — couche erreurs API (complément)

- [x] `apps/web/lib/map-api-error.ts` — codes HTTP / corps API → clés `errors.*`
- [x] Namespace `errors` dans `messages/fr.json` et `messages/en.json` (parité stricte)
- [x] `help-request-form.tsx` et `help-request-detail-client.tsx` — `mapApiError()` + `useTranslations('errors')`
- [x] Tests unitaires `apps/web/tests/map-api-error.test.ts`
- [x] E2E `e2e/i18n.spec.ts` — routing, switcher bidirectionnel, erreurs API localisées, not-found

### Extension progressive (futurs écrans)

- Toute nouvelle page sous `app/[locale]/(app)/` (explore, admin, etc.) : clés dans les deux JSON, liens via `@/i18n/navigation`.
- Erreurs SSR (`feedError`, `detailError`) : traduire via `mapApiError` quand le code machine-readable est disponible (hors scope initial du lot 1).

## Layout

| Path | Role |
|------|------|
| `apps/web/i18n/routing.ts` | Locales + stratégie de préfixe |
| `apps/web/i18n/request.ts` | Chargement messages côté serveur |
| `apps/web/i18n/navigation.ts` | `Link`, `useRouter`, `usePathname` locale-aware |
| `apps/web/messages/{fr,en}.json` | Copie UI |
| `apps/web/middleware.ts` | Détection / redirection locale |
| `apps/web/app/[locale]/(app)/` | Routes app localisées |
| `apps/web/app/api/` | BFF (sans segment locale) |
| `apps/web/lib/map-api-error.ts` | Codes erreur API → clés `errors.*` |

## Namespaces messages

| Namespace | Usage |
|-----------|--------|
| `metadata` | Titre document (`<title>`) |
| `common` | Libellés transverses (marque, tags, états pending) |
| `errors` | Messages utilisateur mappés depuis l'API/BFF (`mapApiError`) |
| `nav` | Navigation AppShell |
| `locale` | LocaleSwitcher (aria, libellés FR/EN) |
| `feed` | Page d'accueil / feed communautaire |
| `helpNew` | En-tête page création demande |
| `helpForm` | Formulaire création (champs, doublon MOC, Rubberduck) |
| `helpRequest` | Détail demande, réponses, filtre certifications |
| `mentor` | Dashboard mentor (auth, feed, badges) |

## Couche erreurs API

Les codes Fastify/BFF restent **machine-readable** (`invalid_credentials`, `content_moderation`, …). La traduction se fait côté web :

```tsx
import { mapApiError, ApiRequestError } from "@/lib/map-api-error";

const tErrors = useTranslations("errors");
const message =
  error instanceof ApiRequestError
    ? tErrors(mapApiError({ status: error.status, body: { error: error.code } }))
    : null;
```

### Codes mappés (`errors.*`)

| Code API | Clé i18n |
|----------|----------|
| `invalid_credentials` | `invalidCredentials` |
| `unauthorized`, HTTP 401 | `unauthorized` |
| `missing_token` | `missingToken` |
| `forbidden`, HTTP 403 | `forbidden` |
| `not_found`, HTTP 404 | `notFound` |
| `duplicate` | `duplicate` |
| HTTP 409 | `conflict` |
| `invalid_body` | `invalidBody` |
| `invalid_subject` | `invalidSubject` |
| `database_unavailable`, HTTP 503 | `serviceUnavailable` |
| `insert_failed`, `update_failed`, `create_failed`, HTTP 500 | `serverError` |
| `email_taken` | `emailTaken` |
| `login_not_configured` | `loginNotConfigured` |
| `user_not_found` | `userNotFound` |
| `invalid_regex` | `invalidRegex` |
| `content_moderation` | `contentModeration` |
| (autre) | `unknown` |

## UI

- `LocaleSwitcher` : `locale-switch-fr` / `locale-switch-en` pour les tests.
- Feature strings : namespaces listés ci-dessus ; pas de texte en dur dans `components/features/`.

## Vérification

```bash
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web exec playwright test e2e/i18n.spec.ts
pnpm verify
```

Prérequis E2E : `DATABASE_URL` (voir `scripts/e2e-serve.sh`).

## Références agent

- Skill : `.cursor/skills/i18n-allaboard/SKILL.md`
- Règle Cursor : `.cursor/rules/i18n.mdc`
