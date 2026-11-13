# ADR 0009 — Skill certifications on Intuition

## Status

Accepted — 2026-11-13. Proposed 2026-10-30; spike [#161](../tasks/161-certifications-spike/README.md): a real +1 was written on testnet on 2026-11-02. Reading it back through the hosted GraphQL is not confirmed, so the read path does not depend on it (section 6).

Implements the product decision in [certifications.md](../product/certifications.md) (2026-10-19). Settles the points [ADR 0004](0004-agent-indexer-architecture.md) left open in its 2026-10-28 revision: package stack, on-chain identity, and signer.

## Context

The web3 scope is **certifications only**. A peer gives a +1 to a skill on someone's profile, with an optional comment. The +1 is published on Intuition so the profile becomes a CV validated by the community, which is public and reusable outside All-Aboard.

State of the repo on 2026-10-30:

| Piece | State |
| --- | --- |
| Outbox | `outbox_events`, polled in the API process. Only `help_request.created` is consumed, by a stub that never writes on-chain ([#67](../tasks/67-intuition-bridge/README.md)). |
| Intuition dependencies | None. `@0xintuition/sdk` and `viem` were removed from `apps/api` on 2026-10-28. |
| Env | `INTUITION_RPC_URL` and `INTUITION_NETWORK_ID` reserved for this ADR. `INTUITION_API_KEY` is a Core write key (`ik_…`). `INTUITION_GRAPHQL_URL` is the hosted read path. |
| Skills | No catalog. `users.certification_tags` is a free text array used to filter mentor responses ([#83](../tasks/83-response-filtering/README.md)). `subjects` holds feed categories. |
| Login | Passkeys and Google ([ADR 0006](0006-authentication-passkeys.md), [ADR 0007](0007-oauth-google-sso.md)). Users have no wallet. |

Packages available on npm (checked 2026-10-30, all ESM; `apps/api` is `"type": "module"`):

| Package | Version | Use |
| --- | --- | --- |
| `@0xintuition/ids` | `0.1.0-alpha.1` (`@alpha`) | Atom and triple ids from bytes, offline |
| `@0xintuition/predicates` | `0.1.0-alpha.1` (`@alpha`) | Canonical predicate registry. Peer dependency `viem ^2` |
| `@0xintuition/primitives` | `0.1.0-alpha.1` (`@alpha`) | Atom and claim builders with validation |
| `@0xintuition/classifications` | `0.1.0-alpha.1` (`@alpha`) | JSON-LD shapes for atoms |
| `@0xintuition/protocol` | `2.0.3` (`latest`), `3.0.0-alpha.0` (`@alpha`) | MultiVault create / deposit / redeem |
| `@0xintuition/deployments` | `0.1.0-alpha.1` (`@alpha`) | Chain ids and contract addresses |

Sources and how they fit together: [intuition-web3.md](../integrations/intuition-web3.md).

## Decision

### 1. Write path: direct on-chain, operator wallet, testnet first

The API publisher writes atoms and triples to the Intuition **MultiVault** with `@0xintuition/protocol`, signed by **one operator wallet** owned by All-Aboard.

- **Network:** Intuition testnet only, selected by `INTUITION_NETWORK_ID` and resolved through `@0xintuition/deployments`. Mainnet needs a separate decision: security review, funding policy, and an ADR revision.
- **Signer:** new secret `INTUITION_PUBLISHER_PRIVATE_KEY`, on the API service only. It is never logged, never sent to `apps/web`, and is separate from `INTUITION_API_KEY`. No key means the publisher stays off and events wait in the outbox.
- **Not Core's write API:** `POST /api/atoms` on an Intuition Core node writes to that node's knowledge graph, not to the chain. It also needs a node we run, built from the unreleased `feat/intuition-core-v2` branch. That does not give the public claim the product needs. Core stays a possible **read** path later.
- **Users sign nothing.** The wallet is not a login, and users keep using passkeys. On-chain, the operator is the signer. The peer appears as an atom in the claim (section 2). Trust therefore rests on All-Aboard's operator: the claim is public and append-only, but it is not cryptographically signed by the peer. User-held wallets (embedded wallets, smart accounts) are out of scope for this ADR.

### 2. Graph shape

Ids are computed locally with `@0xintuition/ids` before any publish and stored in Postgres. Atom bytes are frozen in code, and golden-id tests keep them fixed: changing one byte changes the id.

| Product object | Atom / triple | Bytes or predicate |
| --- | --- | --- |
| Person receiving the +1 | Atom | Public profile URL on the production web domain, `https://<WEB_APP_URL>/u/<user uuid>`. No name, email, or avatar on-chain. Chosen over the auth-user atom from `@0xintuition/ids` (a hash of the user id) because other apps can resolve a URL, which keeps the CV reusable (decided 2026-11-13). |
| Peer giving the +1 | Atom | Same shape as the recipient |
| Skill (« Ruby on Rails ») | Atom | Canonical JSON-LD skill term. schema.org `DefinedTerm` built with `buildDefinedTerm` from `@0xintuition/primitives/atom`, with `name` only, frozen in `packages/blockchain`. |
| Claim | Triple | `(person) expertIn (skill)`. Created once per person and skill, shared by every +1. |
| +1 | Nested triple | `(claim triple) attestedBy (peer)`. One per peer, recipient, and skill. |

Predicates come from the `@0xintuition/predicates` registry, imported one at a time (`@0xintuition/predicates/expertIn`, `@0xintuition/predicates/attestedBy`):

- `expertIn`: "The subject claims or is recognized as having deep expertise in the object domain or skill".
- `attestedBy`: "The subject claim or credential is witnessed and signed by the object attestor".

The registry defines `attestedBy` as "signed by the object attestor", but here the operator signs, not the peer. We keep the predicate (decided 2026-11-13). Every place that shows the proof states that All-Aboard recorded the +1 on the peer's behalf (section 6).

Rejected predicates: `endorse` and `vouchFor` would make the peer the subject (`peer endorse person`), so they drop the skill. `certifiedBy` describes an issuing authority, not a peer.

The two predicates do not exist yet on testnet or mainnet (checked 2026-11-02). The publisher creates them once per network, before the first +1.

The deployed testnet MultiVault accepts a triple as the subject of a triple (confirmed by a real transaction on 2026-11-02). Mainnet may run an older implementation: re-check before any mainnet decision.

Experience certifications (missions) reuse this shape later with another object and predicate. They are not built now.

### 3. The comment stays off-chain

The product page first put the optional comment on Intuition. This ADR keeps it **in Postgres for the first slice** (product sign-off 2026-10-30; certifications.md updated):

- Anything written on-chain is permanent and public. A comment can hold personal data or abuse that we would have to remove (GDPR erasure, moderation through `denylist_patterns` and Claude moderation), and that is impossible on a chain.
- The +1 itself carries the proof (who, for whom, which skill). The comment adds context, not proof.

Revisit after moderation is in place, for example by publishing only a hash of the comment.

### 4. Data model (Postgres stays the product source of truth)

- **`skills`**: admin-curated catalog (`id`, `slug` unique, `label`, `intuition_atom_id`). It is separate from `subjects` (feed categories) and from `users.certification_tags`, which keeps its role as an in-app filter.
- **`certifications`**: one row per +1.
  - `recipient_id`, `attester_id`, `skill_id`, `comment` (nullable), `created_at`, `revoked_at`.
  - On-chain fields: `claim_triple_id`, `attestation_triple_id`, `tx_hash`, `published_at`, `publish_error`, `publish_attempts`.
  - Unique on `(recipient_id, attester_id, skill_id)`. Check `recipient_id <> attester_id`.
- **Eligibility:** the attester authored a help request that the recipient answered (`responses.author_id = recipient`, on a `help_requests` row whose `author_id = attester`). This follows the journey in certifications.md ("user 1 helps user 2"), blocks +1s between strangers, and keeps the cost of on-chain writes bounded. Rate limit per attester.

### 5. Publisher: outbox event `certification.attested`

- `POST /users/:id/certifications` inserts the `certifications` row and a `certification.attested` outbox event (`aggregate_id` = certification id) in **one transaction**. The `201` does not wait for the chain.
- The poller in the API process gets a second consumer, which reads only `certification.attested`. The `help_request.created` stub stays as it is.
- The consumer:
  1. computes the ids;
  2. creates the missing atoms and triples (person, peer, skill, claim, +1) in one `createAtoms` / `createTriples` batch, skipping those already on-chain;
  3. waits for the receipt and writes `tx_hash`, the triple ids and `published_at`.
- **Idempotence** comes from deterministic ids: a retry checks on-chain existence before creating. Errors increment `publish_attempts` with backoff. After a ceiling, the event stays unprocessed with `publish_error` set, and an admin can replay it.
- **Revocation** (removing a +1), decided 2026-11-13:
  - **First slice: Postgres only.** Set `revoked_at`; reads ignore revoked rows. Nothing is sent to the chain and there is no `certification.revoked` event. No app reads these +1s outside All-Aboard yet, and this avoids locking TRUST in a deposit on every +1.
  - **A withdrawn +1 stays on-chain.** That is the history. The proof page says so (section 6).
  - **Before other apps consume these +1s, or before mainnet:** test a deposit in the +1's counter vault (`calculateCounterTripleId`). It is the most likely way to signal a withdrawal on-chain, especially for moderation. Redeeming the operator's position is not an option as things stand: with a deposit of exactly the triple cost, the creator holds 0 shares ([spike](../tasks/161-certifications-spike/README.md)).
- **Gas and deposits:** creating atoms and triples costs the protocol's fee plus gas, in the network's token: 0.1 per atom and 0.1 per triple on testnet and mainnet, so 0.1 to 0.2 per +1 once the shared atoms exist ([spike results](../tasks/161-certifications-spike/README.md)). Gas is negligible next to that. The operator wallet is funded on testnet. A low-balance check is logged at publisher start-up and exposed in the health details.

### 6. Code placement and reads

- **`packages/blockchain`** (`@allaboard/blockchain`, new): pure code with no secrets and no network calls. It holds the atom builders, the frozen bytes, id helpers over `@0xintuition/ids` and the predicate imports, and the golden-id tests. It depends on `@0xintuition/ids`, `@0xintuition/predicates`, `@0xintuition/primitives` and, if chosen, `@0xintuition/classifications`, plus `viem` for the peer dependency.
- **`apps/api/src/intuition/`**: the certification publisher (`@0xintuition/protocol`, `@0xintuition/deployments`, `viem` wallet client). It stays in the API process, as ADR 0004 section 2 allows.
- **Reads:** the profile shows +1s from Postgres. It is fast, works when the chain is down, and hides revoked rows. Each published +1 links to its triple in the Intuition explorer as the public proof. The proof page states that All-Aboard recorded the +1 on the peer's behalf (the peer did not sign it), and that a withdrawn +1 stays on the chain as history. Reconciliation uses contract reads (`isTriple`). The hosted GraphQL (`INTUITION_GRAPHQL_URL`) is not relied on yet: it had not indexed the spike's +1 after 35 minutes. Showing +1s that other apps wrote on the same claim is a later step.
- Pin exact alpha versions in `package.json`. The `@alpha` tag moves.

### 7. Spike before implementation

A short task, on testnet, with a throwaway wallet:

1. Confirm the testnet chain id and MultiVault address from `@0xintuition/deployments`, and which `@0xintuition/protocol` line (`2.0.3` or `3.0.0-alpha.0`) matches the deployed contracts.
2. Create a person atom, a skill atom, the `expertIn` claim, and the nested `attestedBy` triple. Check that the ids match `@0xintuition/ids` offline.
3. Measure the cost of one +1 (deposits and gas) to size the operator wallet.
4. Choose the skill atom shape (classification or `DefinedTerm`).
5. Read the result back through hosted GraphQL.

Results (2026-11-02): items 1 to 4 confirmed, with `@0xintuition/protocol` `3.0.0-alpha.0` on testnet. Item 5 is not confirmed. Details in the [spike notes](../tasks/161-certifications-spike/README.md).

## Consequences

- **Positive:**
  - The claims are public and readable by other apps under canonical predicates.
  - Users sign nothing, so the passkey journey stays as it is.
  - Product reads stay in Postgres.
  - Ids are known before publish, so retries are safe and Postgres links to on-chain data without a lookup.
- **Negative:**
  - All-Aboard holds a hot key and pays for every +1.
  - The proof says "All-Aboard recorded that this peer attested", not "this peer signed".
  - Until counter-vault signalling exists, the chain does not show that a +1 was withdrawn. Only All-Aboard knows.
  - The stack adds alpha packages and `viem` back to the repo.
- **Risks:**
  - **Key leak:** testnet only. On mainnet, the key needs a dedicated wallet with a small balance and a rotation plan.
  - **Alpha APIs change:** pinned versions and golden-id tests.
  - **Profile URL atoms point to a page that disappears when an account is deleted.** The atom holds no personal data, and the triples stay as history.
- **Env:** add `INTUITION_PUBLISHER_PRIVATE_KEY`. `INTUITION_RPC_URL` and `INTUITION_NETWORK_ID` become used. `INTUITION_API_KEY` stays unused until a Core node is adopted. Update [environment-variables.md](../deployment/environment-variables.md) and `.env.example` with the implementation.

## Alternatives not chosen

| Alternative | Why not |
| --- | --- |
| Intuition Core write API (`POST /api/atoms`) | Writes to the node's graph, not the chain. Needs a node built from an unreleased branch. |
| Users sign with their own wallet | Contradicts passkey login and adds wallet onboarding. Revisit with embedded wallets later. |
| Operator deposit on the claim only, peer kept in Postgres | The chain would not say who attested. Not needed: nested triples work on testnet. |
| `(peer) endorse / vouchFor (person)` | Loses the skill. |
| Comment on-chain | Permanent and unmoderatable. See section 3. |
| Read the profile from GraphQL | Adds latency and a hard dependency on the indexer for every profile view. |
| Reuse `subjects` or `certification_tags` as skills | Feed categories and free text are not a stable, curated vocabulary with frozen atom bytes. |
| Publish help requests | Out of the web3 scope since 2026-10-19. |

## Links

- Product: [certifications.md](../product/certifications.md)
- Sources: [intuition-web3.md](../integrations/intuition-web3.md), [Unchained](https://unchained.intuition.systems)
- Previous framing: [ADR 0004](0004-agent-indexer-architecture.md), [task #67](../tasks/67-intuition-bridge/README.md)
