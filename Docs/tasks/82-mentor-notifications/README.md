# #82 — Mentor notifications (MVP)

Issue: [#82](https://github.com/AllAboard-THP/All-Aboard/issues/82) · Epic: [#78](https://github.com/AllAboard-THP/All-Aboard/issues/78)

## MVP decision (Option A)

Enrich `GET /mentor/feed` with response metadata and UI signaling — **without** a `notifications` table or dedicated polling (Option B deferred).

| Field | Rule |
|-------|------|
| `responseCount` | Number of responses on the request |
| `lastResponseAt` | ISO timestamp of latest response, or `null` |
| `hasUnreadForMentor` | `responseCount > 0` and latest response **not** written by the logged-in mentor (JWT `sub`) |

## Auth

`GET /mentor/feed` requires mentor JWT (`401` without token, `403` for student role).

## UI

- Badge on mentor feed cards when `hasUnreadForMentor`
- Aggregate badge on **Mentor** nav link (sum of unread)

## Out of scope

WebSocket, `notifications` table, persistent read marking.
