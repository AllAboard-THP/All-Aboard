# API Rails parity — Phase 6 (admin & modération)

## Scope

- Migration `0010_api_rails_phase6_admin.sql` : `denylist_patterns`, `flagged_for_moderation` sur `help_requests` / `responses`
- Service `profanity.ts` (regex + patterns actifs, sans appel Claude)
- Routes `/admin/*` (JWT rôle `admin`)
- Fil public : contenu flaggé exclu de `GET /feed` ; détail/réponses filtrés sauf auteur/admin
- Types `@allaboard/types` + OpenAPI `0.8.0`
- Seed : `admin@dev.local` (même mot de passe que les autres comptes dev)

## Endpoints

| Route | Description |
|-------|-------------|
| `GET /admin/dashboard` | Compteurs + 10 dernières demandes non flaggées |
| `GET /admin/moderation` | File posts + réponses flaggés |
| `POST /admin/moderation/help-requests/:id/approve` | Publier (déflag) |
| `POST /admin/moderation/help-requests/:id/reject` | Supprimer la demande |
| `POST /admin/moderation/responses/:id/approve` | Publier commentaire |
| `POST /admin/moderation/responses/:id/reject` | Supprimer commentaire |
| `GET/POST /admin/denylist-patterns` | Liste + création regex |
| `PATCH/DELETE /admin/denylist-patterns/:id` | Activer/désactiver, supprimer |
| `GET /admin/users` | Liste utilisateurs |
| `POST /admin/users/:id/promote-admin` | `{ admin: true \| false }` |
| `POST /admin/users/:id/promote-mentor` | Bascule student ↔ mentor |
| `GET /admin/subject-requests` | Files pending / approved / rejected |
| `PATCH /admin/subject-requests/:id` | `{ status }` |

## Verify

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test   # Postgres + MVP_LOGIN_PASSWORD pour la suite DB
```
