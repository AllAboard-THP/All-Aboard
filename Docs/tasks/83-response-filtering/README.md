# #83 — Certification-based response filtering (MVP)

Issue: [#83](https://github.com/AllAboard-THP/All-Aboard/issues/83) · Epic: [#78](https://github.com/AllAboard-THP/All-Aboard/issues/78)

## Data model

Column `users.certification_tags` (`text[]`, default `{}`). Dev seed: Alice (`alice@dev.local`) gets `react`, `typescript`, `rails`.

## Filter rule (MOC step 8)

On `GET /help-requests/:id?filterByCertifications=true` (**mentor** JWT only):

- Keep a response if the author is the **requester** (`help_requests.author_id`), or
- If the author shares at least one certification tag with `help_requests.tags` (case-insensitive comparison).

Response includes `certificationFilter: { applied, totalCount, visibleCount }`.

## Auth

| Case | Code |
|------|------|
| Filter without JWT | `401` |
| Filter with student role | `403` |
| No query param (public) | all responses |

## Web

- Mentor toggle on request detail (`mentor-cert-filter-toggle`), enabled by default for logged-in mentors.
- BFF `GET /api/help-requests/[id]` relays query + Bearer cookie.

## Out of scope

- Intuition GraphQL scoring (#67)
- Filter on `GET /mentor/feed` (deferred option)
- Normalized `user_certifications` table (`text[]` tags sufficient for MVP)
