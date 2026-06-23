# All-Aboard documentation

Canonical **architecture and product** reference for this repository.

> **Task tracking** (backlog, kanban, roadmap, dependencies) lives on [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3) — do not duplicate it here.

| Resource | Description |
|----------|-------------|
| [INDEX.md](INDEX.md) | Topic → canonical source map |
| [tasks/](tasks/README.md) | Per-issue working notes (`Docs/tasks/<NN>-slug/`) |
| [.github/PROJECT.md](../.github/PROJECT.md) | Kanban workflow and project fields |

**When in doubt**, prioritize engineering consistency (API contract, SSR/BFF) — see [Principles](#engineering-principles) and [Web ↔ API integration](guides/web-api-integration.md).

---

## Documentation map

```
Docs/
├── README.md              ← you are here
├── INDEX.md               ← canonical source index
├── architecture/          ← target dataflow & system views
├── product/               ← user journeys (MOC)
├── guides/                ← how-to: Web/API, monorepo bootstrap
├── deployment/            ← env vars, Dokploy, runbooks, staging
├── adr/                   ← accepted architecture decisions
├── design-system/         ← @allaboard/ui contributor hub
├── branding/              ← marketing hero assets
├── tasks/                 ← per-issue working docs
├── integrations/          ← third-party doc indexes (Intuition)
└── vision/                ← long-term stack proposals (not current code)
```

---

## MVP phase timeline

| Phase | Status | Reference |
|-------|--------|-----------|
| 0 — Monorepo, Web/API, Dokploy | ✅ Shipped | [integration guide](guides/web-api-integration.md) journal |
| 1 — SSR feed + shared types | ✅ Shipped | idem |
| 2 — Auth + help-request flow | ✅ Shipped (repo MVP; staging hardening ongoing) | [ADR 0001](adr/0001-authentication-strategy.md), [user journeys](product/user-journeys.md), epic [#13](https://github.com/AllAboard-THP/All-Aboard/issues/13) |
| 3 — TanStack beyond home | ✅ Shipped | [#36](https://github.com/AllAboard-THP/All-Aboard/issues/36) |
| 4 — Design system + AppShell | ✅ Shipped | [design-system/](design-system/README.md), [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24), [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25) |
| 5 — Agent / Intuition indexer | 📋 Backlog | [#37](https://github.com/AllAboard-THP/All-Aboard/issues/37), [vision/](vision/README.md) |

---

## Repository technical state

| Area | State |
|------|-------|
| `apps/api` | Fastify MVP + **Rails parity phases 1–7** (feed, social, auth/profiles, resources, REST+WS chat, admin, soft delete, suggest-tags, `ai_summary` outbox); `apps/agent` for tags/summary; hub [api-rails-parity](tasks/api-rails-parity/README.md); OpenAPI [`openapi.yaml`](../apps/api/openapi.yaml) **0.10.0** |
| `apps/web` | SSR feed; BFF; `/help/new`; **AppShell** (`app/(app)/`) — [app-shell.md](design-system/app-shell.md); `@allaboard/ui` + features/blocks |
| `packages/ui` + `apps/storybook` | Design system + Storybook catalogue — [design-system/README.md](design-system/README.md) |
| Auth | JWT (`access_token` cookie + BFF Bearer relay) — [ADR 0001](adr/0001-authentication-strategy.md); production users — [ADR 0003](adr/0003-authentication-users-production.md); Google OAuth — [ADR 0006](adr/0006-oauth-google-sso.md) |
| TanStack Query | Feed/detail queries + create mutation — [#36](https://github.com/AllAboard-THP/All-Aboard/issues/36) |
| `apps/thp-final` | Historical Rails app — outside JS MVP unless explicitly decided |

---

## Engineering principles

| Zone | État |
|------|------|
| `apps/api` | Fastify : socle MVP + **parité Rails phases 1–7** (feed, social, auth/profils, resources, chat REST+WS, admin, soft delete, suggest-tags, `ai_summary` outbox) ; `apps/agent` pour tags/summary ; hub doc [api-rails-parity](tasks/api-rails-parity/README.md) ; OpenAPI [`openapi.yaml`](../apps/api/openapi.yaml) **0.10.0**. |
| `apps/web` | SSR feed ; BFF ; `/help/new` ; **AppShell** (`app/(app)/`, nav MOC) — [app-shell.md](design-system/app-shell.md) ; `@allaboard/ui` + features/blocks. |
| `packages/ui` + `apps/storybook` | Design system + catalogue SB — [design-system/README.md](design-system/README.md). |
| Auth | JWT (cookie `access_token` + relais BFF Bearer) — [ADR 0001](adr/0001-authentication-strategy.md) ; cible prod **passkeys** — [ADR 0006](adr/0006-authentication-passkeys.md) ; legacy password — [ADR 0003](adr/0003-authentication-users-production.md). |
| TanStack | Socle + `useQuery` feed/détail, `useMutation` création — [#36](https://github.com/AllAboard-THP/All-Aboard/issues/36). |
| `apps/thp-final` | Rails historique — hors MVP JS sauf décision explicite. |

---

## Contributor rules

1. **Cross-cutting Web/API change** — read this README + [integration guide](guides/web-api-integration.md); update the *Journal* when smoke/contract changes.
2. **Single-issue work** — notes in `Docs/tasks/<NN>-slug/`; link from the GitHub issue.
3. **Accepted architecture decision** — `Docs/adr/` (drafts may stay in `tasks/` until PR merge).
4. **Completed phase** — update the timeline table above (add date in section header if useful).

**Last updated:** 2026-06-10
