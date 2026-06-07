# API parité Rails — hub (phases 1–7 + lots A / 5b / 7)

**Référence produit** : maquette `apps/thp-final` (Rails/Turbo, **lecture seule** — pas de port de code).  
**Contrat HTTP** : [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) (version courante **0.10.0**).  
**Plan opérationnel** : [§ Parité Rails](../../plan-mise-en-place-web-api-donnees.md#parité-rails-thp-final--api).  
**Scope** : `apps/api`, `apps/agent`, `packages/types`, migrations Drizzle — **pas** `apps/web` (BFF/UI en parallèle).

## Objectif

Aligner progressivement l’API Fastify MVP sur les parcours et endpoints de la maquette THP Rails, par lots livrables et versionnés (OpenAPI + migrations + doc tâche).

---

## Phases principales

| Phase | Focus | OpenAPI | Migration | Doc tâche | Statut |
|-------|--------|---------|-----------|-----------|--------|
| **1** | Feed enrichi, subjects, CRUD demande, help-mentor | ≥ 0.3.0 | `0005_api_rails_phase1.sql` | [phase1](../api-rails-parity-phase1/README.md) | ✅ Dev |
| **2** | Likes, bookmarks, `/me/*`, CRUD réponses | ≥ 0.4.0 | `0006_api_rails_phase2_social.sql` | [phase2](../api-rails-parity-phase2/README.md) | ✅ Dev |
| **3** | Auth register, profils, CGU, profil public | ≥ 0.5.0 | `0007_api_rails_phase3_users_auth.sql` | [phase3](../api-rails-parity-phase3/README.md) | ✅ Dev |
| **4** | Resources, subject requests, mentor dashboard | ≥ 0.6.0 | `0008_api_rails_phase4_resources.sql` | [phase4](../api-rails-parity-phase4/README.md) | ✅ Dev |
| **5** | Messagerie REST (conversations, messages) | ≥ 0.7.0 | `0009_api_rails_phase5_conversations.sql` | [phase5](../api-rails-parity-phase5/README.md) | ✅ Dev |
| **6** | Admin, modération, denylist, rôles | ≥ 0.8.0 | `0010_api_rails_phase6_admin.sql` | [phase6](../api-rails-parity-phase6/README.md) | ✅ Dev |

---

## Lots complémentaires (gaps de parité)

| Lot | Focus | OpenAPI | Migration / deps | Doc tâche | Statut |
|-----|--------|---------|------------------|-----------|--------|
| **A** | Soft delete post + reject resource mentor | 0.8.1 | `0011_api_soft_delete_help_requests.sql` | [api-parity-delete-reject](../api-parity-delete-reject/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |
| **5b** | Chat temps réel WebSocket | 0.9.0 | `@fastify/websocket` | [phase5b](../api-rails-parity-phase5b/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |
| **7** | Suggest-tags + `ai_summary` à la résolution | 0.10.0 | outbox + `apps/agent` | [phase7](../api-rails-parity-phase7/README.md) | PR [#104](https://github.com/AllAboard-THP/All-Aboard/pull/104) |

---

## Carte des routes (modules)

| Module | Fichier |
|--------|---------|
| Feed, subjects | `apps/api/src/routes/{feed,subjects}.ts` |
| Demandes, réponses, suggest-tags | `apps/api/src/routes/{help-requests,suggest-tags}.ts` |
| Social, listes perso | `apps/api/src/routes/{social,me}.ts` |
| Auth, profils, CGU | `apps/api/src/routes/{auth,users,legal}.ts` |
| Resources, mentor | `apps/api/src/routes/{resources,subject-requests,mentor}.ts` |
| Chat REST + WS | `apps/api/src/routes/{conversations,conversations-ws}.ts` |
| Admin | `apps/api/src/routes/admin.ts` |
| Agent (tags, summary) | `apps/agent/src/{tag-suggest,summary-generate}.ts` ; proxy `apps/api/src/agent/` |

---

## Vérification commune

```bash
pnpm --filter @allaboard/types build
pnpm --filter agent test
pnpm --filter api test    # Postgres + MVP_LOGIN_PASSWORD pour la suite DB
pnpm verify
```

Appliquer les migrations sur l’environnement cible avant smoke (`pnpm --filter api run db:migrate`).

---

## Hors scope (confirmé)

- BFF / pages Next (`apps/web`) — consommation ou relais à ajouter par écran
- Phase 3b (confirmation email, reset password)
- Events Ticketmaster (`apps/thp-final`)
- Modération Claude (phase 6 = regex + denylist)
- Redis pub/sub multi-instance pour WebSocket (note doc 5b uniquement)

## Fichiers

| Fichier | Rôle |
|---------|------|
| `README.md` | Ce hub — index des phases et lots |

## Doc canonique (lecture)

- [Docs/README.md](../../README.md)
- [map-of-content.md](../../map-of-content.md)
- [moc-parcours-utilisateur.md](../../moc-parcours-utilisateur.md)
