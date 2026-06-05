# API parité Rails — Phase 2 (social)

**Branche :** `feat/api-rails-parity-phase2`  
**OpenAPI :** `0.4.0` (tags `social`, `me` ; spec courante : [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml))  
**Prérequis :** [Phase 1](../api-rails-parity-phase1/README.md) (compteurs `likes_count`, `bookmarks_count`, `responses_count` sur `help_requests`).

## Objectif

Interactions sociales et listes utilisateur alignées `likes` / `bookmarks` / `my-posts` / `my-bookmarks` / commentaires enrichis Rails.

## Migration `0006_api_rails_phase2_social.sql`

- Tables `likes`, `bookmarks` (unicité `user_id` + `help_request_id`)
- Counter caches mis à jour en transaction sur toggle / suppression réponse

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `POST /help-requests/:id/likes` | JWT | Toggle like → `{ liked, likesCount, item? }` |
| `POST /help-requests/:id/bookmarks` | JWT | Toggle bookmark → `{ bookmarked, bookmarksCount, item? }` |
| `GET /me/help-requests` | JWT | Mes demandes (auteur = sujet JWT) |
| `GET /me/bookmarks` | JWT | Demandes bookmarkées |
| `PATCH /help-requests/:id/responses/:responseId` | JWT | Édition réponse (auteur) ; body + code optionnels |
| `DELETE /help-requests/:id/responses/:responseId` | JWT | Suppression auteur ; décrémente `responses_count` |

## Modules code

| Fichier | Rôle |
|---------|------|
| [`apps/api/src/routes/social.ts`](../../../apps/api/src/routes/social.ts) | Toggle like / bookmark |
| [`apps/api/src/routes/me.ts`](../../../apps/api/src/routes/me.ts) | Listes `/me/*` |
| [`apps/api/src/routes/help-requests.ts`](../../../apps/api/src/routes/help-requests.ts) | PATCH/DELETE réponses |

## Types

[`packages/types`](../../../packages/types/src/index.ts) : `ToggleLikeResponse`, `ToggleBookmarkResponse`, `MyHelpRequestsResponse`, `UpdateResponseBody`, `UpdateResponseResponse`.

## BFF web (`apps/web`)

Pas de Route Handlers dédiés likes/bookmarks/me en Phase 2 — appels **directs API** depuis le client ou BFF à ajouter lors des écrans « Mes posts » / cartes post. Helper partagé futur : même pattern que [`apps/web/lib/bff-relay.ts`](../../../apps/web/lib/bff-relay.ts) (Phase 3+).

## Rétrocompatibilité

- Endpoints Phase 1 inchangés en surface
- Compteurs absents ou `0` omis dans le JSON mapper (comme Phase 1)

## Vérification

```bash
env -u DATABASE_URL MVP_LOGIN_PASSWORD=dev pnpm --filter api test   # suite unit
source .env.local.dev && pnpm --filter api test                        # suite DB (likes, me, …)
pnpm verify
```

## Suite

**Phase 3** (auth & profils) : [api-rails-parity-phase3/README.md](../api-rails-parity-phase3/README.md).
