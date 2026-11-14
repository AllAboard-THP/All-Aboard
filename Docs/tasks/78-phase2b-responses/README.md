# Phase 2b — Responses & community (MOC)

**Epic issue:** [#78](https://github.com/AllAboard-THP/All-Aboard/issues/78) — **closed** (all sub-tasks #79–#83 shipped).

Close the MOC vs MVP gap on help-request response threads ([product/user-journeys.md](../../product/user-journeys.md)).

## Sub-tasks

| Issue | Scope | Status | PR |
|-------|--------|--------|-----|
| [#79](https://github.com/AllAboard-THP/All-Aboard/issues/79) | API + DB `responses` + authenticated `POST` | ✅ | [#84](https://github.com/AllAboard-THP/All-Aboard/pull/84) |
| [#80](https://github.com/AllAboard-THP/All-Aboard/issues/80) | BFF + TanStack mutation | ✅ | [#84](https://github.com/AllAboard-THP/All-Aboard/pull/84) |
| [#81](https://github.com/AllAboard-THP/All-Aboard/issues/81) | Detail thread UI | ✅ | [#84](https://github.com/AllAboard-THP/All-Aboard/pull/84) |
| [#82](https://github.com/AllAboard-THP/All-Aboard/issues/82) | Mentor notifications | ✅ | [#87](https://github.com/AllAboard-THP/All-Aboard/pull/87) |
| [#83](https://github.com/AllAboard-THP/All-Aboard/issues/83) | Certification response filtering | ✅ | [#88](https://github.com/AllAboard-THP/All-Aboard/pull/88) |

Per-batch detail: [#82 mentor notifications](../82-mentor-notifications/README.md) · [#83 certification filtering](../83-response-filtering/README.md) (shipped with PR #88).

## Delivery — response thread (#79–#81, PR #84)

- Migration `0002_responses` — `responses` table (FK `help_request_id`, cascade delete).
- `GET /help-requests/:id` — populate `responses[]` (`created_at` order).
- `POST /help-requests/:id/responses` — JWT, body `{ body }`.
- BFF `POST /api/help-requests/[id]/responses`.
- Page `/requests/[id]` — response list + form (inline login + TanStack invalidation).
- OpenAPI + types `CreateResponseBody` / `CreateResponseResponse`.

### Files (#79–#81)

- `apps/api/src/db/schema.ts`, `apps/api/drizzle/0002_responses.sql`
- `apps/api/src/app.ts`, `apps/api/openapi.yaml`
- `packages/types/src/index.ts`
- `apps/web/app/api/help-requests/[id]/responses/route.ts`
- `apps/web/components/features/help-request-detail-client.tsx`

### Tests (#79–#81)

- `apps/api/src/app.test.ts` — response creation + populated detail
- `apps/web/tests/bff-phase2.test.ts` — BFF POST responses relay

## Delivery — mentor notifications (#82, PR #87)

MOC steps 6–7: after tagged publication, mentor sees **signalling** on dashboard.

- `GET /mentor/feed` — mentor JWT; fields `responseCount`, `lastResponseAt`, `hasUnreadForMentor`.
- BFF `GET /api/mentor/feed` — Bearer cookie relay.
- UI `/mentor` — feed card badge; aggregate badge on **Mentor** link in `app-shell-nav.tsx`.
- Types `MentorFeedItem` + OpenAPI aligned.

See [82-mentor-notifications/README.md](../82-mentor-notifications/README.md).

## Delivery — certification filtering (#83, PR #88)

MOC step 8: filter responses by certifications / relevance.

- Migration `0003_user_certifications.sql` — `users.certification_tags` (`text[]`).
- `GET /help-requests/:id?filterByCertifications=true` — mentor JWT; `certificationFilter` metadata.
- BFF relays query; mentor toggle on request detail (`help-request-detail-client.tsx`).

See [83-response-filtering/README.md](../83-response-filtering/README.md) (added in PR #88).

## Out of scope (outside epic #78)

- Student final answer (status workflow).
- Dedicated `notifications` table, WebSocket, persistent read marking (#82 Option B).
- Intuition scoring / filter on `GET /mentor/feed` (#83 deferred).

## Manual smoke (Phase 2b regression)

1. `alice@dev.local` — dashboard `/mentor`: badge if non-mentor response on tagged request.
2. Mentor request detail — "Filter by certifications" toggle (after PR #88 merge): responses outside tags hidden, requester always visible.
3. `bob@dev.local` — post response on `/requests/[id]`, thread visible without mentor filter.
