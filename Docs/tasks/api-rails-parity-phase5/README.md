# API parité Rails — Phase 5 (messagerie REST)

**Branche** : `feat/api-rails-parity-phase5`  
**OpenAPI** : `0.7.0` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prérequis** : [Phase 3](../api-rails-parity-phase3/README.md) (profils utilisateurs)

## Objectif

Messagerie directe entre utilisateurs (inbox, historique, envoi, marquage lu) — parité REST Rails avant le temps réel 5b.

## Migration `0009_api_rails_phase5_conversations.sql`

- Tables `conversations`, `conversation_participants`, `messages`

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `GET /conversations` | JWT | Inbox (peer, dernier message, unread count) |
| `POST /conversations` | JWT | `{ recipientId, helpRequestId? }` — `direct_key`, topic depuis la demande |
| `GET /conversations/:id/messages` | JWT | Historique paginé (`page`, `limit`) |
| `POST /conversations/:id/messages` | JWT | `{ body }` → `ChatMessage` (`as_chat_json` Rails-like) |
| `PATCH /conversations/:id/read` | JWT | Met à jour `last_read_at` |

**Temps réel** : [Phase 5b](../api-rails-parity-phase5b/README.md) — `GET /conversations/:id/ws`.

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `POST /conversations` | `find_or_create` via `direct_key` (UUID triés) ; 201 si nouveau, 200 si existant |
| Unread | Messages des autres après `last_read_at` du participant |
| `POST …/messages` | Met à jour `conversations.updated_at` ; marque lu pour l’expéditeur |
| Accès | Participant uniquement (sinon 403) |

Référence maquette : `apps/thp-final` (`Conversation`, `Message#as_chat_json`).

## Modules code

| Fichier | Rôle |
|---------|------|
| [`apps/api/src/routes/conversations.ts`](../../../apps/api/src/routes/conversations.ts) | Routes REST |
| [`apps/api/src/services/conversations.ts`](../../../apps/api/src/services/conversations.ts) | Logique inbox / messages |

## Types

[`packages/types`](../../../packages/types/src/index.ts) : `ConversationSummary`, `ChatMessage`, `CreateConversationBody`, etc.

## Vérification

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test
```

## Suite

**Phase 5b** (WebSocket) : [api-rails-parity-phase5b](../api-rails-parity-phase5b/README.md)  
**Phase 6** : [api-rails-parity-phase6](../api-rails-parity-phase6/README.md)  
Hub : [api-rails-parity](../api-rails-parity/README.md)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce fichier |
