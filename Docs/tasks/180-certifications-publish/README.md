# Issue #180 — Skill certifications, slice 2 (publish on Intuition testnet)

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/180

## Goal

Publish each +1 given in slice 1 ([#172](../172-skill-certifications/README.md)) on Intuition **testnet**, as decided in [ADR 0009](../../adr/0009-certifications-intuition.md). Postgres stays the product source of truth; the chain is the public proof.

## Delivery

| PR | Scope | State |
| --- | --- | --- |
| A | `packages/blockchain`, `/u/[id]` alias, ADR updates | this PR |
| B | Publisher in `apps/api/src/intuition/`, env, Docker, docs | next |
| C | Proof link on published +1s (web) | after B |

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

## Rules for PR B

- **Withdrawn before publication:** reload the row; if `revoked_at` is set, mark the event processed and publish nothing (ADR 0009 §5).
- **Given again after that:** the route reactivates the row but `onConflictDoNothing` keeps the processed event. PR B must reset `processed_at` on reactivation when the row is not published yet, or the +1 never reaches the chain.
- Bootstrap `expertIn` and `attestedBy` once per network; skip atoms and triples that already exist (`isTermCreated`).
- Off without `INTUITION_PUBLISHER_PRIVATE_KEY`; testnet only (refuse any chain id but 13579).

## Links

- [ADR 0009](../../adr/0009-certifications-intuition.md)
- [Spike #161](../161-certifications-spike/README.md)
- [Slice 1 #172](../172-skill-certifications/README.md)
