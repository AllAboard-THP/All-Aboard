# API Rails parity — Phase 5b (chat WebSocket)

## Scope

- `@fastify/websocket` — `GET /conversations/:id/ws`
- Hub broadcast en mémoire ([`chat-broadcast.ts`](../../../apps/api/src/services/chat-broadcast.ts))
- Push `ChatMessage` JSON après `POST /conversations/:id/messages`
- OpenAPI **0.9.0** (documentation upgrade WS)

## Auth

- Cookie `access_token` (login) ou `?token=<JWT>`
- Participant uniquement ; codes fermeture `4401` / `4403`

## Limits

- Mono-instance API (pas de Redis pub/sub dans ce lot)
- Typing / pièces jointes : hors scope

## Verify

```bash
pnpm --filter api test
```
