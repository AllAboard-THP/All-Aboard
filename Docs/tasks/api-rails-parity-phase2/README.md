# API parité Rails — Phase 2 (social)

Extension social alignée `apps/thp-final` : likes, bookmarks, listes utilisateur, CRUD réponses.

## Livré

- Migration `0006_api_rails_phase2_social` : tables `likes`, `bookmarks`
- `POST /help-requests/:id/likes` — toggle + counter cache
- `POST /help-requests/:id/bookmarks` — toggle + counter cache
- `GET /me/help-requests` — mes demandes (JWT)
- `GET /me/bookmarks` — mes bookmarks (JWT)
- `PATCH /help-requests/:id/responses/:responseId` — édition auteur
- `DELETE /help-requests/:id/responses/:responseId` — suppression auteur + décrément `responses_count`

## Suite (phase 3)

Auth register/logout, profil `GET/PATCH /users/me`, CGU — voir plan parité Rails.
