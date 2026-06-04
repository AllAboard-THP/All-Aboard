# API Rails parity — Phase 5 (messagerie REST)

## Scope

- Migration `0009_api_rails_phase5_conversations.sql` : `conversations`, `conversation_participants`, `messages`
- Routes JWT :
  - `GET /conversations` — inbox (peer, last message, unread count)
  - `POST /conversations` — `{ recipientId, helpRequestId? }` (direct_key, topic depuis la demande)
  - `GET /conversations/:id/messages` — historique paginé (`page`, `limit`)
  - `POST /conversations/:id/messages` — corps `{ body }`, réponse `as_chat_json` Rails-like
  - `PATCH /conversations/:id/read` — `last_read_at`
- Types `@allaboard/types` + OpenAPI `0.7.0`
- WebSocket / SSE : **phase 5b** (hors ce lot)

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `POST /conversations` | `find_or_create` via `direct_key` (UUID triés) ; 201 si nouveau, 200 si existant |
| Unread | Messages des autres après `last_read_at` du participant |
| `POST …/messages` | Met à jour `conversations.updated_at` ; marque lu pour l’expéditeur |
| Accès | Participant uniquement (sinon 403) |

Référence maquette : `apps/thp-final` (`Conversation`, `Message#as_chat_json`).

## Verify

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test   # Postgres + MVP_LOGIN_PASSWORD pour la suite DB
```
