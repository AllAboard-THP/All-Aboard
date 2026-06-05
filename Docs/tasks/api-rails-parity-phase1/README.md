# API parité Rails — Phase 1 (cœur feed/post)

**Branche :** `feat/api-rails-parity-phase1`  
**OpenAPI :** `0.3.0` (enrichissements feed / help-requests / subjects ; spec courante : [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml))  
**Référence produit :** blocs `Post` / `feed` / `explore` dans `apps/thp-final` (maquette HTML, hors scope Events).

## Objectif

Enrichir le cœur `help_requests` ≈ `Post` Rails sans casser les endpoints MVP : feed filtrable, catalogue matières, création/édition, demande d’aide mentor, compteurs dénormalisés.

## Migration `0005_api_rails_phase1.sql`

- Enum `help_request_status` (`open`, `resolved`)
- Table `subjects` (name, slug, icon, accent_color, description, posts_count)
- Colonnes `help_requests` : body, code_snippet, code_language, urgent, status, mentor_help_requested, subject_id (FK), education_level, ai_summary, likes/responses/bookmarks counts, updated_at
- Colonnes `responses` : code_snippet, code_language ; `created_at` exposé en API
- Index `subject_id`, `status`

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `GET /feed` | public | Filtres `subject` (slug), `tag`, `q` ; `page`, `limit` (max 100) ; `include=widgets` → `widgets.unanswered` |
| `GET /subjects` | public | Catalogue ordonné (explore) |
| `GET /subjects/:slug` | public | Détail matière + `postsCount` |
| `POST /help-requests` | JWT | Body étendu (tous champs optionnels sauf `title`) |
| `PATCH /help-requests/:id` | JWT | Édition auteur ; champs partiels + `status` |
| `POST /help-requests/:id/help-mentor` | JWT | `mentorHelpRequested=true` |
| `GET /help-requests/:id` | public / mentor | Détail enrichi + `responses[]` ; filtre cert inchangé (#83) |
| `POST /help-requests/:id/responses` | JWT | Incrémente `responsesCount` |
| `GET /mentor/feed` | mentor JWT | Tags **ou** `mentorHelpRequested` (compat #82) |

## Modules code

| Fichier | Rôle |
|---------|------|
| [`apps/api/src/routes/feed.ts`](../../../apps/api/src/routes/feed.ts) | `GET /feed` |
| [`apps/api/src/routes/subjects.ts`](../../../apps/api/src/routes/subjects.ts) | Catalogue matières |
| [`apps/api/src/routes/help-requests.ts`](../../../apps/api/src/routes/help-requests.ts) | CRUD demande, réponses, help-mentor |
| [`apps/api/src/lib/mappers.ts`](../../../apps/api/src/lib/mappers.ts) | `rowToHelpRequest`, `rowToSubject` |
| [`apps/api/src/lib/feed-query.ts`](../../../apps/api/src/lib/feed-query.ts) | Filtres Drizzle |
| [`apps/api/src/lib/schemas.ts`](../../../apps/api/src/lib/schemas.ts) | Zod create/update/feed query |

## Types

[`packages/types`](../../../packages/types/src/index.ts) : `HelpRequestStatus`, `Subject`, `SubjectSummary`, `FeedPagination`, `FeedWidgets`, `FeedResponse`, `CreateHelpRequestBody`, `UpdateHelpRequestBody`, champs optionnels sur `HelpRequest` / `Response`.

## Seed

[`apps/api/src/db/seed.ts`](../../../apps/api/src/db/seed.ts) — `seedSubjects()` : javascript, ruby, rails, react, html-css (slugs alignés thp-final).

## Rétrocompatibilité

- `POST /help-requests` avec `{ "title" }` seul → **201** inchangé
- Champs JSON enrichis **optionnels** dans les réponses (clients MVP existants)
- `GET /feed` sans query → `items` + `pagination` (nouveau ; clients qui ne lisent que `items` restent valides)

## BFF web (`apps/web`)

Phase 1 **API-first** : le BFF existant (`GET /api/feed`, `POST /api/help-requests`, …) relaie les réponses enrichies sans routes dédiées subjects/widgets. Écrans explore / cartes post Rails-like : travail `apps/web` en parallèle.

## Vérification

```bash
pnpm --filter api test
pnpm verify
```

## Suite

**Phase 2** (social) : [api-rails-parity-phase2/README.md](../api-rails-parity-phase2/README.md).  
Hub phases 1–7 : [api-rails-parity/README.md](../api-rails-parity/README.md) ; [plan opérationnel](../../plan-mise-en-place-web-api-donnees.md#parité-rails-thp-final--api).

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce fichier |
