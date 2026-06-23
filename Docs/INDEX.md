# Documentation index

One **canonical source** per topic. Task backlog and priorities: [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3).

**Last updated:** 2026-06-10

---

## Quick links

| I need to… | Go to |
|------------|-------|
| Understand MVP phases and repo state | [README.md](README.md) |
| Wire Web ↔ API (env, `/feed`, smoke journal) | [guides/web-api-integration.md](guides/web-api-integration.md) |
| Deploy or configure Dokploy | [deployment/](deployment/README.md) |
| Contribute UI / Storybook | [design-system/README.md](design-system/README.md) |
| Read an architecture decision | [adr/README.md](adr/README.md) |
| Find notes for a GitHub issue | [tasks/README.md](tasks/README.md) |

---

## Topic → canonical source

| Topic | Canonical | Also see |
|-------|-----------|----------|
| Backlog, priorities, roadmap | [GitHub Project #3](https://github.com/orgs/AllAboard-THP/projects/3) | [backlog.md](backlog.md) (stub) |
| Kanban workflow / project fields | [.github/PROJECT.md](../.github/PROJECT.md) | — |
| Per-issue working notes | `Docs/tasks/<NN>-slug/` | Linked GitHub issue |
| Accepted ADR | [adr/](adr/README.md) | Draft in `tasks/` until merge |
| MVP phases, principles, code state | [README.md](README.md) | — |
| Web ↔ API contract, smoke journal | [guides/web-api-integration.md](guides/web-api-integration.md) | — |
| Environment variables (all services) | [deployment/environment-variables.md](deployment/environment-variables.md) | [dokploy-instance.md](deployment/dokploy-instance.md) |
| Dokploy instance facts (domains, internal URLs) | [deployment/dokploy-instance.md](deployment/dokploy-instance.md) | Runbooks |
| Dokploy dev runbook (Phase 2) | [deployment/runbooks/dev-phase2.md](deployment/runbooks/dev-phase2.md) | Integration guide |
| Dokploy staging runbook | [deployment/runbooks/staging-phase2.md](deployment/runbooks/staging-phase2.md) | [staging checklist](deployment/staging-promotion-checklist.md) |
| Dev → staging promotion | [deployment/staging-promotion-checklist.md](deployment/staging-promotion-checklist.md) | [#31](https://github.com/AllAboard-THP/All-Aboard/issues/31) |
| JWT / BFF / MVP login | [adr/0001-authentication-strategy.md](adr/0001-authentication-strategy.md) | README, env matrix |
| Production users (argon2 hash) | [adr/0003-authentication-users-production.md](adr/0003-authentication-users-production.md) | Staging checklist |
| Google OAuth SSO | [adr/0006-oauth-google-sso.md](adr/0006-oauth-google-sso.md) | `GOOGLE_*` in env matrix |
| Design system (`@allaboard/ui`, Storybook) | [design-system/README.md](design-system/README.md) | [ADR 0002](adr/0002-design-system-monorepo.md) |
| AppShell / web navigation | [design-system/app-shell.md](design-system/app-shell.md) | [#25](https://github.com/AllAboard-THP/All-Aboard/issues/25) |
| Branding / hero assets | [branding/README.md](branding/README.md) | `.cursor/rules/branding-hero-4k.mdc` |
| i18n web FR/EN | [adr/0005-i18n-web-next-intl.md](adr/0005-i18n-web-next-intl.md) | [tasks/75-i18n-web](tasks/75-i18n-web/) |
| Agent / Rubberduck / Intuition | [adr/0004-agent-indexer-architecture.md](adr/0004-agent-indexer-architecture.md) | [tasks/37](tasks/37-agent-indexer/), [67](tasks/67-intuition-bridge/), [68](tasks/68-agent-handoff/), [69](tasks/69-agent-ci-dokploy/) |
| Intuition external docs index | [integrations/intuition-docs-index.md](integrations/intuition-docs-index.md) | ADR 0004 |
| Product user journeys (MOC) | [product/user-journeys.md](product/user-journeys.md) | Rails parity notes |
| Rails → Fastify API parity | [tasks/api-rails-parity/](tasks/api-rails-parity/README.md) | Phases [1](tasks/api-rails-parity-phase1/README.md)–[7](tasks/api-rails-parity-phase7/README.md) |
| Long-term stack / dataflow vision | [vision/README.md](vision/README.md) | [architecture/dataflow.md](architecture/dataflow.md) |

---

## Maintenance rules

1. New task with docs → create `Docs/tasks/<NN>-slug/` + one line in [tasks/README.md](tasks/README.md).
2. Web/API contract or smoke change → [guides/web-api-integration.md](guides/web-api-integration.md) + code; not in `tasks/` unless issue-specific spike.
3. New env variable → [deployment/environment-variables.md](deployment/environment-variables.md).
4. Completed MVP phase → timeline in [README.md](README.md) only.
5. Do **not** recreate issue backlogs in `Docs/` — the GitHub Project is the source of truth.
6. New ADR → unique incrementing number; update [adr/README.md](adr/README.md) and this index.
