# Issue #205 — Spike: member smart accounts on Intuition testnet

**Issue:** https://github.com/AllAboard-THP/All-Aboard/issues/205

## Goal

Check the assumptions of [ADR 0011](../../adr/0011-member-smart-accounts.md) (section 9) on the Intuition testnet, with a throwaway passkey, before the ADR moves to Accepted: a member signs a deposit with their passkey, and All-Aboard pays.

## Status (2026-11-26)

**On-chain part done; exit criterion met.** A member account owned by a P-256 passkey (simulated in Node, real WebAuthn assertion format) sent a paymaster-sponsored `deposit` and `redeem` on testnet. Both show in the explorer and the hosted indexer under the account address.

Still open: the browser prompt test (Chrome, Safari, phone, synced passkeys), the profile-to-account predicate, and the mainnet deployment path for Kernel.

**Main finding:** the account implementation changes. Coinbase Smart Wallet needs EntryPoint v0.6, which is absent on Intuition. **ZeroDev Kernel v3.3 with the passkey validator 0.0.3 (EntryPoint v0.7) is already deployed on testnet** and works. See [Results](#results-2026-11-26).

## Files in this folder

| File | Role |
|------|------|
| `README.md` | This index and the results |

The spike scripts and throwaway keys stayed outside the repo (session scratch). The passkey simulation is described in [Setup used](#setup-used).

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

Additional reads (2026-11-26):

| Contract | Testnet (13579) | Mainnet (1155) |
| --- | --- | --- |
| Coinbase Smart Wallet factory v1 `0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a` | Absent | Absent |
| ZeroDev Kernel v3.3 implementation `0xd6CEDDe84be40893d153Be9d467CD6aD37875b28` | Deployed | Absent |
| ZeroDev Kernel v3.3 factory `0x2577507b78c2008Ff367261CB6285d44ba5eF2E9` | Deployed | Absent |
| ZeroDev meta factory `0xd703aaE79538628d27099B8c4f621bE4CCd142d5` | Deployed | Absent |
| ZeroDev passkey (WebAuthn) validator 0.0.3 `0x7ab16Ff354AcB328452F1D445b3Ddee9a91e9e69` | Deployed | Absent |
| Arachnid deterministic deployer `0x4e59b44847b379578588920cA78FbF26c0B4956C` | Deployed | Deployed |
| CreateX `0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed` | Deployed | Deployed |

Coinbase Smart Wallet also targets EntryPoint v0.6 only, which is absent on both chains.

## Results (2026-11-26)

### Setup used

| Piece | Value |
| --- | --- |
| Account | ZeroDev Kernel v3.3, sudo validator = passkey validator 0.0.3, EntryPoint v0.7 (`@zerodev/sdk` 5.5, `@zerodev/passkey-validator` 5.6, `viem` 2.58) |
| Passkey | P-256 key generated in Node `crypto`. Signatures built exactly like a browser assertion: `authenticatorData` (rpIdHash, flags UP+UV), `clientDataJSON` with the user operation hash as base64url challenge, low-s `r`/`s` |
| RIP-7212 | Custom `signMessageCallback` that sets `usePrecompiled = true` and exposes `usePrecompiled(chainId)`. The SDK's built-in list does not include chain 13579 |
| Paymaster | eth-infinitism `VerifyingPaymaster` from `@account-abstraction/contracts` 0.7.0, unchanged, deployed at `0x933b93eb9eae81dea4330195e5b007a786bc34fc` ([tx](https://testnet.explorer.intuition.systems/tx/0x0320aca9c9a7d85c540831c3bc481f151f93f7c2d01f9c97ca55726ab1503e9b), 1,208,584 gas). Verifying signer = a throwaway spike wallet; EntryPoint deposit 0.5 tTRUST |
| Bundler | Pimlico Alto in Docker (`ghcr.io/pimlicolabs/alto`, image of 2026-08-18): `--entrypoints <v0.7> --rpc-url <testnet RPC> --chain-type arbitrum --safe-mode false --deploy-simulations-contract true`, one throwaway executor key funded with 0.5 tTRUST. Worked on first start |
| Term | An existing triple on the indexed MultiVault, `0x7fa7125e…d8b3`, curve `1` (default) |
| Account | `0x3824dF106BF8364a074153869A1B0413625BF074`, counterfactual address computed before deployment, deployed by the first user operation |

The operator pre-funded the account with 0.03 tTRUST for the deposit value; the paymaster paid all gas.

### Measurements

Gas price on testnet: 0.1 gwei.

| Operation | Gas used | Cost (tTRUST) | Latency (send → receipt) | Tx |
| --- | --- | --- | --- | --- |
| Deposit 0.01, first operation (deploys the account) | 622,846 | 0.0000627 | 4.3 s | [0x1c4d…12a0](https://testnet.explorer.intuition.systems/tx/0x1c4d4cb56cdcc03ad65dfcece7520ea8fcff6b8629e4ed25cb9d4766651512a0) |
| Redeem all shares | 385,212 | 0.0000388 | 2.9 s | [0x9e7e…f1f4](https://testnet.explorer.intuition.systems/tx/0x9e7ef9d65b199669acaa5ee752b4d3647488c69c228158a67da8bf8b3aa1f1f4) |
| Deposit 0.01, account already deployed | 395,871 | 0.0000398 | 3.5 s | [0xfec5…fe96](https://testnet.explorer.intuition.systems/tx/0xfec5a49fa1196e29a6e0a5021799965a0e081fcb313c6744d8e528b46ea9fe96) |
| Redeem, account already deployed | 368,039 | 0.0000370 | 3.1 s | [0xfc0f…024f](https://testnet.explorer.intuition.systems/tx/0xfc0f1364bcdf6bddd78d5d1a98c7ee37db5c614131b17aa304d3cb172faa024f) |
| Deposit, signature checked in Solidity (`usePrecompiled = false`) | 726,221 | 0.0000731 | 3.3 s | [0x2522…6526](https://testnet.explorer.intuition.systems/tx/0x2522e29611b53fcc0ca721b88efe361908fc4abd789f60fca3b050532ca06526) |
| Redeem, Solidity check | 701,885 | 0.0000706 | 3.2 s | [0x4eb2…31c9](https://testnet.explorer.intuition.systems/tx/0x4eb2e2bd345f1a08ed556a352da65129d0300c5459f77910dce4925d345bbc31) |

MultiVault economics (from `getGeneralConfig` and the runs):

- **Minimum deposit: 0.001 tTRUST** (`minDeposit`). Atom cost and triple cost are both about 0.001 tTRUST.
- A 0.01 deposit gave shares worth 0.0099 (about 1% entry fee); redeeming returned 0.009801 (about 1% exit fee). **A deposit then withdrawal loses about 2%.**

### What this means

- **Cost per attestation: about 0.00004 tTRUST of gas** once the account exists, plus the deposit itself, which stays in the vault (minus fees) and comes back on withdrawal. The first attestation of a member costs about 1.6x because it deploys the account. Mainnet prices are not measured.
- **The precompile saves about 330,000 gas per operation (about 45%).** The SDK must be told to use it on Intuition (custom callback above); otherwise it silently falls back to the Solidity verifier.
- **The indexer attributes the positions to the member.** `deposits` and `redemptions` in `testnet.intuition.sh` show the smart account as `sender_id` and `receiver_id`, not the bundler. Positions return to `0` shares after redeem.
- **A self-hosted Alto is enough**: no change needed for an Orbit chain beyond `--chain-type arbitrum`.

### Not tested

- A forged passkey signature and a user operation without a paymaster signature being rejected. Expected from the contracts, not run.
- Adding a second passkey to an account (Kernel: install another validator, or ZeroDev's weighted validator).
- The paymaster policy (only MultiVault `deposit`/`redeem` matching a Postgres row): the spike signed every operation.
- Deploying Kernel v3.3 and the passkey validator on mainnet at the same addresses through the Arachnid deployer.

## Checklist (from the issue)

- [x] ~~Deploy the Coinbase Smart Wallet factory~~ → replaced: Kernel v3.3 and the passkey validator are already on 13579. Mainnet deployment path still to check
- [x] Create an account owned by a passkey; the counterfactual address is the one deployed (simulated passkey; browser in the WebAuthn item below)
- [x] Deploy a verifying paymaster and run a bundler (Alto) against the testnet RPC
- [x] Send a sponsored `deposit` on an existing triple, signed by the passkey, then a `redeem`; measure gas and the minimum deposit
- [x] Check that the hosted indexer shows the deposit under the account address
- [ ] Test the WebAuthn prompt in Chrome, Safari and on a phone, with a synced passkey (iCloud, Google)
- [ ] Choose the predicate for the profile-to-account link in `@0xintuition/predicates`

**Exit criterion:** a passkey-signed, paymaster-sponsored deposit visible in the explorer and the indexer, with a known cost per attestation.

## Out of scope

No product code, no migration, no mainnet.

## Links

- [ADR 0011](../../adr/0011-member-smart-accounts.md), [ADR 0009](../../adr/0009-certifications-intuition.md), [spike #161](../161-certifications-spike/README.md)
- Product: [resource-votes.md](../../product/resource-votes.md)
- [Documentation index](../../INDEX.md)
