# API parité Rails — Phase 1 (cœur feed/post)

Extension additive de l'API Fastify pour rapprocher le modèle `Post` Rails (`apps/thp-final`) sans casser les endpoints MVP existants.

## Livré

- Migration `0005_api_rails_phase1` : table `subjects`, enrichissement `help_requests` / `responses`
- `GET /subjects`, `GET /subjects/:slug`
- `GET /feed` : filtres `subject`, `tag`, `q`, pagination, `include=widgets`
- `POST /help-requests` : body enrichi (body, code, subjectId, urgent…)
- `PATCH /help-requests/:id`, `POST /help-requests/:id/help-mentor`
- `GET /mentor/feed` : inclut aussi `mentorHelpRequested`
- Types `@allaboard/types` + OpenAPI 0.3.0
- Seed subjects (javascript, ruby, rails, react, html-css)

## Rétrocompatibilité

- `POST /help-requests` avec `{ title }` seul → inchangé
- Champs JSON enrichis **optionnels** dans les réponses

## Suite (phases 2–6)

Voir plan `.cursor/plans/api_parité_rails_cf7da0e5.plan.md` : likes/bookmarks, auth profils, resources, chat, admin.

## Tests

```bash
# Sans Postgres (unit)
env -u DATABASE_URL MVP_LOGIN_PASSWORD=dev pnpm --filter api test

# Avec Postgres local
source .env.local.dev && pnpm --filter api test
```
