# ADR (Architecture Decision Records)

**Accepted** decisions merged on `Dev`. Drafts stay in `Docs/tasks/<NN>-<slug>/` until the PR lands.

Format: `NNNN-short-title.md` (incrementing number, **no duplicates**).

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-authentication-strategy.md) | MVP authentication (Phase 2) — JWT httpOnly + BFF Bearer | Accepted — 2026-05-14 ([#18](https://github.com/AllAboard-THP/All-Aboard/issues/18)) |
| [0002](0002-design-system-monorepo.md) | Design system monorepo (`packages/ui` + `apps/storybook`) | Accepted — 2026-05-20 (Epic [#24](https://github.com/AllAboard-THP/All-Aboard/issues/24)) |
| [0003](0003-authentication-users-production.md) | Production authentication (real users, argon2 hash) | Accepted — 2026-05-28 |
| [0004](0004-agent-indexer-architecture.md) | Agent Rubberduck & Intuition (Phase 4) — bridge publish, Intuition network indexer | Accepted — 2026-06-01 ([#37](https://github.com/AllAboard-THP/All-Aboard/issues/37)) |
| [0005](0005-i18n-web-next-intl.md) | Web i18n FR/EN (next-intl) | Accepted — 2026-05-28 ([#75](https://github.com/AllAboard-THP/All-Aboard/issues/75)) |
| [0006](0006-oauth-google-sso.md) | Google sign-in (OAuth 2.0 + PKCE, BFF callback) | Accepted — 2026-06-09 |
