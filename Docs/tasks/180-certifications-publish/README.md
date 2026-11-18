# Issue #180 — Skill certifications, slice 2 (publish on Intuition testnet)

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/180

## Goal

Publish each +1 given in slice 1 ([#172](../172-skill-certifications/README.md)) on Intuition **testnet**, as decided in [ADR 0009](../../adr/0009-certifications-intuition.md). Postgres stays the product source of truth; the chain is the public proof.

## Delivery

| PR | Scope | State |
| --- | --- | --- |
| A | `packages/blockchain`, `/u/[id]` alias, ADR updates | [#181](https://github.com/AllAboard-THP/All-Aboard/pull/181), merged |
| B | Publisher in `apps/api/src/intuition/`, env, Docker, docs | [#182](https://github.com/AllAboard-THP/All-Aboard/pull/182), merged |
| C | Proof link on published +1s (web) | [#183](https://github.com/AllAboard-THP/All-Aboard/pull/183), merged |

B and C were merged into their stacked base branches; [#184](https://github.com/AllAboard-THP/All-Aboard/pull/184) brought them into `Dev`.

## Live on dev (2026-11-18)

- **Operator:** a dedicated testnet wallet, `0x00F033726E4dc4d07bBb7a920c28871A960d0793`, funded with tTRUST. Its key is set on the dev API only and is kept outside the repo. Staging and production have no key, so they publish nothing.
- **At start-up:** the API logged `certification_publisher_on` with the operator and its balance. It skipped the +1 withdrawn during the slice 1 test (`certification_publish_skipped_revoked`).
- **First +1 published:** "Ruby", in transaction [`0x9af9…8265`](https://testnet.explorer.intuition.systems/tx/0x9af92866ef2caf47604ccf4b08633d5dc0604f9542a3dd12f2d38055d91a8265) (block `9378946`). It produced the +1 `0x4dfc…3408` and the claim `0xca66…8c60`.
- **Checks:**
  - Reading the atoms back from the chain gives `https://dev.allaboard.fr/u/<uuid>` for both people, which redirects to their profile.
  - The skill atom is the `DefinedTerm` "Ruby".
  - Both predicates are the registry atoms.
  - `GET /users/:id/certifications` returns the `proof`.
- **Cost:** 0.5 tTRUST (3 atoms and 2 triples at 0.1 each, gas is negligible). The predicates already existed from the spike. A +1 between people and a skill already on the chain costs 0.1 to 0.2.

## PR A

| Piece | Location |
| --- | --- |
| Graph shape, atom bytes, ids | [`packages/blockchain/src/index.ts`](../../../packages/blockchain/src/index.ts) |
| Golden-id tests | [`packages/blockchain/src/index.test.ts`](../../../packages/blockchain/src/index.test.ts) |
| Stable profile URL `/u/[id]` | [`apps/web/app/[locale]/u/[id]/page.tsx`](../../../apps/web/app/%5Blocale%5D/u/%5Bid%5D/page.tsx) |

### `@allaboard/blockchain`

Pure code, no secrets, no network. Exact versions pinned: `@0xintuition/ids`, `@0xintuition/predicates`, `@0xintuition/primitives` `0.1.0-alpha.1`, `viem` `2.57.14` (the versions the spike ran on testnet).

| Function | Gives |
| --- | --- |
| `personAtom(origin, userId)` | `<origin>/u/<uuid>`, lower-cased; rejects non-uuid ids and origins with a path |
| `skillAtom(label)` | schema.org `DefinedTerm` with `name` only |
| `PREDICATES` | `expertIn`, `attestedBy` from the registry; throws at load if the bytes drift |
| `claimTriple`, `attestationTriple` | `(person) expertIn (skill)`, `(claim) attestedBy (peer)` |
| `certificationTerms(input)` | every term of one +1; `certificationAtoms` lists the atoms in creation order |
| `counterTripleId` | counter vault, for signalling a withdrawal later |

**Golden ids:** the tests rebuild the skill atom, the claim and the +1 of the real spike run (blocks `9375153` to `9375155`) and compare with the ids on-chain. If they fail, the code no longer matches what is published.

### Person atom URL (decided 2026-11-17)

- `/u/[id]` only redirects (308) to `/users/[id]`, keeping the locale. Anything but a uuid gives 404.
- The origin is the publishing environment's web origin (`INTUITION_PROFILE_ORIGIN`, added in PR B): `https://dev.allaboard.fr` on dev, `https://allaboard.fr` in production. Each atom then points to a profile that exists.

## PR B

| Piece | Location |
| --- | --- |
| Chain client (only file with a signer) | [`apps/api/src/intuition/chain.ts`](../../../apps/api/src/intuition/chain.ts) |
| Certification consumer | [`apps/api/src/intuition/certification-publisher.ts`](../../../apps/api/src/intuition/certification-publisher.ts) |
| Wiring, start-up checks | `createCertificationChain` and `startIntuitionPublisher` in [`publisher.ts`](../../../apps/api/src/intuition/publisher.ts) |
| Retry schedule column | [`0017_certification_publish_schedule.sql`](../../../apps/api/drizzle/0017_certification_publish_schedule.sql) (`next_publish_at`) |
| Reopen event on reactivation | `POST /users/:id/certifications` in [`routes/certifications.ts`](../../../apps/api/src/routes/certifications.ts) |
| Tests | [`certification-publisher.test.ts`](../../../apps/api/src/intuition/certification-publisher.test.ts) (database + in-memory chain), `config.test.ts` |

**How one event is processed:**

1. Reload the +1 and its skill. Missing row: close the event. `revoked_at` set: close it and publish nothing. Already published: close it.
2. Skip it for now if `next_publish_at` is in the future, or after 8 failed attempts (admin replay).
3. Build the terms with `certificationTerms` (`INTUITION_PROFILE_ORIGIN`).
4. Create the missing atoms in one `createAtoms` (both predicates the first time, the two people, the skill), then the claim if missing, then the +1 if missing. Each call waits for its receipt.
5. Store `claim_triple_id`, `attestation_triple_id`, `tx_hash`, `published_at`, and the skill's `intuition_atom_id`; close the event.
6. On error: `publish_attempts` + 1, `publish_error`, `next_publish_at` = now + 30 s × 2^(attempts − 1), capped at 1 h. The event stays open.

**Off by default.** Without `INTUITION_PUBLISHER_PRIVATE_KEY` or `INTUITION_PROFILE_ORIGIN` (defaults to `WEB_APP_URL`), the consumer logs `certification_publisher_off` and events wait. Any chain id but `13579` turns it off. At start-up it logs the operator address and balance (`lowBalance` under 1 tTRUST), never the key.

**Enable on dev:** create a dedicated testnet wallet, fund it with tTRUST, then set on the dev API only: `INTUITION_PUBLISHER_PRIVATE_KEY` and `INTUITION_PROFILE_ORIGIN=https://dev.allaboard.fr`. The +1s already in the outbox are published on the next poll, except withdrawn ones.

## PR C

- **API:** each +1 in `GET /users/:id/certifications` carries `proof` once published: `network` (`intuition-testnet`), `attestationTripleId`, `claimTripleId`, `txHash` (when known), `publishedAt`. Absent while pending.
- **Web:**
  - "Proof on Intuition ↗" on each published +1 opens its transaction on `testnet.explorer.intuition.systems` (`lib/intuition-proof.ts`; only a valid `0x` hash becomes a link).
  - The card states, as ADR 0009 §6 requires, that All-Aboard records the +1s on the giver's behalf (they do not sign) and that a withdrawn +1 stays on the chain. Shown once at least one +1 is published.
  - Withdrawing a published +1 asks: "It will disappear from the profile but stay on the chain."
- Pending +1s show no status: while the publisher is off, they would stay "pending" forever.

## Rules for PR B

- **Withdrawn before publication:** reload the row; if `revoked_at` is set, mark the event processed and publish nothing (ADR 0009 §5).
- **Given again after that:** the route reactivates the row and, when the row is not published yet, resets the event's `processed_at` (done in PR B; `onConflictDoNothing` alone would keep it closed).
- Bootstrap `expertIn` and `attestedBy` once per network; skip atoms and triples that already exist (`isTermCreated`).
- Off without `INTUITION_PUBLISHER_PRIVATE_KEY`; testnet only (refuse any chain id but 13579).

## Links

- [ADR 0009](../../adr/0009-certifications-intuition.md)
- [Spike #161](../161-certifications-spike/README.md)
- [Slice 1 #172](../172-skill-certifications/README.md)
