# Certifications — community CV on Intuition

**Status:** product decision, 2026-10-19. Not implemented.  
**Web3 scope:** certifications only. Help requests stay in Postgres.  
**Architecture:** [ADR 0009](../adr/0009-certifications-intuition.md) (proposed). The optional comment stays off-chain in the first slice (product sign-off 2026-10-30).

This page is the product source of truth for what All-Aboard publishes to Intuition. Protocol packages and the indexer choice stay in [intuition-web3.md](../integrations/intuition-web3.md). The Phase 4 bridge in [ADR 0004](../adr/0004-agent-indexer-architecture.md) shipped an outbox stub on `help_request.created`. That stub is not the product target.

---

## Why this is on the graph

A certification is a peer saying, in public, that someone has a skill or has done a piece of work. Collected on a profile, those attestations are a CV validated by the tech community.

Putting them on Intuition (not only in All-Aboard’s database) is what makes that CV:

- **Community-validated** — a peer attests; the person does not grant the badge to themselves.
- **Hard to falsify quietly** — the attestation is a public claim on the graph, not a private row we can edit unnoticed.
- **Reusable** — another app can read the same claims. The CV is not locked inside All-Aboard.

Login stays passkeys ([ADR 0006](../adr/0006-authentication-passkeys.md)). A wallet is not how a user signs in. Publishing uses an operator key on the server.

---

## What is on-chain, and what is not

| In the app | On Intuition |
| --- | --- |
| Profile of the person receiving the certification | Yes — the subject of the claim |
| Skill or experience being attested | Yes — a shared entry the community reuses |
| The +1 (who attested, to whom, for which skill) | Yes — this is the certification |
| The optional short comment | No (first slice) — kept in Postgres so it can be moderated and erased. See [ADR 0009](../adr/0009-certifications-intuition.md) §3 |
| Help requests, feed, chat, resources, admin | No |
| Passkey login | No |

A help interaction can be the reason someone gives a +1. The help request itself is not published.

---

## Skill certifications (build this first)

Professional **skill** certifications. Example: Ruby on Rails.

1. User 1 helps user 2 (the help request stays in the app).
2. User 2 opens user 1’s profile.
3. User 2 picks the matching skill in a menu, for example « Ruby on Rails ».
4. User 2 adds a +1, with an optional short comment.
5. The profile shows that attestation as community proof of the skill.

The menu entry is a shared skill, not a free-text tag stored only on the user row.

### What the code does today

`users.certification_tags` is a text array on the user (seed data, or a profile patch). It filters mentor responses on a help request when tags overlap ([#83](https://github.com/AllAboard-THP/All-Aboard/issues/83)). That is not a peer +1, not a comment, and not a graph write.

Do not treat `certification_tags` as the web3 model. It can stay as the in-app filter until the profile attestation flow exists.

---

## Experience certifications (later — do not implement yet)

A second type, kept on purpose so the first build does not paint the product into “skills only”.

All-Aboard will later offer **missions**. Completing a mission grants an **experience** certification: an achievement (“they did this work”), not only a skill (“they know this tool”).

| Type | Attests | When |
| --- | --- | --- |
| Skill | A professional competence (example: Ruby on Rails) | First web3 slice — peer +1 on a profile |
| Experience | A professional achievement from a completed mission | Later — same graph, different claim |

Both types are certifications on the person’s profile, read from Intuition. Missions and the experience claim are out of scope until the skill +1 exists.

---

## Shape on Intuition (not a frozen schema)

The predicate names and the exact atom bytes are not chosen yet. The product objects are:

| Product object | Graph role |
| --- | --- |
| The user who receives the +1 | Person |
| The menu entry (« Ruby on Rails », or later a mission achievement) | Shared skill or experience |
| The +1 | Attestation from the peer to that person, for that skill or experience |
| The optional comment | Off-chain in the first slice (Postgres, linked to the +1) |
| The profile | Reads those attestations back from the graph |

Help-request atoms (`help_request:{uuid}`, title, author triples) from the [GraphQL spike](../tasks/37-agent-indexer/intuition-graphql-spike.md) are a discarded hypothesis. Do not implement that mapping.

---

## Out of scope for the first slice

- Publishing help requests, responses, or the feed.
- Mission proposals and experience certifications (recorded here so they are not forgotten).
- Replacing passkeys with a wallet login.
- An in-repo indexer (`apps/indexer` stays forbidden).
