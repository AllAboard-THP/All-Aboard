# API parité Rails — Phase 4 (resources & subject requests)

**Branche** : `feat/api-rails-parity-phase4`  
**OpenAPI** : `0.6.0` — [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml)  
**Prérequis** : [Phase 3](../api-rails-parity-phase3/README.md)

## Objectif

Ressources pédagogiques, demandes de nouvelles matières et tableau de bord mentor (file d’approbation).

## Migration `0008_api_rails_phase4_resources.sql`

- Tables `resources`, `resource_tags`, `subject_requests`
- Seed : compétence mentor Alice → subject `react`

## Endpoints

| Route | Auth | Description |
|-------|------|-------------|
| `GET /resources` | public | Publiées uniquement ; `?q=` recherche |
| `POST /resources` | JWT | Student → `pending` ; mentor/admin → `published` |
| `GET /resources/:id` | public | Détail ressource publiée |
| `PATCH /resources/:id` | JWT auteur | Édition |
| `DELETE /resources/:id` | JWT auteur | Suppression |
| `POST /subject-requests` | JWT | Demande nouvelle matière |
| `GET /mentor/dashboard` | mentor JWT | Stats + ressources + pending + `helpMentorQueue` |
| `POST /mentor/resources/:id/approve` | mentor JWT | `pending` → `published` |

`GET /mentor/feed` inchangé (compat #82).

## Behaviour (Rails-aligned)

| Action | Rule |
|--------|------|
| `POST /resources` | Workflow publication selon rôle |
| `GET /resources` | Published only ; recherche title/body/subject/tags |
| `POST /mentor/resources/:id/approve` | Ressource pending sur sujet de compétence mentor |
| `GET /mentor/dashboard` | Stats + own resources + pending queue + file help-mentor |

## Modules code

| Fichier | Rôle |
|---------|------|
| [`apps/api/src/routes/resources.ts`](../../../apps/api/src/routes/resources.ts) | CRUD resources |
| [`apps/api/src/routes/subject-requests.ts`](../../../apps/api/src/routes/subject-requests.ts) | Demandes matière |
| [`apps/api/src/routes/mentor.ts`](../../../apps/api/src/routes/mentor.ts) | Dashboard, approve |

## Types

[`packages/types`](../../../packages/types/src/index.ts) : `Resource`, `SubjectRequest`, `MentorDashboardResponse`, etc.

## Vérification

```bash
pnpm --filter api exec tsc --noEmit
pnpm --filter api test
```

## Suite

**Phase 5** : [api-rails-parity-phase5](../api-rails-parity-phase5/README.md)  
**Lot A reject** (complément) : [api-parity-delete-reject](../api-parity-delete-reject/README.md)  
Hub : [api-rails-parity](../api-rails-parity/README.md)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce fichier |
