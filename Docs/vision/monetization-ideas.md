# Monetization ideas — starting point

**Status:** brainstorm, 2026-11-26. **Not a decision.** Indicative leads to start from when monetization is discussed seriously, after the on-chain core (skills, missions, resources) is built and before or alongside the design pass.

Related: [certifications.md](../product/certifications.md), [missions.md](../product/missions.md), [resource-votes.md](../product/resource-votes.md), [ADR 0009](../adr/0009-certifications-intuition.md).

---

## Target end state

The All-Aboard profile becomes a **verifiable CV with three pillars**, all attested on Intuition by identified members:

| Pillar | What it proves | Who attests |
| --- | --- | --- |
| **Skills** | "They know how to do it" | A peer they helped |
| **Missions** | "They did it" | The mentor who validated their work |
| **Resources** | "They pass it on" | The community active on the subject |

Help requests, chat and the feed are the **engine**: they create the real interactions that make someone eligible to attest. That is the main difference with a plain badge system: you cannot validate someone you never worked with.

The CV lives on Intuition, so it is **portable**: it belongs to the member, not to the app.

---

## What can and cannot be sold

On-chain data is **public and free to read**. All-Aboard can never sell "access to the CVs" the way a closed network sells its data. The defensible value is:

- **signal quality**: eligibility rules, moderation, mentors;
- **the community** that produces that signal;
- **the tools** built on top: search, scoring, dashboards.

---

## Leads, by relevance

### 1. Schools and bootcamps (B2B SaaS) — suggested first

- The THP origin of the project is a direct entry point.
- A school pays per cohort or per student for mentor dashboards, tracking of its students' validated skills, internal missions and hackathons, and **verified CVs** to show recruiters (which feeds its placement figures).
- Solves the chicken-and-egg problem: a school brings a whole cohort at once.

### 2. Recruiting

- Companies pay a subscription to search profiles by attested criteria ("5+ Rails validations, 2 validated missions"), with alerts, direct contact and export to their hiring tools (ATS).
- The data is free to read; what is sold is search, scoring and introductions.
- Highest potential, but needs a critical mass of profiles first.

### 3. Paid missions

- Companies post freelance missions or sponsor hackathons. All-Aboard takes a **commission** or a listing fee.
- Handling the payment itself means holding other people's money, which is regulated: go through a payment provider (for example Stripe Connect).
- Today the mission pay field is informative only ([missions.md](../product/missions.md), decision 5).

### 4. Sponsoring

- A company sponsors a resource track, a hackathon, or the **gas of the votes and +1s** ("this month's validations are offered by X"). Employer branding aimed at developers.

### 5. Member premium — a complement, never the core

- PDF export of the CV, profile visit statistics, custom domain.

### 6. Intuition ecosystem — to check

- There may be grant programs for apps that drive activity on the protocol, or fee sharing on vaults. Current terms are unknown; look them up before counting on them.

---

## Red lines

Crossing any one of these destroys the credibility of the CV:

- **Never sell reputation**: no paid score boost, no paid badge.
- **Never let money weigh on votes**: one member, one vote in the app score.
- Recruiters do not pay to see data the member has not made public.

---

## Cost to cover

If All-Aboard sponsors gas and deposits for members (target model: members sign with a passkey-driven smart account, All-Aboard pays), that cost **grows with usage**. B2B revenue (schools, recruiters) has to fund it. Measure the real cost of one validation during the smart account spike, so the business model holds.

---

## Suggested order

1. **Schools** first: traction and first revenue.
2. **Recruiting** once there are enough profiles.
3. **Sponsored missions** in parallel.

Note: the design pass comes after the on-chain features, but the **invisible wallet onboarding** is a product question, not only a visual one. It belongs in the member-wallets ADR (0011).
