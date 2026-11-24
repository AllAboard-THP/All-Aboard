# Missions — experience certifications

**Status:** product decisions, 2026-11-24. Not implemented. Epic: [#193](https://github.com/AllAboard-THP/All-Aboard/issues/193).  
**Builds on:** [certifications.md](certifications.md) (skill +1, live on dev) and [ADR 0009](../adr/0009-certifications-intuition.md). Technical decisions: [ADR 0010](../adr/0010-experience-certifications-missions.md) (proposed).

This page is the product source of truth for missions. It turns the "Experience certifications (later)" section of [certifications.md](certifications.md#experience-certifications-later--do-not-implement-yet) into a spec.

---

## Why

Skill certifications say "they know this tool". Missions add "they did this work". A mentor posts a mission, picks applicants, and validates the work at the end. Each validated participant gets an **experience** certification on their profile.

With both types, the profile reads like a CV: skills and professional experience. Each line is attested by a named peer and published on Intuition, so the CV is public and hard to falsify quietly.

---

## Decisions (2026-11-24)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Where does the issuer manage missions? | The personal **dashboard** (`/dashboard`), not `/mentor` |
| 2 | Several accepted applicants per mission? | **Yes, for every mission type** |
| 3 | Validation granularity | **Per participant.** Each validated participant gets their own certification |
| 4 | What goes on-chain? | **Only the mission's URL**, no title in clear (revised 2026-11-24, first answer was "with the title") |
| 5 | Pay for freelance missions | **Free-text, informative field.** No payment in the app |
| 6 | Moderation of title and description | **Yes**, same pipeline as other user content (denylist + Claude moderation) |
| — | Who can post a mission? | **Mentor accounts only**, for now |
| — | Who can apply? | **Any signed-in user**, except the mission's author |
| 7 | Cancelled mission | Accepted participants **with a deliverable link** can still be validated |
| 8 | Deliverable link required to validate? | **No, optional.** Shown on the profile when present |
| 9 | Can the author withdraw a validation? | **Yes**, like a +1: hidden in the app, stays on-chain if already published |
| 10 | Comment on validation | **Optional**, 280 characters, moderated, off-chain |

---

## Journey

1. A mentor opens `/missions` and creates a mission: type, title, description, linked skills, places, deadline, optional GitHub repository, optional pay (text).
2. The mission appears on `/missions`, a page next to the feed. Anyone can browse it and filter by type.
3. A user opens the mission and applies with a short message.
4. On their dashboard, the mentor sees the applicants of each mission and accepts or rejects them. Several applicants can be accepted, up to the number of places.
5. The participants do the work. Each one can attach a deliverable link (pull request, repository, demo).
6. The mentor validates each participant's work. Each validation creates an experience certification.
7. The certification shows on the participant's profile, next to the validated skills, with a "Proof on Intuition" link once published.

---

## Mission types

| `kind` | Example | Notes |
| --- | --- | --- |
| `personal_project` | "Help me add auth to my side project" | Repository usually attached |
| `freelance` | "Freelance front-end job, 3 weeks" | The pay field is shown here first. It is information only |
| `hackathon` | "48-hour hackathon on open data" | Many places. Start and end dates matter more than a deadline |

The list of types is an enum, so a new one means a migration. The page and the filters show one section per type.

---

## Data model (Postgres stays the source of truth)

**`missions`**

| Column | Notes |
| --- | --- |
| `id` | uuid |
| `author_id` | Must be a mentor when the mission is created |
| `kind` | `personal_project` \| `freelance` \| `hackathon` |
| `title`, `description` | Moderated. Off-chain, editable at any time |
| `github_repo_url` | Nullable. `https://github.com/<owner>/<repo>` only, checked by format |
| `compensation` | Nullable free text (decision 5) |
| `places` | Integer ≥ 1. Maximum number of accepted applicants |
| `starts_at`, `ends_at` | Nullable. Used by hackathons, optional for the other types |
| `status` | `open` → `in_progress` → `completed`, or `cancelled` |
| `created_at`, `updated_at` | |

**`mission_skills`**: link to the existing `skills` catalogue. It shows what the mission needs and lets the list be filtered by skill.

**`mission_applications`**

| Column | Notes |
| --- | --- |
| `mission_id`, `applicant_id` | Unique together. `applicant_id <> missions.author_id` |
| `message` | Moderated |
| `status` | `pending` \| `accepted` \| `rejected` \| `withdrawn` |
| `deliverable_url` | Nullable. The participant's PR, repository or demo |
| `decided_at`, `created_at` | |

**Experience certification**: one row per validated participant, in a new `experience_certifications` table ([ADR 0010](../adr/0010-experience-certifications-missions.md) §1). It reuses the on-chain columns of ADR 0009 §4 (`claim_triple_id`, `attestation_triple_id`, `tx_hash`, `published_at`, `publish_error`, `publish_attempts`) and `revoked_at`. Fields: `mission_id`, `recipient_id` (the participant), `attester_id` (the mission author), optional moderated comment, `created_at`. Unique on `(mission_id, recipient_id)`.

**Rules**

- Only an `accepted` application can be validated.
- Accepting is refused when the accepted count already equals `places`.
- Validating someone moves the mission to `in_progress` if it was `open`. The mentor closes the mission (`completed`) by hand. Closing does not validate anyone.
- A mentor who loses the mentor role keeps their missions and can still validate them. They cannot create new ones.

---

## Pages

| Route | Who | Content |
| --- | --- | --- |
| `/missions` | Everyone signed in | List with filters by type, skill and status. Next to the feed in the navigation |
| `/missions/[id]` | Everyone signed in | Detail, repository link, Apply button (or the user's application status) |
| `/missions/new`, `/missions/[id]/edit` | Mentors | Create and edit form |
| `/dashboard` → "My missions" | Mission authors | One card per mission: applicants, accept / reject, deliverable links, Validate per participant |
| `/dashboard` → "My applications" | Everyone | Status of each application, deliverable link field once accepted |
| `/m/[id]` | Public | Web alias that redirects (308) to `/missions/[id]`. The stable URL of the mission atom, like `/u/[id]` for people |
| Profile | Everyone | "Experience" card next to "Validated skills": mission title, type, mentor, date, proof link |

The dashboard today is `/dashboard/demo` (student inbox). The missions sections go into the real `/dashboard` route, which the AppShell work has to provide.

---

## On Intuition

Same pipeline as skill +1s ([ADR 0009](../adr/0009-certifications-intuition.md) §5): the validation writes a row and an outbox event (for example `experience.attested`) in one transaction. The publisher creates the missing atoms and triples with the operator wallet. Users sign nothing.

Shape ([ADR 0010](../adr/0010-experience-certifications-missions.md) §2):

| Product object | Atom / triple |
| --- | --- |
| Participant | Person atom, same bytes as today (`<origin>/u/<uuid>`) |
| Mission | Atom whose bytes are **only** the stable URL `<origin>/m/<uuid>` (decision 4), same approach as the person atom. No title, type or description on-chain. Frozen in `packages/blockchain` with golden-id tests |
| Claim | `(person) contributedTo (mission)`. `contributedTo` is in the `@0xintuition/predicates` registry: "The subject actor made a meaningful contribution to the object project, work, or entity" (checked 2026-11-24) |
| Validation | `(claim) attestedBy (mentor)`, the same nested triple as the skill +1 |

**Why only the URL**

- Nothing written on-chain can be edited or erased. A title can hold a confidential client name or personal data, and the mentor may want to rename the mission later.
- The URL resolves to the mission page, so another app (or a reader of the proof) still sees the title, from All-Aboard. If the mission is hidden or deleted, the URL stops showing it, but the attestation stays on-chain.
- Title, description, pay, applications and deliverable links all stay in Postgres. The title can change at any time without touching the atom.

---

## Moderation

Title, description, application messages and the optional validation comment go through `services/profanity.ts` (denylist, then Claude moderation when enabled), like help requests and +1 comments. Admins can hide a mission. A hidden mission keeps the certifications already published on-chain, as with a withdrawn +1.

---

## GitHub

First slice: a repository URL on the mission and a deliverable URL on each application, checked by format only. Later: read the repository through the GitHub API (stars, language) and check that the participant's commits or pull requests are really in it before validation is allowed.

---

## Out of scope for the first slice

- Payment, escrow or invoicing. The pay field is text.
- Teams inside a hackathon. Participants are individuals.
- Posting missions without the mentor role.
- Withdrawing an experience certification on-chain. Revocation stays in Postgres, as for skills (ADR 0009 §5).
- GitHub API checks.
