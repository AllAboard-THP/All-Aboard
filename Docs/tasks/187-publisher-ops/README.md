# Issue #187 — Certification publisher ops

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/187

## Goal

Close two gaps between [ADR 0009](../../adr/0009-certifications-intuition.md) and the slice 2 publisher ([#180](../180-certifications-publish/README.md)):

1. The operator balance was only logged at start-up. The ADR asks for it in the health details.
2. A +1 out of attempts waited for an "admin replay" that did not exist.

## What changed

| Piece | Location |
| --- | --- |
| Shared publisher state | [`apps/api/src/intuition/publisher-status.ts`](../../../apps/api/src/intuition/publisher-status.ts) |
| Balance refresh (start-up, then every 5 min) | `refreshOperatorBalance` in [`publisher.ts`](../../../apps/api/src/intuition/publisher.ts) |
| `/health` | [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) |
| Admin routes | [`apps/api/src/routes/admin.ts`](../../../apps/api/src/routes/admin.ts) |
| Types, contract | [`packages/types`](../../../packages/types/src/index.ts), [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) |
| Tests | `certification-publisher.test.ts` (balance), `certifications.test.ts` (admin routes), `app.test.ts` (`/health`) |

### `/health` (public)

```json
{ "status": "ok", "certificationPublisher": "on", "lowBalance": false }
```

- `certificationPublisher` is `on` or `off`.
- `lowBalance` appears once the balance was read, and is `true` under 1 tTRUST.
- The address and the amount stay out of this public route, for uptime checks only.

When the balance drops under 1 tTRUST, the API logs `certification_publisher_low_balance` once.

### `GET /admin/certifications/publisher` (admin)

It returns:

- **`publisher`:** `off` with its reason, or `on` with the operator address, the balance, `lowBalance` and when the balance was last read.
- **`counts`:**
  - `published`;
  - `waiting`: not withdrawn, not published, still retried automatically;
  - `failed`: out of attempts.
- **`failed`:** up to 50 +1s out of attempts, oldest first, with `publishError`.

### `POST /admin/certifications/:id/republish` (admin)

- **On success:** it resets `publish_attempts`, `publish_error` and `next_publish_at`, and reopens the outbox event, all in one transaction. The publisher takes the +1 on its next poll. It answers `202 { id, queued: true }`.
- **On error:** `404 not_found`, `409 already_published` or `409 certification_revoked`. A withdrawn +1 is never published (ADR 0009 §5).

Check `publishError` first: replaying an unfunded wallet only fails again.

## Links

- [ADR 0009](../../adr/0009-certifications-intuition.md)
- [Slice 2 #180](../180-certifications-publish/README.md)
