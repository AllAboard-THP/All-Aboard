# API parité Rails — Phase 6 (admin & modération)

**Branche** : `feat/api-rails-parity-phase6`  
**PR** : [#102](https://github.com/AllAboard-THP/All-Aboard/pull/102)  
**OpenAPI** : `0.8.0` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prérequis** : [Phase 1](../api-rails-parity-phase1/README.md) (feed, help-requests)

## Objectif

Espace admin : modération contenu, denylist regex, gestion rôles et files subject-requests.

## Migration `0010_api_rails_phase6_admin.sql`

- Table `denylist_patterns`
- Colonnes `flagged_for_moderation` sur `help_requests` / `responses`
- Service [`profanity.ts`](../../../apps/api/src/services/profanity.ts) (regex + patterns actifs, sans Claude)
- Seed : `admin@dev.local` (même mot de passe que comptes dev)

## Endpoints

| Route | Description |
|-------|-------------|
| `GET /admin/dashboard` | Compteurs + 10 dernières demandes non flaggées |
| `GET /admin/moderation` | File posts + réponses flaggés |
| `POST /admin/moderation/help-requests/:id/approve` | Publier (déflag) |
| `POST /admin/moderation/help-requests/:id/reject` | **Hard delete** demande |
| `POST /admin/moderation/responses/:id/approve` | Publier commentaire |
| `POST /admin/moderation/responses/:id/reject` | Supprimer commentaire |
| `GET/POST /admin/denylist-patterns` | Liste + création regex |
| `PATCH/DELETE /admin/denylist-patterns/:id` | Activer/désactiver, supprimer |
| `GET /admin/users` | Liste utilisateurs |
| `POST /admin/users/:id/promote-admin` | `{ admin: true \| false }` |
| `POST /admin/users/:id/promote-mentor` | Bascule student ↔ mentor |
| `GET /admin/subject-requests` | Files pending / approved / rejected |
| `PATCH /admin/subject-requests/:id` | `{ status }` |

## Visibilité publique

- `GET /feed` : exclut contenu `flagged_for_moderation`
- Détail / réponses : filtrés sauf auteur et admin

## Modules code

| Fichier | Rôle |
|---------|------|
| [`apps/api/src/routes/admin.ts`](../../../apps/api/src/routes/admin.ts) | Namespace `/admin/*` |
| [`apps/api/src/lib/feed-query.ts`](../../../apps/api/src/lib/feed-query.ts) | Filtre modération feed |

## Types

[`packages/types`](../../../packages/types/src/index.ts) : types admin dashboard, moderation, denylist, etc.

## Vérification

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test
```

## Suite

**Lot A** (soft delete auteur + reject resource mentor) : [api-parity-delete-reject](../api-parity-delete-reject/README.md)  
Hub : [api-rails-parity](../api-rails-parity/README.md)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce fichier |
