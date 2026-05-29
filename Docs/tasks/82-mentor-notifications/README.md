# #82 — Notifications mentor (MVP)

Issue : [#82](https://github.com/AllAboard-THP/All-Aboard/issues/82) · Epic : [#78](https://github.com/AllAboard-THP/All-Aboard/issues/78)

## Décision MVP (Option A)

Enrichir `GET /mentor/feed` avec métadonnées de réponses et signalisation UI — **sans** table `notifications` ni polling dédié (Option B reportée).

| Champ | Règle |
|-------|--------|
| `responseCount` | Nombre de réponses sur la demande |
| `lastResponseAt` | ISO de la dernière réponse, ou `null` |
| `hasUnreadForMentor` | `responseCount > 0` et dernière réponse **non** écrite par le mentor connecté (JWT `sub`) |

## Auth

`GET /mentor/feed` exige JWT mentor (`401` sans token, `403` si rôle student).

## UI

- Badge sur cartes feed mentor si `hasUnreadForMentor`
- Badge agrégé sur lien **Mentor** dans la navigation (somme des unread)

## Hors scope

WebSocket, table `notifications`, marquage lu persistant.
