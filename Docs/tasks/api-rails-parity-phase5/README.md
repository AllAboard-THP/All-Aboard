# Rails API parity — Phase 5 (REST messaging)

**Branch:** `feat/api-rails-parity-phase5`  
**OpenAPI:** `0.7.0` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prerequisite:** [Phase 3](../api-rails-parity-phase3/README.md) (user profiles)

## Goal

Direct messaging between users (inbox, history, send, mark read) — Rails REST parity before 5b real-time.

## Migration `0009_api_rails_phase5_conversations.sql`

- Tables `conversations`, `conversation_participants`, `messages`

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `GET /conversations` | JWT | Inbox (peer, last message, unread count) |
| `POST /conversations` | JWT | `{ recipientId, helpRequestId? }` — `direct_key`, topic from request |
| `GET /conversations/:id/messages` | JWT | Paginated history (`page`, `limit`) |
| `POST /conversations/:id/messages` | JWT | `{ body }` → `ChatMessage` (Rails-like `as_chat_json`) |
| `PATCH /conversations/:id/read` | JWT | Updates `last_read_at` |

**Real-time:** [Phase 5b](../api-rails-parity-phase5b/README.md) — `GET /conversations/:id/ws`.

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `POST /conversations` | `find_or_create` via `direct_key` (sorted UUIDs); 201 if new, 200 if existing |
| Unread | Messages from others after participant `last_read_at` |
| `POST …/messages` | Updates `conversations.updated_at`; marks read for sender |
| Access | Participant only (else 403) |

Reference mockup: `apps/thp-final` (`Conversation`, `Message#as_chat_json`).

## Code modules

| File | Role |
|------|------|
| [`apps/api/src/routes/conversations.ts`](../../../apps/api/src/routes/conversations.ts) | REST routes |
| [`apps/api/src/services/conversations.ts`](../../../apps/api/src/services/conversations.ts) | Inbox / messages logic |

## Types

[`packages/types`](../../../packages/types/src/index.ts): `ConversationSummary`, `ChatMessage`, `CreateConversationBody`, etc.

## Verification

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test
```

## Next

**Phase 5b** (WebSocket): [api-rails-parity-phase5b](../api-rails-parity-phase5b/README.md)  
**Phase 6:** [api-rails-parity-phase6](../api-rails-parity-phase6/README.md)  
Hub: [api-rails-parity](../api-rails-parity/README.md)

## Files

| File | Role |
|------|------|
| `README.md` | This file |
