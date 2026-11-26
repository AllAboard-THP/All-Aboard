# Resource votes — community curation on Intuition

**Status:** product decisions, 2026-11-26 (first round, then revised the same day). Spec, not built. No issue yet.  
**Builds on:** [certifications.md](certifications.md) (skill +1, live on dev), [ADR 0009](../adr/0009-certifications-intuition.md) and [missions.md](missions.md).  
**Needs:** a new cross-cutting ADR (0011) for **member-held smart accounts**. ADR 0009 says users sign nothing; this feature makes members sign their own votes, and ADR 0011 should cover skills and missions too.

This page is the product source of truth for community votes on resources. It adds a third pillar to the profile, next to skill +1s and experience certifications: "they pass it on".

---

## Why

Resources are published after a mentor approves them (`pending` → `published`). After that, nothing tells a reader whether a resource is still good. Votes from members who work on the same subject give:

- **Author reputation**: a member who writes resources the community upvotes gets public credit on their profile and on Intuition.
- **Quality signal**: readers and mentors see when the community flags a resource as outdated or wrong, and the author is told so they can fix it.
- **Skill evidence**: upvoted resources on a skill are a second, distinct kind of proof for that skill, next to peer +1s.

The goal of the whole product is a CV **validated by the tech community**. That is why the member signs their own +1 on Intuition (decision 7): a claim signed by All-Aboard only proves that All-Aboard vouches for it.

---

## Decisions

| # | Question | Decision |
| --- | --- | --- |
| 1 | Who can vote? | **Eligible members**: the member has written a help request or a response on the resource's subject. **Mentors are always eligible**, with a normal vote |
| 2 | Can the author vote on their own resource? | **No** |
| 3 | Resources without a subject | **Subject required** on new resources. Existing ones without a subject are not votable until a subject is set |
| 4 | Meaning of a -1 | **-1 with a required reason**, plus an optional comment |
| 5 | -1 reasons | `outdated`, `incorrect`, `off_topic`, `low_quality` |
| 6 | Shape on Intuition | The resource is an atom; the claim is `(resource) isUseful`. **A +1 is a deposit in the claim's vault. The -1 stays off-chain** |
| 7 | Who signs? | **The member**, from an ERC-4337 smart account driven by their passkey. No seed phrase, no browser extension |
| 8 | Who pays? | **All-Aboard**: a paymaster pays gas, and All-Aboard funds a **fixed base deposit** per +1. **No voluntary extra deposit** for now |
| 9 | Vote weight | **One member, one vote.** The TRUST deposited is shown only as on-chain proof |
| 10 | Display | **Separate counts**: "12 useful · 2 reports", with the -1 reasons on hover. No net score |
| 11 | Votes over time | **Permanent weight**, no decay |
| 12 | Visibility of voters | **+1s are public** (who validated), like skill +1s. **-1s are anonymous**: count and reason only. Mentors see who sent a -1 when they review |
| 13 | Change or withdraw a vote | **Yes.** Postgres records the change; on-chain, the member redeems their +1 position (see open question 2) |
| 14 | Resource edited after -1s | **-1s go to "to reconfirm"**: they stop counting and their authors are notified to vote again. +1s stay |
| 15 | Effects of -1s | **Mentor review** past a threshold, **reader banner**, **notification to the author** |
| 16 | Review threshold | **At least 3 active -1s and more -1s than +1s**. The resource stays visible during review |
| 17 | Source of truth | **Postgres** for eligibility, counts and reasons. The chain is the public proof |
| 18 | Reputation surfaces | Score on the public profile, an on-chain `(person) authored (resource)` claim, and a link to skills |
| 19 | How a resource links to skills | **New skills field on resources**: the author picks skills from the catalogue, the mentor confirms them at approval |
| 20 | How upvotes count for a skill | **Distinct signal** ("Recognised through their resources"), separate from peer skill +1s |
| 21 | Delivery | **4 slices** (see below) |

### Why these choices

- **All-Aboard pays, not the member.** Making members buy TRUST would stop most students before their first vote, bias the votes toward people who own crypto, push vault speculation over evaluation, make withdrawing a vote cost money, and expose All-Aboard to crypto-asset promotion rules (MiCA, AMF). Schools, the first B2B target, will not ask students to buy crypto. Anti-spam comes from eligibility, the rate limit and moderation instead. The cost is a user acquisition cost, to be funded by B2B revenue ([monetization-ideas.md](../vision/monetization-ideas.md)).
- **One member, one vote.** Filtering voters by activity on the subject and then letting money decide would cancel the filter. Quality of a resource should not be for sale.
- **-1 off-chain.** A -1 signed by a member against a resource whose author is public would be a permanent, public negative mark on a person, even after the resource is fixed or the account deleted. In Postgres it stays a quality and moderation signal that can be erased.
- **Anonymous -1s.** Avoids retaliation between members who know each other. Mentors still see the author of a -1 to handle abuse.

---

## Journey

