# Phase 6 runbook — docs, Pretorya MCP, Mestryx hold

Canonical instance facts live in [dokploy-instance.md](../dokploy-instance.md). This runbook records what Phase 6 does **now**, and what must wait for the rollback window.

## Done on 2026-10-07 (no Mestryx delete)

1. **Instance doc** rewritten for org **Pretorya** (internal app names, Storybook host, tunnel id, migration date).
2. **Cursor MCP** `user-dokploy-mcp` checked against `.allaboard-migration/phase1/dokploy-api.env`:
   - `DOKPLOY_URL` is `https://app.dokploy.com/api` (same value in `~/.cursor/mcp.json`).
   - The API key matches the Pretorya key. `project-all` returns organization `Z0AxAmNeoDFUc6WbU3ueP` (projects `AllAboard monorepo website`, `website`, `Infra`).
   - Do not commit the key. Do not point this MCP back at `https://dokploy.mestryx.dev/api`.
3. **Cloudflare:** tunnel `allaboard-pretorya` is healthy and owns the public hostnames. Tunnel `dockploy Mestryx` was deleted the same day (see below).

Log: [phase6-artifacts.md](./phase6-artifacts.md).

## Mestryx tunnel deleted (2026-10-07)

Public cutover finished at `2026-10-07T12:54:03Z`. The owner asked to drop the rollback tunnel the same day.

- Deleted Cloudflare tunnel `dockploy Mestryx` (`e1e5ba46-8988-40db-8e48-1662853a4426`) at `2026-10-07T13:44:59Z`. Its ingress was only `http_status:404`. No DNS record pointed at that tunnel id.
- Remaining tunnel: `allaboard-pretorya` (`19b7e001-bf8a-46dd-b249-2edae7200c68`), status `healthy`. After delete: `https://dev.allaboard.fr/health`, `https://allaboard.fr/health`, and `https://api.allaboard.fr/health` returned 200.
- DNS rollback to Mestryx is no longer possible.
- Dokploy projects on the old Mestryx host were not stopped. The Pretorya API token cannot see them. There is no Mestryx `DOKPLOY_API_KEY` in `.allaboard-migration/phase1/`. [DECISIONS.md](./DECISIONS.md) records no SSH on that host.

## Done on 2026-10-07 (offboarding)

1. GitHub App `dokploy-2026-05-04-1cfoiq` (homepage `https://dokploy.mestryx.dev`) **uninstalled** from org `AllAboard-THP`.
2. Pretorya Dokploy git provider remains `dokploy-2026-10-06-jvxt9b`. Spare install `dokploy-2026-10-05-we3cw1` is still on the org and is **not** the provider Dokploy uses.
3. `M3stryX` and `MestryxBot` were removed from org `AllAboard-THP` by the org owner on 2026-10-07. They no longer appear on `All-Aboard` or `Projet-Final---All-aboard`. Remaining org members: `Pretorya`, `ToXY0392`. Rails still lists outside collaborator `finotremy-a11y`.
4. No GitHub Actions secrets and no deploy keys were listed on `All-Aboard` or `Projet-Final---All-aboard`.
5. Pretorya secrets rotated (Dokploy `postgres.changePassword`, then API/Rails env + redeploy). New values are only in gitignored `.allaboard-migration/phase6/rotated-secrets.env`. Copy them into a password manager. Do not commit them.
   - dev / staging / production: Postgres password, `DATABASE_URL`, `JWT_SECRET` (distinct per env)
   - dev: `MVP_LOGIN_PASSWORD` (seed updates `bob@dev.local` on API boot)
   - staging: `DEV_SEED_PASSWORD`
   - Rails: Postgres password and `DATABASE_URL` only
6. Not rotated: `RAILS_MASTER_KEY`, `WEBAUTHN_*`. No `GOOGLE_CLIENT_SECRET` on the API env.
7. `pnpm smoke:dev` passed after rotation (health, feed, BFF, login, create help request).

Production `main` still serves the historical stub `GET /feed` (`id: "1"`). The new production `DATABASE_URL` and `JWT_SECRET` apply when that branch runs the real API.

## After 2026-10-14 (human, separate change)

Only after Pretorya smokes are still green:

1. If Mestryx Dokploy access exists again: turn **autoDeploy** off, then delete projects `AllAboard monorepo website`, `website`, and Infra `cloudflared`.
2. Optional: uninstall spare GitHub App `dokploy-2026-10-05-we3cw1` if nothing else uses it. Keep `dokploy-2026-10-06-jvxt9b`.
