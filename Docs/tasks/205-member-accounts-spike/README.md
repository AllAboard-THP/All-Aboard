# Issue #205 — Spike: member smart accounts on Intuition testnet

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/205

## Goal

Check the assumptions of [ADR 0011](../../adr/0011-member-smart-accounts.md) (section 9) on the Intuition testnet, with a throwaway passkey, before the ADR moves to Accepted: a member signs a deposit with their passkey, and All-Aboard pays.

## Status (2026-11-26)

Not started. Preliminary read-only checks are done (below).

## Files in this folder

| File | Role |
|------|------|
| `README.md` | This index and the results |

## Setup

| Item | Value |
| --- | --- |
| Chain | Intuition Testnet, id `13579`, token `tTRUST`, RPC `https://testnet.rpc.intuition.systems/http` |
| MultiVault | `0x2Ece8D4dEdcB9918A398528f3fa4688b1d2CAB91` (the one the hosted indexer tracks, [ADR 0009](../../adr/0009-certifications-intuition.md) §1) |
| EntryPoint | v0.7 `0x0000000071727De22E5E9d8BAf0edAc6f37da032`, v0.8 `0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108` |
| GraphQL | `https://testnet.intuition.sh/v1/graphql` |

## Preliminary checks (2026-11-26)

Read-only calls with `viem` and the chains from `@0xintuition/deployments`. No transaction sent.

| Check | Testnet (13579) | Mainnet (1155) | How |
| --- | --- | --- | --- |
| RIP-7212 P-256 precompile at `0x100` | Returns `1` for a valid signature | Same | `eth_call` with a fresh P-256 key pair and a signature from Node `crypto` (`hash ‖ r ‖ s ‖ x ‖ y`) |
| EntryPoint v0.6 `0x5FF137D4…2789` | Absent | Absent | `eth_getCode` |
| EntryPoint v0.7 | Deployed | Deployed | `eth_getCode` |
| EntryPoint v0.8 | Deployed | Deployed | `eth_getCode` |
| Coinbase Smart Wallet factory v1.1 `0xBA5ED110…5842` | Absent | Absent | `eth_getCode` |
| Safe singleton factory `0x914d7Fec…43d7` | Absent | Deployed | `eth_getCode` |
| Daimo `P256Verifier` `0xc2b78104…4De4` | Deployed | Absent | `eth_getCode` |

Not checked yet: an invalid signature returning empty output at `0x100`, and whether any hosted bundler or paymaster supports chain 13579 or 1155.

## Checklist (from the issue)

- [ ] Deploy the Coinbase Smart Wallet factory and implementation on 13579; find a CREATE2 path that gives the same address on both networks
- [ ] Create an account owned by a browser passkey; the counterfactual address matches the offline computation
- [ ] Deploy a verifying paymaster and run a bundler (Alto) against the testnet RPC
- [ ] Send a sponsored `deposit` on an existing triple, signed by the passkey, then a `redeem`; measure gas and the minimum deposit
- [ ] Check that the hosted indexer shows the deposit under the account address
- [ ] Test the WebAuthn prompt in Chrome, Safari and on a phone, with a synced passkey (iCloud, Google)
- [ ] Choose the predicate for the profile-to-account link in `@0xintuition/predicates`

**Exit criterion:** a passkey-signed, paymaster-sponsored deposit visible in the explorer and the indexer, with a known cost per attestation.

## Out of scope

No product code, no migration, no mainnet.

## Links

- [ADR 0011](../../adr/0011-member-smart-accounts.md), [ADR 0009](../../adr/0009-certifications-intuition.md), [spike #161](../161-certifications-spike/README.md)
- Product: [resource-votes.md](../../product/resource-votes.md)
- [Documentation index](../../INDEX.md)
