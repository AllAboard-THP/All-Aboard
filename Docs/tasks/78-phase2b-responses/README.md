# Phase 2b — Réponses & communauté (MOC)

**Issue epic** : [#78](https://github.com/AllAboard-THP/All-Aboard/issues/78) — **clôturée** (toutes les sous-tâches #79–#83 livrées).

Combler l’écart MOC vs MVP sur le fil de réponses aux demandes d’aide ([moc-parcours-utilisateur.md](../../moc-parcours-utilisateur.md)).

## Sous-tâches

| Issue | Scope | Statut | PR |
|-------|--------|--------|-----|
| [#79](https://github.com/AllAboard-THP/All-Aboard/issues/79) | API + DB `responses` + `POST` authentifié | ✅ | [#84](https://github.com/AllAboard-THP/All-Aboard/pull/84) |
| [#80](https://github.com/AllAboard-THP/All-Aboard/issues/80) | BFF + TanStack mutation | ✅ | [#84](https://github.com/AllAboard-THP/All-Aboard/pull/84) |
| [#81](https://github.com/AllAboard-THP/All-Aboard/issues/81) | UI thread détail | ✅ | [#84](https://github.com/AllAboard-THP/All-Aboard/pull/84) |
| [#82](https://github.com/AllAboard-THP/All-Aboard/issues/82) | Notifications mentor | ✅ | [#87](https://github.com/AllAboard-THP/All-Aboard/pull/87) |
| [#83](https://github.com/AllAboard-THP/All-Aboard/issues/83) | Filtrage réponses par certification | ✅ | [#88](https://github.com/AllAboard-THP/All-Aboard/pull/88) |

Doc détaillée par lot : [#82 mentor notifications](../82-mentor-notifications/README.md) · [#83 filtrage certifications](../83-response-filtering/README.md) (livré avec PR #88).

## Livraison — thread réponses (#79–#81, PR #84)

- Migration `0002_responses` — table `responses` (FK `help_request_id`, cascade delete).
- `GET /help-requests/:id` — peupler `responses[]` (ordre `created_at`).
- `POST /help-requests/:id/responses` — JWT, corps `{ body }`.
- BFF `POST /api/help-requests/[id]/responses`.
- Page `/requests/[id]` — liste réponses + formulaire (login inline + TanStack invalidation).
- OpenAPI + types `CreateResponseBody` / `CreateResponseResponse`.

### Fichiers (#79–#81)

- `apps/api/src/db/schema.ts`, `apps/api/drizzle/0002_responses.sql`
- `apps/api/src/app.ts`, `apps/api/openapi.yaml`
- `packages/types/src/index.ts`
- `apps/web/app/api/help-requests/[id]/responses/route.ts`
- `apps/web/components/features/help-request-detail-client.tsx`

### Tests (#79–#81)

- `apps/api/src/app.test.ts` — création réponse + détail peuplé
- `apps/web/tests/bff-phase2.test.ts` — relay BFF POST responses

## Livraison — notifications mentor (#82, PR #87)

MOC étapes 6–7 : après publication taguée, le mentor voit une **signalisation** sur le dashboard.

- `GET /mentor/feed` — JWT mentor ; champs `responseCount`, `lastResponseAt`, `hasUnreadForMentor`.
- BFF `GET /api/mentor/feed` — relais Bearer cookie.
- UI `/mentor` — badge carte feed ; badge agrégé lien **Mentor** dans `app-shell-nav.tsx`.
- Types `MentorFeedItem` + OpenAPI alignés.

Voir [82-mentor-notifications/README.md](../82-mentor-notifications/README.md).

## Livraison — filtrage certifications (#83, PR #88)

MOC étape 8 : filtrer les réponses selon certifications / pertinence.

- Migration `0003_user_certifications.sql` — `users.certification_tags` (`text[]`).
- `GET /help-requests/:id?filterByCertifications=true` — mentor JWT ; métadonnées `certificationFilter`.
- BFF relaie le query ; toggle mentor sur fiche demande (`help-request-detail-client.tsx`).

Voir [83-response-filtering/README.md](../83-response-filtering/README.md) (ajouté dans PR #88).

## Hors scope (hors epic #78)

- Réponse finale étudiant (workflow statut).
- Table `notifications` dédiée, WebSocket, marquage lu persistant (#82 Option B).
- Scoring Intuition / filtre sur `GET /mentor/feed` (#83 reporté).

## Smoke manuel (régression Phase 2b)

1. `alice@dev.local` — dashboard `/mentor` : badge si réponse non-mentor sur une demande taguée.
2. Fiche demande mentor — toggle « Filtrer par certifications » (après merge PR #88) : réponses hors tags masquées, demandeur toujours visible.
3. `bob@dev.local` — poster une réponse sur `/requests/[id]`, thread visible sans filtre mentor.
