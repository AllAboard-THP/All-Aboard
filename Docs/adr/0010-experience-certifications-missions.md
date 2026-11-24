# ADR 0010 — Experience certifications from missions

## Status

Proposed — 2026-11-24 ([#193](https://github.com/AllAboard-THP/All-Aboard/issues/193)).

Implements the product spec [missions.md](../product/missions.md). Extends [ADR 0009](0009-certifications-intuition.md): same operator wallet, outbox and publisher, with a second certification type.

## Context

Skill +1s are live on dev and published on Intuition testnet (ADR 0009, [#172](../tasks/172-skill-certifications/README.md), [#180](../tasks/180-certifications-publish/README.md)). The product now adds missions: a mentor posts a mission, accepts applicants, and validates each participant's work. Each validation is an **experience** certification on the participant's profile.

Product decisions already taken (2026-11-24, [missions.md](../product/missions.md#decisions-2026-11-24)): mentors only post, several participants per mission, validation per participant, only the mission URL on-chain, moderation of mission content.

ADR 0009 left three points open for this type, settled below: the table, the mission atom, and the rules around validation.

## Decision

### 1. Data model: a separate `experience_certifications` table

The skill +1 and the experience certification share the publish columns but differ in everything else:

| | Skill +1 (`certifications`) | Experience (`experience_certifications`) |
| --- | --- | --- |
| Object | `skill_id` | `mission_id` |
| Attester | Any peer the recipient helped | The mission's author only |
| Unique | `(recipient, attester, skill)` | `(mission, recipient)` |
| Eligibility | A help request answered by the recipient | An `accepted` application |

One table with a `kind` column would need nullable foreign keys and conditional constraints. A separate table keeps each check in the schema.

**`experience_certifications`**

- `id`, `mission_id`, `recipient_id`, `attester_id`, `application_id` (unique), `comment` (nullable, 280 characters, moderated), `created_at`, `revoked_at`.
- On-chain columns, same meaning as ADR 0009 §4: `claim_triple_id`, `attestation_triple_id`, `tx_hash`, `published_at`, `publish_error`, `publish_attempts`.
- Unique on `(mission_id, recipient_id)`. Check `recipient_id <> attester_id`.

Missions, skills links and applications follow the model in [missions.md](../product/missions.md#data-model-postgres-stays-the-source-of-truth). The profile reads skills and experiences from their own tables and shows them as two cards.

### 2. Graph shape

| Product object | Atom / triple | Bytes or predicate |
| --- | --- | --- |
| Participant | Atom | Person atom of ADR 0009 (`<origin>/u/<uuid>`), unchanged |
| Mentor | Atom | Same shape |
| Mission | Atom | **The plain URL string** `<origin>/m/<mission uuid>`, built by a new `missionAtom` in `@allaboard/blockchain`, like `personAtom`. Same origin (`INTUITION_PROFILE_ORIGIN`). No title, type or description |
| Claim | Triple | `(person) contributedTo (mission)` |
| Validation | Nested triple | `(claim) attestedBy (mentor)` |

- **Plain URL, not JSON-LD.** The product chose to publish only the URL. A JSON-LD object holding only a `url` would add bytes without information. The plain string also matches the person atom.
- **`/m/[id]` is a web alias** that redirects (308) to `/missions/[id]`, so the atom keeps resolving if routes change. A hidden or deleted mission no longer shows, and the triples stay as history.
- **`contributedTo`** comes from the `@0xintuition/predicates` registry (`@0xintuition/predicates/contributedTo`): "The subject actor made a meaningful contribution to the object project, work, or entity". Its registry status is `proposed`, like the other predicates we use. The publisher creates the predicate atom once per network if it is missing, as for `expertIn`.
- **`attestedBy`** keeps the ADR 0009 meaning and caveat: All-Aboard's operator records the validation on the mentor's behalf. The proof page says so.

Rejected: `expertIn (mission)` mixes skill and experience under one predicate. `worksFor` or membership predicates describe an employer or a group, not a piece of work. `(mentor) endorse (person)` drops the mission.

Golden-id tests freeze `missionAtom` bytes and the `contributedTo` id.

### 3. Rules for a validation

`POST /missions/:id/applications/:applicationId/validate` (author only) inserts the row and the outbox event in one transaction. It is refused unless:

- the caller is the mission's author (they do not need the mentor role any more, see [missions.md](../product/missions.md#data-model-postgres-stays-the-source-of-truth));
- the application is `accepted`;
- the mission is not `cancelled`, **or** it is cancelled and the application has a `deliverable_url` (decided 2026-11-24: work delivered before the cancellation can still be validated);
- the comment, if any, passes moderation.

A deliverable link is **optional** for missions that are not cancelled (decided 2026-11-24), so work without code can be validated. When a link exists, the profile shows it.

Validation does not depend on the mission's dates or on `completed`. The mentor can validate a participant as soon as the work is done.

### 4. Publisher: outbox event `experience.attested`

The poller gets a third consumer, for `experience.attested` (`aggregate_id` = experience certification id). It follows ADR 0009 §5 step by step: reload the row, skip and mark processed if `revoked_at` is set, compute the ids, create the missing atoms and triples in one batch, write the receipt fields.

The skill consumer and this one share the chain client, the operator wallet, the backoff and the admin replay. Only the term builder differs (`experienceTerms` next to `certificationTerms`).

Cost: like a +1, 0.1 per new atom and 0.1 per new triple on testnet. A validation creates at least the mission atom, the claim and the validation (about 0.3), plus the person atoms the first time.

### 5. Withdrawal

The author can withdraw a validation (decided 2026-11-24), with the same rule as a +1 (ADR 0009 §5):

- `revoked_at` is set, and reads hide the row. Nothing is sent to the chain.
- If it was not published yet, it never is.
- If it was published, it stays on-chain as history, and the proof page says so.
- Validating the same participant again reactivates the same row and event.

Admins can withdraw a validation through moderation, with the same effect.

### 6. Missions are never hard-deleted once validated

A mission with at least one experience certification, published or not, cannot be deleted. It can be cancelled or hidden by an admin. This keeps `/m/[id]` and the profile cards consistent with the chain as long as possible.

## Consequences

- **Positive:**
  - The profile gets a second, verifiable section ("Experience"), with no new infrastructure.
  - No mission text goes on-chain, so titles can be edited and nothing confidential is published by mistake.
  - The publisher, wallet, env and admin tools from ADR 0009 are reused as they are.
- **Negative:**
  - On-chain, the claim only says "this person contributed to this URL". Without All-Aboard, a reader cannot see what the mission was.
  - Every validation costs the operator about 0.3 tTRUST the first time, more than a +1.
  - A second certification table means two read paths on the profile and two consumers to keep aligned.
- **Risks:**
  - A mentor validating friends in bulk. Mitigation: only accepted applications, places limit, rate limit per author, admin withdrawal.
  - A deleted account or hidden mission leaves a URL that resolves to nothing. Same accepted risk as person atoms in ADR 0009.
- **Env:** none new. `INTUITION_PROFILE_ORIGIN` also builds mission URLs.

## Alternatives not chosen

| Alternative | Why not |
| --- | --- |
| `kind` column in `certifications` | Nullable foreign keys and conditional uniques, eligibility rules mixed in one table |
| Mission title in the atom | Permanent and public. Product decision 2026-11-24: URL only |
| JSON-LD atom (`buildThing`, `buildEvent`, `buildJobPosting`) | Needs a name to be useful; without the title it adds nothing over the URL |
| One claim per mission, `(mission) attestedBy (mentor)` | The chain would not say who did the work |
| Participants sign with a wallet | Same reason as ADR 0009: passkey login, no wallet onboarding |

## Links

- Product: [missions.md](../product/missions.md), [certifications.md](../product/certifications.md)
- Base decision: [ADR 0009](0009-certifications-intuition.md)
- Epic: [#193](https://github.com/AllAboard-THP/All-Aboard/issues/193)
