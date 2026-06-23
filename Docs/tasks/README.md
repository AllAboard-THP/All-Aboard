# Task documentation (`Docs/tasks/`)

**Backlog, priorities, dependencies, roadmap:** canonical source = [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3). Do not copy those lists into `Docs/`.

This folder holds **working notes tied to a GitHub issue** — spikes, ADR drafts, captures — **one folder per issue number** to reduce merge conflicts.

---

## Naming convention

```text
Docs/tasks/<NN>-<short-slug>/
```

| Part | Rule | Example |
|------|------|---------|
| `NN` | GitHub issue number | `18` |
| `slug` | kebab-case, 2–4 words | `adr-auth` |
| Folder | `Docs/tasks/18-adr-auth/` | |

Each folder must include a **`README.md`** with:

- link to the issue: `https://github.com/AllAboard-THP/All-Aboard/issues/<NN>`
- one-sentence goal (from or summarizing the issue)
- list of files in the folder

Blank template: [_template/README.md](_template/README.md).

---

## Where to write what

| Content | Location |
|---------|----------|
| Task checklist, status, assignee, deps | **GitHub issue** + Project |
| Notes / drafts for **one** task | `Docs/tasks/<NN>-slug/` |
| **Accepted** architecture decision (final ADR) | `Docs/adr/` after PR merge |
| Cross-cutting API contract, env, smoke journal | [guides/web-api-integration.md](../guides/web-api-integration.md) |
| MVP phase timeline, principles | [README.md](../README.md) |
| Product journeys (MOC) | [product/user-journeys.md](../product/user-journeys.md) |
| Design system hub | [design-system/README.md](../design-system/README.md) |
| Dokploy instance facts | [deployment/dokploy-instance.md](../deployment/dokploy-instance.md) |

---

## Contributor workflow

1. Pick an issue on the [Project](https://github.com/orgs/AllAboard-THP/projects/3) → **In Progress**.
2. Create `Docs/tasks/<NN>-slug/` if notes are needed (copy `_template/`).
3. In the issue: **Documentation** section → link to `Docs/tasks/<NN>-slug/`.
4. In the folder `README.md`: link back to the issue.
5. PR: `Refs #NN`; update cross-cutting docs only when Web/API contract changes.

Avoid editing the same shared `Docs/` file as another active task — use the dedicated subfolder.

---

## Task folder index

### Auth, design system, API contract

| Folder | Issue |
|--------|-------|
| [18-adr-auth/](18-adr-auth/) | [#18 ADR auth](https://github.com/AllAboard-THP/All-Aboard/issues/18) — ✅ shipped → [ADR 0001](../adr/0001-authentication-strategy.md) |
| [24-design-system-monorepo/](24-design-system-monorepo/) | [#24 Design system](https://github.com/AllAboard-THP/All-Aboard/issues/24) — ✅ shipped |
| [25-app-shell-navigation/](25-app-shell-navigation/) | [#25 AppShell](https://github.com/AllAboard-THP/All-Aboard/issues/25) — ✅ shipped |
| [49-openapi/](49-openapi/) | [#49 OpenAPI](https://github.com/AllAboard-THP/All-Aboard/issues/49) — ✅ shipped |
| [75-i18n-web/](75-i18n-web/) | [#75 Web i18n](https://github.com/AllAboard-THP/All-Aboard/issues/75) — ✅ shipped → [ADR 0005](../adr/0005-i18n-web-next-intl.md) |

### Phase 4 — Agent / Intuition

| Folder | Issue |
|--------|-------|
| [37-agent-indexer/](37-agent-indexer/) | [#37 Agent/Intuition](https://github.com/AllAboard-THP/All-Aboard/issues/37) — [ADR 0004](../adr/0004-agent-indexer-architecture.md) |
| [67-intuition-bridge/](67-intuition-bridge/) | [#67 Intuition bridge](https://github.com/AllAboard-THP/All-Aboard/issues/67) — outbox + publisher |
| [68-agent-handoff/](68-agent-handoff/) | [#68 API→Agent handoff](https://github.com/AllAboard-THP/All-Aboard/issues/68) — ✅ shipped |
| [69-agent-ci-dokploy/](69-agent-ci-dokploy/) | [#69 Agent CI + Dokploy](https://github.com/AllAboard-THP/All-Aboard/issues/69) — ✅ shipped |

### Phase 2b — Responses MOC (epic #78)

| Folder | Issue |
|--------|-------|
| [78-phase2b-responses/](78-phase2b-responses/) | [#78 Phase 2b responses](https://github.com/AllAboard-THP/All-Aboard/issues/78) |
| [82-mentor-notifications/](82-mentor-notifications/) | [#82 Mentor notifications](https://github.com/AllAboard-THP/All-Aboard/issues/82) |
| [83-response-filtering/](83-response-filtering/) | [#83 Certification response filter](https://github.com/AllAboard-THP/All-Aboard/issues/83) |

### Rails → Fastify API parity

| Folder | Issue |
|--------|-------|
| [api-rails-parity/](api-rails-parity/) | **Hub** — phases 1–7 + lots A / 5b / 7 |
| [api-rails-parity-phase1/](api-rails-parity-phase1/) | Phase 1 — enriched feed/subjects/help-requests |
| [api-rails-parity-phase2/](api-rails-parity-phase2/) | Phase 2 — likes, bookmarks, `/me/*`, responses CRUD |
| [api-rails-parity-phase3/](api-rails-parity-phase3/) | Phase 3 — register, profiles, legal |
| [api-rails-parity-phase4/](api-rails-parity-phase4/) | Phase 4 — resources, subject requests, mentor dashboard |
| [api-rails-parity-phase5/](api-rails-parity-phase5/) | Phase 5 — REST messaging |
| [api-rails-parity-phase5b/](api-rails-parity-phase5b/) | Phase 5b — WebSocket chat (OpenAPI 0.9.0) |
| [api-rails-parity-phase6/](api-rails-parity-phase6/) | Phase 6 — admin & moderation — ✅ shipped |
| [api-rails-parity-phase7/](api-rails-parity-phase7/) | Phase 7 — suggest-tags + `ai_summary` (OpenAPI 0.10.0) |
| [api-parity-delete-reject/](api-parity-delete-reject/) | Lot A — soft delete + mentor resource reject (OpenAPI 0.8.1) |

---

## Links

- [Project workflow (.github/PROJECT.md)](../../.github/PROJECT.md)
- [Documentation index](../INDEX.md)
