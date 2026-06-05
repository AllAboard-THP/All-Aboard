# API parité Rails — Lot A (soft delete + reject resource mentor)

**PR** : [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104)  
**OpenAPI** : `0.8.1` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prérequis** : [Phase 6](../api-rails-parity-phase6/README.md) (modération admin), [Phase 4](../api-rails-parity-phase4/README.md) (resources mentor)  
**Référence Rails** : `posts#destroy`, `Mentor::ResourcesController#reject` (`apps/thp-final`)

## Objectif

Combler les trous CRUD restants : suppression de post par l’auteur (soft delete) et rejet de ressource mentor en attente, sans toucher l’UI/BFF.

## Migration `0011_api_soft_delete_help_requests.sql`

- Colonne `help_requests.deleted_at` (`timestamptz`, nullable) + index partiel
- Schéma Drizzle : `deletedAt` dans [`apps/api/src/db/schema.ts`](../../../apps/api/src/db/schema.ts)

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `DELETE /help-requests/:id` | JWT auteur ou `admin` | Soft delete : `deleted_at = now()` ; `204` |
| `POST /mentor/resources/:id/reject` | JWT mentor (scope sujet) ou `admin` | Ressource `pending` → `status: rejected` ; `{ item: Resource }` |

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `DELETE /help-requests/:id` | Décrémente `subjects.posts_count` si `subjectId` ; réutilise `adjustSubjectPostsCount` |
| Fil public (`GET /feed`, listes publiques) | Exclut `deleted_at IS NOT NULL` (comme `flagged_for_moderation`) |
| `GET /help-requests/:id` | Auteur et admin voient le post supprimé ; public → **404** |
| `GET /me/help-requests`, bookmarks | Excluent les posts supprimés pour l’auteur |
| Admin `POST …/moderation/help-requests/:id/reject` | **Hard delete** inchangé (modération) |
| `POST /mentor/resources/:id/reject` | Mêmes garde-fous que `approve` ; ressource disparaît du pending dashboard |

## Modules code

| Fichier | Rôle |
|---------|------|
| [`apps/api/src/routes/help-requests.ts`](../../../apps/api/src/routes/help-requests.ts) | `DELETE /help-requests/:id` |
| [`apps/api/src/routes/mentor.ts`](../../../apps/api/src/routes/mentor.ts) | `POST …/reject` |
| [`apps/api/src/lib/feed-query.ts`](../../../apps/api/src/lib/feed-query.ts) | `feedPublicVisibility` inclut `deleted_at IS NULL` |
| [`apps/api/src/lib/help-request-query.ts`](../../../apps/api/src/lib/help-request-query.ts) | Chargement détail avec règle auteur/admin |

## Types

[`packages/types`](../../../packages/types/src/index.ts) : `deletedAt?` sur `HelpRequest` (visible pour auteur/admin).

## Vérification

```bash
pnpm --filter @allaboard/types build
pnpm --filter api test
```

## Suite

- **Phase 5b** (chat WS) : [api-rails-parity-phase5b](../api-rails-parity-phase5b/README.md)
- **Phase 7** (IA) : [api-rails-parity-phase7](../api-rails-parity-phase7/README.md)
- Hub : [api-rails-parity](../api-rails-parity/README.md)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce fichier |
