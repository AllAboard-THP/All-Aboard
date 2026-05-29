# Phase 2b — Réponses & communauté (MOC)

**Issue epic** : [#78](https://github.com/AllAboard-THP/All-Aboard/issues/78)

Combler l’écart MOC vs MVP sur le fil de réponses aux demandes d’aide ([moc-parcours-utilisateur.md](../../moc-parcours-utilisateur.md)).

## Sous-tâches

| Issue | Scope | Statut |
|-------|--------|--------|
| [#79](https://github.com/AllAboard-THP/All-Aboard/issues/79) | API + DB `responses` + `POST` authentifié | ✅ livré (cette branche) |
| [#80](https://github.com/AllAboard-THP/All-Aboard/issues/80) | BFF + TanStack mutation | ✅ livré (cette branche) |
| [#81](https://github.com/AllAboard-THP/All-Aboard/issues/81) | UI thread détail | ✅ livré (cette branche) |
| [#82](https://github.com/AllAboard-THP/All-Aboard/issues/82) | Notifications mentor | ✅ livré (PR #87) |
| [#83](https://github.com/AllAboard-THP/All-Aboard/issues/83) | Filtrage réponses | ✅ livré — [83-response-filtering](../83-response-filtering/README.md) |

## Livraison MVP thread réponses

- Migration `0002_responses` — table `responses` (FK `help_request_id`, cascade delete).
- `GET /help-requests/:id` — peupler `responses[]` (ordre `created_at`).
- `POST /help-requests/:id/responses` — JWT, corps `{ body }`.
- BFF `POST /api/help-requests/[id]/responses`.
- Page `/requests/[id]` — liste réponses + formulaire (login inline + TanStack invalidation).
- OpenAPI + types `CreateResponseBody` / `CreateResponseResponse`.

## Fichiers

- `apps/api/src/db/schema.ts`, `apps/api/drizzle/0002_responses.sql`
- `apps/api/src/app.ts`, `apps/api/openapi.yaml`
- `packages/types/src/index.ts`
- `apps/web/app/api/help-requests/[id]/responses/route.ts`
- `apps/web/components/features/help-request-detail-client.tsx`

## Tests

- `apps/api/src/app.test.ts` — création réponse + détail peuplé
- `apps/web/tests/bff-phase2.test.ts` — relay BFF POST responses

## Hors scope restant

Réponse finale étudiant (workflow statut).