1. Alice writes a resource on the subject "Rails", picks the skill « Ruby on Rails », and submits it.
2. A mentor approves it and confirms the skill. The resource is `published`.
3. Bob has already posted a help request on "Rails", so he is eligible. He opens the resource and gives it a +1. His smart account signs the deposit; All-Aboard pays. Bob sees no wallet step.
4. Carol, also active on "Rails", gives a -1 with the reason `outdated` and the comment "Uses Rails 6 APIs removed in 8". Alice is notified of the reason, not of Carol's name.
5. The resource page shows "1 useful · 1 report". Bob is listed among the members who found it useful.
6. Two more members report it as outdated: 3 -1s against 1 +1. The resource goes to the mentors' review queue and readers see "Reported outdated by 3 members".
7. Alice updates the resource. The three -1s go to "to reconfirm", Carol and the others are notified, and the banner disappears until they vote again.
8. Alice's public profile shows the resource counts, and under « Ruby on Rails » a "Recognised through their resources" line. Each published +1 links to its deposit on the Intuition explorer.

A member who is not eligible sees the counts and a short rule ("Post or answer on this subject to vote"), not the buttons.

---

## Rules

- **Votable resources**: `published` with a subject. Pending and rejected resources show no vote UI.
- **One active vote per member and resource**: +1 or -1. Voting with the other value switches the vote.
- **Reason**: required on a -1, rejected on a +1.
- **Comment**: optional, 280 characters at most, checked by the existing moderation (regex, denylist, agent), as for skill +1s. A flagged comment rejects the vote (`comment_rejected`).
- **Rate limit**: same order as skill +1s (for example 20 votes per rolling 24 hours). Also caps the sponsored deposits. To confirm at build time.
- **Self vote**: refused (`self_vote`).
- **Withdrawal**: sets `revoked_at` in Postgres; reads ignore withdrawn votes. On-chain, the +1 history stays.
- **Edit after -1s**: an edit by the author moves active -1s to "to reconfirm". They do not count, do not trigger review and do not show in the banner until their author votes again.
- **Review**: when a resource reaches 3 active -1s and more -1s than +1s, it enters the mentor queue once. It stays visible. The mentor can keep it, ask the author to fix it, or unpublish it.
- **Outbox**: each vote, switch and withdrawal writes an event in the same transaction, like `certification.attested`.

---

## What is on-chain, and what is not

| In the app | On Intuition |
| --- | --- |
| The resource | Yes — an atom with a stable public URL, for example `<web origin>/r/<resource uuid>` (redirect alias, same pattern as `/u/[id]` and `/m/[id]`). No title or body on-chain |
| "This resource is useful" | Yes — the claim `(resource) isUseful` |
| A +1 | Yes — a fixed deposit in the claim's vault, signed by the member's smart account, paid by All-Aboard |
| A -1, its reason and comment | No — Postgres only |
| Who wrote the resource | Yes — `(person) authored (resource)`. Signer to settle in ADR 0011 (see open question 3) |
| Eligibility (activity on the subject) | No — help requests and responses stay in Postgres |
| The resource ↔ skill link | Not in the first on-chain slice. To decide in ADR 0011 |

Predicate names and atom bytes are not frozen. ADR 0011 settles them.

---

## Reputation

| Surface | Content |
| --- | --- |
| Public profile | Resource counts next to validated skills and experience |
| Skills card | Per skill, a distinct line "Recognised through their resources" with the number of upvoted resources tagged with that skill. Peer +1s stay a separate count |
| Intuition | Members' +1 deposits and `(person) authored (resource)` claims, so another app can join authorship with who vouched for the resource |

---

## Delivery

| Slice | Scope | Web3 |
| --- | --- | --- |
| 1 — Votes in Postgres | `resource_votes` table, required subject, eligibility (mentors included), reasons, moderation, switch and withdrawal, "to reconfirm" on edit, counts and banner, author notification, mentor review queue, score on the profile, outbox events | None |
| 2 — ADR 0011 and spike | Passkey-driven smart account (ERC-4337) on Intuition's chain, paymaster for gas, sponsored fixed deposit, deposit and redeem from the account on testnet, cost per vote. Covers skills and missions too | Spike only |
| 3 — On-chain +1s | Resource atom, `isUseful` claim, member deposits, redeem on withdrawal, authorship claim, proof links | Testnet |
| 4 — Skills link | Skills field on resources (author picks, mentor confirms), "Recognised through their resources" on the profile | Per ADR 0011 |

Slices 1 and 4 do not depend on the chain and can ship first.

---

## Open questions

1. **Passkeys on Intuition's chain.** A passkey signs with P-256. The smart account needs the chain to verify that cheaply (RIP-7212 precompile) or a fallback (embedded wallet secured by the passkey). The spike (slice 2) checks it.
2. **Withdrawal on-chain.** Redeeming returns less than the deposit because of protocol fees, and the sponsored TRUST then sits in the member's account. Decide whether it goes back to All-Aboard or stays for the next vote.
3. **Who signs `authored`?** The author signing it is a self-claim. All-Aboard signing it at approval (the mentor validated the resource) is closer to the truth, but brings back operator signing for that one claim.
4. **Co-signing past skill +1s.** Once members have accounts, they can deposit on the triples the operator already created. ADR 0011 decides whether All-Aboard offers that and pays for it.
5. **Mainnet.** Testnet only, as for certifications. Mainnet needs the same separate decision as ADR 0009.

---

## Out of scope

- Ranking or automatically hiding resources by score.
- Replacing mentor approval with community votes.
- Voluntary deposits by members, and any weight tied to money.
- Votes on help requests, responses or missions.
- Wallet login. Passkeys stay the login; the smart account is a signer behind it.
- An in-repo indexer (`apps/indexer` stays forbidden).
