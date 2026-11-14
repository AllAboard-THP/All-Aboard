# Issue #161 — Spike: certifications on Intuition testnet

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/161

## Goal

Check the assumptions of [ADR 0009](../../adr/0009-certifications-intuition.md) (section 7) on the Intuition testnet before the ADR moves to Accepted.

## Status (2026-11-02)

**Write path confirmed, GraphQL read not confirmed.** One real +1 is on the testnet (see [Real run](#real-run)). The hosted GraphQL had not indexed it 35 minutes later. The other results below come from read calls and `eth_simulateV1` with a balance override.

## Files in this folder

| File | Role |
|------|------|
| `README.md` | This index and the results |

## Setup

| Item | Value |
| --- | --- |
| Chain | Intuition Testnet, id `13579`, token `tTRUST`, RPC `https://testnet.rpc.intuition.systems/http` |
| MultiVault | `0xF76d6976DeBFbB012ebc53e925BC4AEFCaA7C6c6` (from `@0xintuition/deployments`) |
| Packages | `ids`, `predicates`, `primitives`, `deployments` `0.1.0-alpha.1`; `protocol` `3.0.0-alpha.0`; `viem` `2.57.14` |
| GraphQL | `https://testnet.intuition.sh/v1/graphql` |

## Results

| Question | Result | How it was checked |
| --- | --- | --- |
| Do offline ids match the contract? | Yes, for atoms and triples | `calculateAtomId` / `calculateTripleId` compared with the contract's view functions; simulated `createAtoms` / `createTriples` return the same ids |
| Does the contract accept a triple as subject? | Yes | Real transaction (below). Control in simulation: a subject that does not exist reverts with `MultiVault_TermDoesNotExist` |
| Do the predicates already exist? | **No, on neither network** | `isTermCreated` is false for `expertIn` and `attestedBy` on testnet and mainnet |
| Does GraphQL expose nested triples? | Yes | `subject_term.type = "Triple"` returns real rows from other apps |
| Is GraphQL complete and fresh? | **No, on what we saw** | Our real +1 was not indexed after 35 minutes, and 5 extra blocks did not help. The newest row is still block `9375122` (2026-11-01 23:44 UTC), and the chain logs show no other MultiVault creation since. A triple from block `9373350` is also missing. Cause unknown: stalled indexer, filtering, or a longer delay |
| Skill atom shape | `buildDefinedTerm` from `@0xintuition/primitives/atom` | « Ruby on Rails » gives `{"@context":"https://schema.org/","@type":"DefinedTerm","name":"Ruby on Rails"}`, 79 bytes (limit `atomDataMaxLength` = 1000) |
| Can a +1 be redeemed? | **Only with an extra deposit** | With `assets` = triple cost, the creator holds **0 shares**. With cost + `minDeposit` (0.01): 0.009875 shares, and `redeem` returns 0.00975 |

### Cost of a +1

Protocol values read on 2026-11-02: atom cost `0.100000000001`, triple cost `0.100000000002`, min deposit `0.01`. Mainnet has the same atom and triple costs, in TRUST.

| Case | Created | Value (tTRUST) | Simulated gas |
| --- | --- | --- | --- |
| Very first +1 | 5 atoms (person, peer, skill, 2 predicates), 2 triples | 0.7 | 2,676,283 |
| New peer on an existing claim | 1 atom, 1 triple | 0.2 | 926,592 |
| Known peer on an existing claim | 1 triple | 0.1 | 543,650 |

Gas is negligible next to the value: about 0.00027 tTRUST for the very first +1, at 0.1 gwei. No extra deposit for revocation in the first slice (see point 2 below).

## Real run

2026-11-02, throwaway wallet `0x32DA265374c8Ad607C97419Ac335C0F1bC9c66A1`, writes through `multiVaultCreateAtoms` and `multiVaultCreateTriples` from `@0xintuition/protocol` `3.0.0-alpha.0`. Person and peer atoms use `https://example.org/allaboard-spike-161/u/...` test URLs.

| Step | Transaction | Block | Gas |
| --- | --- | --- | --- |
| 5 atoms | [`0x3bba…2260`](https://testnet.explorer.intuition.systems/tx/0x3bba905835a08cd8f8cfc43d84511f34b0b6aede0d0d2c85534ff5abefb22260) | 9375153 | 1,614,058 |
| Claim `expertIn` | [`0xde43…0b07`](https://testnet.explorer.intuition.systems/tx/0xde434dcd18d55589edd47b1438ed393851e5e6d399e821d09aedf46e35640b07) | 9375154 | 541,465 |
| +1 `attestedBy` | [`0x6cac…1b91`](https://testnet.explorer.intuition.systems/tx/0x6cac0ef110ac5aa4d95f88c8152f921930c139f2179013df65ac649e74031b91) | 9375155 | 543,650 |

- Claim id: `0x650cf78e0e2837a891777efbc710c1258fcead4df5bbed57e8e27a8a9688d971`
- +1 id: `0x8ab8777b0ed073b51d0f3f2c98ec3694b828180b376ad7f650133b4066a973c3`
- `isTriple` is true for both, and the ids in the `TripleCreated` logs match the ones computed offline.
- Total spent: 0.70027 tTRUST, in line with the simulation.
- `expertIn` and `attestedBy` now exist on testnet, at their registry ids.

## Points for the ADR

1. **Bootstrap step:** the publisher must create `expertIn` and `attestedBy` once per network.
2. **Revocation:** a deposit of exactly the triple cost leaves nothing to redeem. **Decided 2026-11-13:** Postgres only for the first slice; a withdrawn +1 stays on-chain as history. A counter-vault deposit is to be tested before other apps consume the +1s or before mainnet ([ADR 0009](../../adr/0009-certifications-intuition.md) section 5).
3. **Predicate wording:** `attestedBy` is defined as "witnessed and signed by the object attestor". Our peer does not sign; the operator does. **Decided 2026-11-13:** keep `attestedBy` and say on the proof page that All-Aboard recorded the +1 on the peer's behalf.
4. **Person atom:** `@0xintuition/ids` offers an auth-user atom (`calculateAuthUserAtomId`) that stores a hash of the user id. Unlike a profile URL, it does not tie identity to a domain, but nothing outside All-Aboard can resolve it. **Decided 2026-11-13:** keep the profile URL, so the CV stays reusable by other apps.

## Remaining

- **GraphQL read:** re-run the query for the +1 id later, and ask Intuition ([Discord](https://discord.gg/RgBenkX4mx)) whether the testnet indexer is running. Until then, reconcile with contract reads (`isTriple`) rather than GraphQL.
- **`@0xintuition/protocol` `2.0.3`:** not tested. The `3.0.0-alpha.0` write helpers work against the testnet contract. Mainnet may run an older implementation, so re-check before any mainnet decision.
- **Counter vault:** test a deposit in the +1's counter vault before other apps consume the +1s or before mainnet (point 2).

## Links

- [ADR 0009](../../adr/0009-certifications-intuition.md)
- [Product: certifications](../../product/certifications.md)
