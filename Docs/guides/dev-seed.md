# Dev seed: personas and scenarios

The API seeds the database on every boot (`db:migrate` → `runSeedIfConfigured`) and with `pnpm --filter api db:seed`. Users and demo content are only written when `DEV_SEED_PASSWORD` (or `MVP_LOGIN_PASSWORD` in dev/CI) is set. All accounts share that password.

The seed is idempotent: stable UUIDs, upserts, and counters (`likes_count`, `responses_count`, `bookmarks_count`, `posts_count`) recomputed at the end. Data lives in [`apps/api/src/db/seed-demo-data.ts`](../../apps/api/src/db/seed-demo-data.ts), and missions in [`seed-demo-missions.ts`](../../apps/api/src/db/seed-demo-missions.ts).

Peer +1s (`certifications`) are **not** seeded: the skill catalogue exists, but no attestation rows.

## Accounts

| Email | Role | What to test with it |
|-------|------|----------------------|
| `bob@dev.local` | student | Main student: open and resolved posts, bookmarks, 3 unread messages, pending subject request, a pending mission application and one experience on the profile |
| `alice@dev.local` | mentor | Main mentor: answers across React/Rails/TS, linked Google account, moderation chat with Claire, a missions board with applicants to accept or reject |
| `admin@dev.local` | admin | Moderation queue, subject requests, denylist |
| `claire@dev.local` | admin | Second admin |
| `lucas@`, `sofia@`, `kevin@`, `nadia@`, `julien@` | mentor | Subject experts (JS/Rails/Mobile, Python/IA/DB, DevOps/Algo, Cyber/Node, TS/Node/Git). Julien has comment notifications off |
| `hugo@`, `marie@`, `camille@`, `thomas@`, `romain@`, `lea@`, `noah@` | student | Active students with posts, answers, likes, conversations |
| `yanis@dev.local` | student | All notifications off |
| `emma@dev.local` | student | Google-only account, no password: password login must fail |
| `ines@dev.local` | student | CGU not accepted: onboarding gate |
| `sarah@dev.local` | student | Bare profile (name only), a post with an empty body |

## Covered states

- **Help requests** (36): every subject, open/resolved, urgent, mentor help requested, AI summary, code snippets in 10 languages, flagged for moderation, one soft-deleted, posts with no answers, posts from 6 minutes to 5 weeks old.
- **Responses** (48): with and without code, by mentors and students, one flagged.
- **Resources** (19): published in every subject, 3 pending (mentor review queue), 2 rejected.
- **Subject requests** (7): pending, approved, rejected.
- **Denylist** (4): 2 active demo tokens (`spam-link-demo`, `phone-leak-demo`), 2 inactive (one regex).
- **Conversations** (12): read, unread and never-opened threads; inbox ordered by last message.
- **Missions** (8, [missions.md](../product/missions.md)): every type and status (open, in progress, completed, cancelled), posted by Alice, Lucas, Sofia, Kevin, Nadia and Julien. 17 applications: pending, accepted, rejected, with and without a deliverable link. Sofia has an accepted participant ready to validate.
- **Experience certifications** (3): Bob (Alice's design system), Romain and Léa (Kevin's hackathon). They have no outbox event, so they are never published on Intuition and the profile shows the proof as pending.

Not seeded: audio/video messages (they need S3 objects), passkeys, outbox events, peer +1s. Cancelled missions are hidden from `/missions`; Lucas's cancelled mission shows on his board and in Hugo's applications.
