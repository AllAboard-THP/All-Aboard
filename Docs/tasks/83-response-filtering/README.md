# #83 — Filtrage réponses par certification (MVP)

Issue : [#83](https://github.com/AllAboard-THP/All-Aboard/issues/83) · Epic : [#78](https://github.com/AllAboard-THP/All-Aboard/issues/78)

## Modèle données

Colonne `users.certification_tags` (`text[]`, défaut `{}`). Seed dev : Alice (`alice@dev.local`) reçoit `react`, `typescript`, `rails`.

## Règle filtre (MOC étape 8)

Sur `GET /help-requests/:id?filterByCertifications=true` (JWT **mentor** uniquement) :

- Conserver une réponse si l’auteur est le **demandeur** (`help_requests.author_id`), ou
- Si l’auteur a au moins un tag de certification en commun avec `help_requests.tags` (comparaison insensible à la casse).

Réponse inclut `certificationFilter: { applied, totalCount, visibleCount }`.

## Auth

| Cas | Code |
|-----|------|
| Filtre sans JWT | `401` |
| Filtre avec rôle student | `403` |
| Sans query (public) | toutes les réponses |

## Web

- Toggle mentor sur la fiche demande (`mentor-cert-filter-toggle`), activé par défaut pour les mentors connectés.
- BFF `GET /api/help-requests/[id]` relaie le query + cookie Bearer.

## Hors scope

- Scoring Intuition GraphQL (#67)
- Filtre sur `GET /mentor/feed` (option reportée)
- Table `user_certifications` normalisée (tags `text[]` suffisent au MVP)
