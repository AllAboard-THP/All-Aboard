# Resource votes — community curation on Intuition

**Status:** product decisions, 2026-11-26. Spec, not built. No issue yet.  
**Builds on:** [certifications.md](certifications.md) (skill +1, live on dev), [ADR 0009](../adr/0009-certifications-intuition.md) and [missions.md](missions.md).  
**Needs:** a new ADR (0011) for member-held smart accounts. ADR 0009 says users sign nothing; this feature makes members sign their own votes.

This page is the product source of truth for community votes on resources. It adds a third kind of signal next to skill +1s and experience certifications: "this resource is useful" or "this resource has a problem".

---

## Why

Resources are published after a mentor approves them (`pending` → `published`). After that, nothing tells a reader whether a resource is still good. Votes from members who work on the same subject give:

- **Ranking signal**: readers see which resources the community stands behind, and which ones it flags as outdated or wrong.
- **Author reputation**: a member who writes resources the community upvotes gets public credit on their profile and on Intuition.
- **Skill evidence**: upvoted resources on a skill are a second, distinct kind of proof for that skill, next to peer +1s.

Putting votes on Intuition (not only in Postgres) makes the curation public and reusable, like skill certifications.

---

## Decisions (2026-11-26)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Who can vote? | **Eligible members only**: the member has written a help request or a response on the resource's subject |
| 2 | Can the author vote on their own resource? | **No** |
| 3 | Meaning of a -1 | **-1 with a required reason**, plus an optional comment |
| 4 | -1 reasons | `outdated`, `incorrect`, `off_topic`, `low_quality` |
| 5 | Shape on Intuition | **For / against vaults**: the resource is an atom, the claim is `(resource) isUseful`. A +1 deposits in the claim's vault, a -1 in its counter vault |
| 6 | Who signs and deposits? | **The member**, from their own wallet |
| 7 | Wallet type | **ERC-4337 smart account driven by the member's passkey**. No seed phrase, no browser extension |
| 8 | Who pays TRUST and gas? | **Hybrid**: a paymaster sponsored by All-Aboard pays gas, and a sponsored quota covers the base deposit. A member can deposit more TRUST from their own funds to weigh more |
| 9 | Vote weight | **Weighted by deposit** (Intuition's native model). See open question 1 |
| 10 | Change or withdraw a vote | **Yes.** Postgres records the change first; on-chain, the position is redeemed or moved to the opposite vault |
| 11 | Source of truth | **Postgres** for eligibility, score and reasons. The chain is the public proof, as for skill +1s |
| 12 | What the score is for | **Author reputation** (not ranking, auto-hiding or replacing mentor review in this scope) |
| 13 | Reputation surfaces | Score on the public profile, an on-chain `(person) authored (resource)` claim, and a link to skills |
| 14 | How a resource links to skills | **New skills field on resources**: the author picks skills from the catalogue, the mentor confirms them at approval |
| 15 | How upvotes count for a skill | **Distinct signal** ("Recognised through their resources"), separate from peer skill +1s |
| 16 | Delivery | **4 slices** (see below) |

---

## Journey

1. Alice writes a resource on the subject "Rails", tags it with the skill « Ruby on Rails », and submits it.
2. A mentor approves it and confirms the skill. The resource is `published`.
3. Bob has already posted a help request on "Rails", so he is eligible. He opens the resource and gives it a +1.
4. Carol, also active on "Rails", gives a -1 with the reason `outdated` and the comment "Uses Rails 6 APIs removed in 8".
5. The resource page shows the vote counts. Bob and Carol see their own vote and can withdraw or switch it.
6. Alice's public profile shows "Resources: +X / -Y", and, under « Ruby on Rails », a "Recognised through their resources" line.
7. Once published on Intuition, each vote links to its deposit on the explorer, and Alice's authorship links to its claim.

A member who is not eligible sees the counts and a short rule ("Post or answer on this subject to vote"), not the buttons.

---

## Rules

- **Votable resources**: `published` only. Pending and rejected resources show no vote UI.
- **One active vote per member and resource**: +1 or -1. Voting again with the other value switches the vote.
- **Reason**: required on a -1, rejected on a +1.
- **Comment**: optional, 280 characters at most, checked by the existing moderation (regex, denylist, agent), as for skill +1s. A flagged comment rejects the vote (`comment_rejected`).
- **Rate limit**: same order as skill +1s (for example 20 votes per rolling 24 hours). To confirm at build time.
- **Self vote**: refused (`self_vote`).
- **Withdrawal**: sets `revoked_at` in Postgres; reads ignore withdrawn votes. On-chain, the history stays.
- **Outbox**: each vote, switch and withdrawal writes an event in the same transaction, like `certification.attested`.

---

## What is on-chain, and what is not

| In the app | On Intuition |
| --- | --- |
| The resource | Yes — an atom with a stable public URL, for example `<web origin>/r/<resource uuid>` (redirect alias, same pattern as `/u/[id]` and `/m/[id]`). No title or body on-chain |
| "This resource is useful" | Yes — the claim `(resource) isUseful` |
| A +1 | Yes — the member's deposit in the claim's vault |
| A -1 | Yes — the member's deposit in the claim's counter vault |
| The -1 reason and the comment | No — Postgres, so they can be moderated and erased |
| Who wrote the resource | Yes — `(person) authored (resource)`, published by the operator |
| Eligibility (activity on the subject) | No — help requests and responses stay in Postgres |
| The resource ↔ skill link | Not in the first on-chain slice. To decide in ADR 0011 |

Predicate names and atom bytes are not frozen. ADR 0011 settles them.

---

## Reputation

| Surface | Content |
| --- | --- |
| Public profile | "Resources: +X / -Y" next to validated skills and experience |
| Skills card | Per skill, a distinct line "Recognised through their resources" with the number of upvoted resources tagged with that skill. Peer +1s stay a separate count |
| Intuition | `(person) authored (resource)` claims, so another app can join authorship with the vault positions |

---

## Delivery

| Slice | Scope | Web3 |
| --- | --- | --- |
| 1 — Votes in Postgres | `resource_votes` table, eligibility, reasons, moderation, switch and withdrawal, outbox events, counts on the resource page, score on the profile | None. Score = number of voters |
| 2 — ADR 0011 and spike | Passkey-driven smart account (ERC-4337), paymaster for gas, sponsored TRUST quota, deposit and redeem from the account on testnet, cost per vote | Spike only |
| 3 — On-chain votes | Resource atom, `isUseful` claim, member deposits in for / against vaults, switch and redeem, authorship claim by the operator, proof links | Testnet |
| 4 — Skills link | Skills field on resources (author picks, mentor confirms), "Recognised through their resources" on the profile | Per ADR 0011 |

Slices 1 and 4 do not depend on the chain and can ship first.

---

## Open questions

1. **Deposit weight vs Postgres as source of truth.** In slice 1 there are no deposits, so the score counts voters. Once deposits exist, Postgres must read the amounts from the chain to show a weighted score. Proposal: show the voter count as the main score, and the TRUST deposited next to it as the on-chain proof.
2. **Deposit weight lets money override the community.** One eligible member with funds can sink a resource alone. Options: cap the weight of one vote in the app score, or weight only the sponsored part.
3. **Scope of ADR 0011.** Do skill +1s and mission validations also move to the member's smart account, or stay signed by the operator? Mixing both models on one profile needs a clear explanation on the proof pages.
4. **Resources without a subject.** `resources.subject_id` is nullable. Either nobody is eligible on those, or the rule falls back to something else (for example, activity on a linked skill).
5. **Switching a vote on-chain** needs a redeem then a deposit, so two transactions, or one batched user operation. The spike (slice 2) checks whether redeeming returns enough to fund the opposite deposit.
6. **Mainnet.** Testnet only, as for certifications. Mainnet needs the same separate decision as ADR 0009.

---

## Out of scope

- Using the score to rank, hide or re-review resources. Possible later, not in this spec.
- Replacing mentor approval with community votes.
- Votes on help requests, responses or missions.
- Wallet login. Passkeys stay the login; the smart account is a signer behind it.
- An in-repo indexer (`apps/indexer` stays forbidden).
