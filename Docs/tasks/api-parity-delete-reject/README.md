# API parité — soft delete posts + reject resource mentor

## Scope

- Migration `0011_api_soft_delete_help_requests.sql` : `deleted_at` sur `help_requests`
- `DELETE /help-requests/:id` — soft delete (auteur ou admin), masqué du fil public
- `POST /mentor/resources/:id/reject` — miroir de `approve` → `status: rejected`
- OpenAPI **0.8.1**

## Behaviour

| Action | Rule |
|--------|------|
| `DELETE /help-requests/:id` | `deleted_at = now()` ; décrémente `subjects.posts_count` |
| Fil public | Exclut `deleted_at IS NOT NULL` (comme modération) |
| Détail | Auteur/admin voient le post supprimé ; public → 404 |
| Admin moderation reject | Hard delete inchangé |

## Verify

```bash
pnpm --filter @allaboard/types build
pnpm --filter api test
```
