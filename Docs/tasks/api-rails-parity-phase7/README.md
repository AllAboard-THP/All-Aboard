# API Rails parity — Phase 7 (suggest-tags + ai_summary)

## Scope

- Agent : `POST /tags/suggest`, `POST /summary/generate` (stub ; LLM optionnel plus tard)
- API : `POST /help-requests/suggest-tags` (JWT, proxy `AGENT_URL`)
- Outbox `help_request.summary_requested` quand `PATCH` passe `status` → `resolved`
- Worker `AI_SUMMARY_ENABLED=true` → remplit `help_requests.ai_summary`
- OpenAPI **0.10.0**

## Env

| Variable | Service | Rôle |
|----------|---------|------|
| `AGENT_URL` | API | Proxy tags + summary |
| `AI_SUMMARY_ENABLED` | API | Active le poll worker (défaut off) |

## Verify

```bash
pnpm --filter @allaboard/types build
pnpm --filter agent test
pnpm --filter api test
```
