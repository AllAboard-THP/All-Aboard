# Issue #172 — Skill certifications, slice 1 (Postgres)

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/172

## Goal

A person who was helped gives a skill +1, with an optional comment, on the profile of the person who helped them. Everything stays in Postgres; nothing is published on-chain yet ([ADR 0009](../../adr/0009-certifications-intuition.md)).

## Files in this folder

| File | Role |
|------|------|
| `README.md` | This index |

## Delivery

| PR | Scope |
| --- | --- |
| 1 — API | Migration, seed, routes, admin skill routes, types, OpenAPI, tests |
| 2 — Web | BFF, "Validated skills" card and +1 form on the public profile, withdraw, i18n |

## API (PR 1)

| Piece | Location |
| --- | --- |
| Migration `skills`, `certifications` | [`apps/api/drizzle/0016_skill_certifications.sql`](../../../apps/api/drizzle/0016_skill_certifications.sql) |
| Drizzle schema | [`apps/api/src/db/schema.ts`](../../../apps/api/src/db/schema.ts) |
| Starter catalogue (`defaultSeedSkills`) | [`apps/api/src/db/seed.ts`](../../../apps/api/src/db/seed.ts) |
| Public and +1 routes | [`apps/api/src/routes/certifications.ts`](../../../apps/api/src/routes/certifications.ts) |
| Admin skill routes | [`apps/api/src/routes/admin.ts`](../../../apps/api/src/routes/admin.ts) |
| Tests | [`apps/api/src/routes/certifications.test.ts`](../../../apps/api/src/routes/certifications.test.ts) |
| Contract | [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml), [`packages/types`](../../../packages/types/src/index.ts) |

### Routes

| Route | Auth | Role |
| --- | --- | --- |
| `GET /skills` | — | Active skills for the +1 menu |
| `GET /users/:id/certifications` | — | +1s not withdrawn, grouped by skill |
| `GET /users/:id/certifications/eligibility` | JWT | `{ eligible, attestedSkillIds }` for the viewer |
| `POST /users/:id/certifications` | JWT | Give a +1 |
| `DELETE /users/:id/certifications/:certificationId` | JWT, author of the +1 | Withdraw (sets `revoked_at`) |
| `GET`, `POST /admin/skills`, `PATCH /admin/skills/:id` | admin | List, create, activate or deactivate |

### Rules of `POST /users/:id/certifications`

1. **Eligibility:** the viewer wrote a help request that the profile answered, with the answer not flagged and the request not deleted. Otherwise `403 not_eligible`.
2. **No self +1:** `400 self_certification`.
3. **Active skill only:** otherwise `404 skill_not_found`.
4. **Rate limit:** at most 20 +1s given per rolling 24 hours (`429 rate_limited`).
5. **Comment:** optional, at most 280 characters, checked by the existing moderation (regex, denylist, agent). If flagged, `422 comment_rejected`, since there is no moderation queue for +1s.
6. **Duplicates:** an active +1 for the same skill gives `409 already_attested`. A withdrawn one is reactivated, with the new comment.
7. **Outbox:** the row and a `certification.attested` outbox event are written in one transaction. Nothing consumes the event yet; the publisher (slice 2) will pick up past +1s too.

**Withdrawal** is Postgres only (ADR 0009 §5).

**Skill labels are frozen once created**, because the label gives the Intuition atom bytes. To rename a skill, create a new one and deactivate the old one.

## Web (PR 2)

| Piece | Location |
| --- | --- |
| BFF relays | [`apps/web/app/api/skills/route.ts`](../../../apps/web/app/api/skills/route.ts), [`apps/web/app/api/users/[id]/certifications/`](../../../apps/web/app/api/users/%5Bid%5D/certifications/route.ts) (`GET`, `POST`, `eligibility`, `[certificationId]` `DELETE`) |
| Server fetchers | `fetchSkills`, `fetchUserCertifications`, `fetchCertificationEligibility` in [`apps/web/lib/api-server.ts`](../../../apps/web/lib/api-server.ts) |
| Browser client | [`apps/web/lib/certification-client.ts`](../../../apps/web/lib/certification-client.ts) |
| "Validated skills" card | [`user-certifications-card.tsx`](../../../apps/web/components/features/user-certifications-card.tsx), rendered by `user-public-content.tsx` under the stats |
| +1 form | [`skill-certification-form.tsx`](../../../apps/web/components/features/skill-certification-form.tsx) |
| Withdraw (inline confirmation) | [`certification-withdraw-button.tsx`](../../../apps/web/components/features/certification-withdraw-button.tsx) |
| Error codes | `not_eligible`, `already_attested`, `comment_rejected`, `rate_limited`, `self_certification`, `skill_not_found` in [`map-api-error.ts`](../../../apps/web/lib/map-api-error.ts) and `errors.*` |
| Tests | [`apps/web/tests/skill-certification-form.test.tsx`](../../../apps/web/tests/skill-certification-form.test.tsx) |

**Behaviour:**

- The profile page loads the +1s for everyone. When the viewer is signed in and looks at someone else, it also loads their eligibility and the skill catalogue.
- An eligible viewer sees the form with the skills they have not validated yet. A viewer who was not helped sees a short rule instead.
- The author of a +1 sees a "Withdraw" button next to it, with an inline confirmation.
- If the +1s cannot be loaded (for example a non-uuid id), the card is hidden and the rest of the profile still renders.

The form is inline with a native `<select>`, not a modal: `apps/web` uses no `Dialog` yet, and a native select stays testable in jsdom.

## Open for slice 2

- Canonical URL of the person atom: ADR 0009 says `/u/<uuid>`, but the web route is `/[locale]/users/[id]`. Decide before publishing.
- Proof page, publisher, `packages/blockchain`.

## Links

- [ADR 0009](../../adr/0009-certifications-intuition.md)
- [Product: certifications](../../product/certifications.md)
- [Spike #161](../161-certifications-spike/README.md)
