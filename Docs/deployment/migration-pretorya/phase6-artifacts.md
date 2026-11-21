# Phase 6 — execution log (non-secret)

**Date:** 2026-10-07. MCP and Cloudflare were read. Nothing was deleted.

## Docs and MCP

| Step | Status | Notes |
|------|--------|--------|
| [dokploy-instance.md](../dokploy-instance.md) | Updated | Org Pretorya, internal app names, Storybook `storybook.allaboard.fr`, tunnel ids, hold until 2026-10-14 |
| Journal | Updated | [web-api-integration.md](../../guides/web-api-integration.md) |
| Cursor MCP `user-dokploy-mcp` | Already Pretorya | `DOKPLOY_URL=https://app.dokploy.com/api`. Key matches `.allaboard-migration/phase1/dokploy-api.env`. `project-all` organization `Z0AxAmNeoDFUc6WbU3ueP`. |
| Mestryx Dokploy API | Not called | No Mestryx API key in phase 1 env. Token in MCP cannot list or stop Mestryx projects. |

## Cloudflare tunnels (read-only)

| Name | Id | Status | Ingress |
|------|----|--------|---------|
| `allaboard-pretorya` | `19b7e001-bf8a-46dd-b249-2edae7200c68` | healthy (4 connections, origin `2a01:4f8:c016:e600::1`) | `pretorya-dev`, storybook, dev, api-dev, staging, api-staging, apex, api, rails, `*.allaboard.fr` → `http://127.0.0.1:80` |
| `dockploy Mestryx` | `e1e5ba46-8988-40db-8e48-1662853a4426` | healthy (origins `82.66.221.108` and an IPv6) | catch-all 404 only |

Cutover timestamp: `2026-10-07T12:54:03Z`. Tunnel `dockploy Mestryx` deleted `2026-10-07T13:44:59Z` (ingress was catch-all 404; DNS already targeted `allaboard-pretorya`).

## Offboarding (2026-10-07, later the same day)

| Step | Status | Notes |
|------|--------|--------|
| Uninstall `dokploy-2026-05-04-1cfoiq` | Done | Confirmed absent from `GET /orgs/AllAboard-THP/installations`. Homepage was `https://dokploy.mestryx.dev`. |
| Pretorya deploy app | Kept | Dokploy provider `Dokploy-2026-10-06-jvxt9b` (`githubId` `j3Oenpv8JPMTut2Em4ADc`). |
| Spare app `dokploy-2026-10-05-we3cw1` | Still installed | Not the live Dokploy provider. |
| `M3stryX` | Removed from org | Was downgraded to repo `write`, then removed by the org owner on 2026-10-07. |
| `MestryxBot` | Removed from org | Second user account (issues + PR #1). Removed the same day. |
| Actions secrets / deploy keys | None listed | Both MVP and Rails repos. |
| Secret rotation | Done | dev, staging, production, Rails Postgres. `RAILS_MASTER_KEY` not rotated. No Google OAuth vars on the API. |
| Smoke | `pnpm smoke:dev` OK | Staging login `bob@dev.local` OK. Production `/feed` is still the `main` stub. Rails homepage HTTP 200. |

New secret values: `.allaboard-migration/phase6/rotated-secrets.env` (gitignored).

## Not done (on purpose)

- Stop Dokploy projects on the Mestryx host (no API key and no SSH). The Cloudflare tunnel itself is deleted.
- Uninstall spare Pretorya app `dokploy-2026-10-05-we3cw1`.

Procedure for the later delete: [phase6-runbook.md](./phase6-runbook.md).
