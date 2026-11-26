# ADR 0011 — Member smart accounts: members sign their attestations

## Status

Proposed — 2026-11-26. Spike [#205](https://github.com/AllAboard-THP/All-Aboard/issues/205): on-chain part done on testnet the same day ([results](../tasks/205-member-accounts-spike/README.md#results-2026-11-26)). The browser prompt test and the profile-link predicate remain before acceptance (section 9).

Revises the signer decision of [ADR 0009](0009-certifications-intuition.md) §1 ("Users sign nothing"). The rest of ADR 0009 (graph shape, comment off-chain, Postgres as product source of truth, outbox) stays. Applies to skill +1s ([certifications.md](../product/certifications.md)), mission validations ([ADR 0010](0010-experience-certifications-missions.md)) and resource votes ([resource-votes.md](../product/resource-votes.md)).

## Context

The product goal is a CV **validated by the tech community**, readable by other apps on Intuition. Today every claim is signed by one operator wallet owned by All-Aboard (ADR 0009). On-chain, that proves "All-Aboard recorded that this peer attested", not "this peer attested":

- Another app cannot weigh an attestation by who gave it: every deposit comes from the same address.
- The CV is only as credible as All-Aboard. If All-Aboard disappears or its key leaks, the claims lose their only guarantee.
- All-Aboard is the author, legally and technically, of every claim.
- Costs, the hot key and the single nonce all grow with usage.

Product decisions of 2026-11-26 ([resource-votes.md](../product/resource-votes.md)): members sign their own attestations; **All-Aboard pays** gas and a fixed base deposit; one member, one vote; no voluntary deposit; members never buy TRUST.

### Facts checked on 2026-11-26

Intuition Network is an Arbitrum Orbit L3 that settles to Base, with a single sequencer and no public mempool ([Immunefi scope](https://immunefi.com/bug-bounty/intuition/scope/)). Contract reads on both chains:

| Check | Testnet (13579) | Mainnet (1155) |
| --- | --- | --- |
| RIP-7212 P-256 precompile at `0x100`, valid signature | Returns `1` | Returns `1` |
| ERC-4337 EntryPoint v0.7 `0x0000000071727De22E5E9d8BAf0edAc6f37da032` | Deployed | Deployed |
| ERC-4337 EntryPoint v0.8 `0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108` | Deployed | Deployed |
| EntryPoint v0.6 | Absent | Absent |
| Coinbase Smart Wallet factory v1.1 `0xBA5ED110eFDBa3D005bfC882d75358ACBbB85842` | Absent | Absent |
| ZeroDev Kernel v3.3 factory `0x2577507b78c2008Ff367261CB6285d44ba5eF2E9` and passkey validator 0.0.3 `0x7ab16Ff354AcB328452F1D445b3Ddee9a91e9e69` | Deployed | Absent |
| Arachnid deterministic deployer, CreateX | Deployed | Deployed |
| Safe singleton factory `0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7` | Absent | Deployed |

So passkey signatures can be verified on-chain cheaply, and the EntryPoint is there. A passkey smart account (Kernel v3.3) is already deployed on testnet, not on mainnet. Coinbase Smart Wallet targets EntryPoint v0.6 only, which is absent. No bundler or paymaster service for these chains is known.

State of the repo:

| Piece | State |
| --- | --- |
| Passkeys | `webauthn_credentials` stores the public key. A unique index on `user_id` allows **one passkey per user**. Registration does not set `supportedAlgorithmIDs`, so the library default allows EdDSA and RS256 as well as ES256 (P-256) |
| Google sign-in | [ADR 0007](0007-oauth-google-sso.md). A member can have **no passkey at all** |
| Operator publisher | `apps/api/src/intuition/`, one hot key, testnet only |
| Relying party id | Per environment (`dev.allaboard.fr`, `allaboard.fr`), so a passkey from dev does not work in production |

## Decision

### 1. One ERC-4337 smart account per member, owned by their passkeys

- Each member gets a smart account on Intuition. Its owners are the member's **P-256 passkeys**. The signature is checked through the RIP-7212 precompile.
- **All-Aboard is never an owner.** An All-Aboard owner could sign on the member's behalf, which brings back the problem this ADR solves.
- The address is **counterfactual**: computed from the passkey public key before any deployment, stored in Postgres, deployed with the member's first operation.
- **Implementation: ZeroDev Kernel v3.3 with the passkey (WebAuthn) validator 0.0.3, EntryPoint v0.7** (open source, audited, modular validators, `@zerodev/sdk` and `@zerodev/passkey-validator` on viem). Already deployed on testnet; on mainnet, All-Aboard deploys the same bytecode through the deterministic deployer (path to confirm). The SDK must be told that Intuition has the RIP-7212 precompile, otherwise it verifies in Solidity (about 330,000 more gas per operation, measured). Coinbase Smart Wallet was the first choice but needs EntryPoint v0.6, absent on Intuition.
- **Login does not change.** The account is a signer behind the passkey, not a way to sign in.
- **One account per environment**, because passkeys are bound to the relying party id. Testnet accounts and mainnet accounts are separate anyway.

### 2. Who creates terms, who signs the attestation

Creating an atom or triple costs the protocol fee; depositing on it is what says "I stand behind this". The split:

| Action | Signer | Payer |
| --- | --- | --- |
| Create shared atoms and triples (person, skill, resource, mission, claims, nested `attestedBy` triples) | Operator, as in ADR 0009 | All-Aboard |
| **Attest**: fixed deposit on the claim or nested triple | **Member's smart account** | All-Aboard (gas by paymaster, deposit by sponsored balance) |
| Withdraw: redeem the position | Member's smart account | All-Aboard (gas) |
| Link the profile to the account: `(person atom) <predicate> (account address atom)` | Operator creates it, the member deposits on it | All-Aboard |

The proof becomes "this address, controlled by this member's passkey, deposited on this claim", and the profile-to-account link says which member owns the address. The operator keeps a role, but no longer as the author of the attestation. Predicate for the account link: chosen in the spike from `@0xintuition/predicates`.

`(person) authored (resource)` is created by the operator when a mentor approves the resource, and the author's account deposits on it. The approval is the mentor's statement; the deposit is the author's.

### 3. Signing flow (API prepares, browser signs, API submits)

1. The member acts (+1, vote, validation). The API writes the Postgres row and an outbox event in one transaction, as today. The app count updates.
2. The API builds the user operation: call to the MultiVault (`deposit` or `redeem`), paymaster data, gas limits. It returns the operation hash.
3. The browser asks for a **WebAuthn assertion** with the operation hash as challenge, through the existing passkey code (`@simplewebauthn/browser`). This is the biometric prompt: one per attestation, and it is the member's consent.
4. The BFF sends the assertion to the API, which encodes the signature for the account and sends the operation to the bundler.
5. The outbox poller watches the receipt and writes `user_op_hash`, `tx_hash` and `published_at` on the row.

The web app holds no chain code beyond the WebAuthn call. The bundler and paymaster keys stay in the API.

If the member cancels the prompt, the row stays with "not signed yet": it counts in the app (Postgres is the source of truth), shows no proof, and offers "Sign on Intuition" later.

### 4. Who pays

- **Gas:** a **verifying paymaster** deployed by All-Aboard (eth-infinitism sample or equivalent). The API signs sponsorship only for operations that match a Postgres row: target is the MultiVault, function is `deposit` or `redeem`, term id and amount match the row, the sender is the member's account. Anything else is refused, so the paymaster cannot be drained by arbitrary calls.
- **Deposit:** a paymaster does not pay the value sent with a call. The operator therefore **tops up each account** with a small TRUST balance, enough for a quota of attestations (for example 20), and refills it. The rate limits of each feature also cap the sponsoring.
- **Redeemed TRUST stays in the account** and funds the next attestation. It counts toward the quota. This answers open question 2 of resource-votes.md.
- Members never buy TRUST and cannot add their own (product decision). The account balance is not shown as money in the app.

### 5. Bundler

**Self-hosted bundler** (Pimlico's open-source Alto, or equivalent) on Dokploy, pointed at the Intuition RPC. No hosted bundler is known for chains 13579 and 1155, and the single sequencer with no public mempool makes a private bundler enough. Switch to a hosted service if one supports Intuition later.

### 6. Passkey requirements

- **Several passkeys per member** (phone, laptop): drop the unique index on `webauthn_credentials.user_id`. Each new passkey is added to the account by an operation signed with an existing one (with Kernel: a second validator or a weighted validator; not tested in the spike).
- **P-256 only for signing.** New registrations set `supportedAlgorithmIDs: [-7]` (ES256). A member whose only passkey is RS256 or EdDSA, or a Google-only member, is asked to create a P-256 passkey before their first attestation.
- **Lost passkeys:** with no All-Aboard owner, losing every passkey loses the account. The stakes are small (sponsored balance only). The member creates a new passkey and a new account; the operator links the new address to the profile; past attestations stay on-chain under the old address, and the profile keeps showing them from Postgres. No social recovery in this ADR.

### 7. Rollout and migration

1. **Resource votes** are the first feature on member accounts: they have no on-chain history to migrate.
2. **New skill +1s and mission validations** switch next: the operator still creates the terms, the attester's account deposits.
3. **Co-signing past +1s:** a member can sign all the +1s they gave under the operator model in one batched operation ("Sign my past validations"). All-Aboard pays. The proof page then shows both: recorded by All-Aboard, signed by the member.
4. Members who never create an account keep operator-recorded attestations, shown as such on the proof page.

### 8. Code placement

- **`packages/blockchain`**: counterfactual address computation, user operation encoding helpers, WebAuthn signature encoding for the validator, golden tests. No secrets, no network.
- **`apps/api/src/intuition/`**: account service (address, deployment, top-ups), user operation builder, paymaster signer, bundler client, receipt tracking in the outbox poller.
- **`apps/web`**: a "sign" step that calls WebAuthn with a challenge from the API and posts the assertion to the BFF. No viem, no bundler, no keys.
- **Postgres**: `member_accounts` (`user_id`, `address`, `deployed_at`, `factory_version`), per-environment; attestation rows gain `user_op_hash`, `signed_at`, `signer_address`.

### 9. Spike before acceptance

On testnet, with a throwaway passkey:

1. ~~Deploy the Coinbase Smart Wallet factory on chain 13579~~. Replaced: Kernel v3.3 is already there. **Open:** confirm the mainnet deployment path for Kernel and the validator.
2. Done (2026-11-26): an account owned by a passkey (simulated in Node, WebAuthn assertion format), counterfactual address equal to the deployed one.
3. Done: eth-infinitism `VerifyingPaymaster` (0.7.0) deployed; Alto runs against the testnet RPC with `--chain-type arbitrum`.
4. Done: sponsored `deposit` then `redeem` on an existing triple. Minimum deposit 0.001 tTRUST; about 1% fee on entry and 1% on exit.
5. Done: the hosted indexer shows deposits and redemptions with the account as sender and receiver.
6. **Open:** the WebAuthn prompt flow in Chrome, Safari and on a phone, including a passkey synced through iCloud or Google.
7. **Open:** the predicate for the profile-to-account link.

Exit criterion: a passkey-signed, paymaster-sponsored deposit visible in the explorer and the indexer, with a cost per attestation known. **Met** on testnet:

| Operation (testnet, 0.1 gwei) | Gas | Cost |
| --- | --- | --- |
| First attestation (deploys the account) | 622,846 | 0.000063 tTRUST |
| Attestation (deposit) | 395,871 | 0.000040 tTRUST |
| Withdrawal (redeem) | 368,039 | 0.000037 tTRUST |

## Consequences

- **Positive:**
  - Attestations are signed by the members who give them. Other apps can weigh them by signer.
  - The CV survives All-Aboard: the claims and their signers stay on-chain.
  - A leaked operator key can no longer forge an attestation, only create empty terms.
  - The biometric prompt makes each attestation an explicit act.
- **Negative:**
  - New infrastructure to run: factory, paymaster, bundler, account top-ups. Two hot keys in the API (operator, paymaster signer).
  - One biometric prompt per attestation.
  - Members without a P-256 passkey get an extra step before their first attestation.
  - Costs grow with usage and are paid by All-Aboard ([monetization-ideas.md](../vision/monetization-ideas.md)).
  - The proof page has two cases to explain (operator-recorded, member-signed).
- **Risks:**
  - **Self-deployed contracts:** deploy the audited Kernel, validator and paymaster bytecode unchanged; any change needs a review.
  - **Vendor SDK:** the account depends on ZeroDev's SDK and contracts. They are open source and need no ZeroDev service (own bundler and paymaster).
  - **Paymaster drain:** strict sponsorship rules (section 4) and a balance alert like the operator's.
  - **Sybil accounts:** creating accounts is free for members, so eligibility rules and rate limits stay the real defence.
  - **Mainnet:** same as ADR 0009, a separate decision (security review, funding policy).
- **Env (with the implementation):** `INTUITION_BUNDLER_URL`, `INTUITION_PAYMASTER_ADDRESS`, `INTUITION_PAYMASTER_SIGNER_PRIVATE_KEY`, `INTUITION_ACCOUNT_FACTORY_ADDRESS`, account top-up amount and quota. Update [environment-variables.md](../deployment/environment-variables.md).

## Alternatives not chosen

| Alternative | Why not |
| --- | --- |
| Keep the operator as the only signer | The proof stays "All-Aboard says", which does not meet the product goal at scale (Context) |
| Members pay deposits and gas | Stops most students before their first vote, biases votes toward crypto holders, crypto promotion rules (MiCA, AMF), schools will not ask students to buy crypto |
| Coinbase Smart Wallet | Needs EntryPoint v0.6, absent on Intuition; factory not deployed (spike, 2026-11-26) |
| Embedded wallet provider (Privy, Dynamic, Web3Auth) | A third party holds or shards the key and becomes a dependency for every attestation. Kept as the fallback if the spike fails |
| Browser wallet (MetaMask, Rabby) | Excludes most of the audience |
| EIP-7702 on an EOA | Needs a secp256k1 private key held somewhere, which passkeys do not give |
| All-Aboard as a recovery owner | All-Aboard could then sign for the member |
| Intuition atom wallets | They belong to atoms, not to members |
| Operator deposits with the member's account as `receiver` | Shares land in the member's account, but the member signs nothing |

## Links

- Product: [resource-votes.md](../product/resource-votes.md), [certifications.md](../product/certifications.md), [missions.md](../product/missions.md), [monetization-ideas.md](../vision/monetization-ideas.md)
- Previous decisions: [ADR 0009](0009-certifications-intuition.md), [ADR 0010](0010-experience-certifications-missions.md), [ADR 0006](0006-authentication-passkeys.md), [ADR 0007](0007-oauth-google-sso.md)
- Sources: [Immunefi — Intuition scope](https://immunefi.com/bug-bounty/intuition/scope/), [RIP-7212](https://github.com/ethereum/RIPs/blob/master/RIPS/rip-7212.md), [ZeroDev — passkeys](https://docs.zerodev.app/sdk/advanced/passkeys), [viem — toWebAuthnAccount](https://viem.sh/account-abstraction/accounts/webauthn/toWebAuthnAccount)
