# Phase 1 runbook — Pretorya Dokploy (server + GitHub)

Provision the **Pretorya** organization on [Dokploy Cloud](https://app.dokploy.com/dashboard/home) before Phase 2 (recreate projects). Mestryx stays live until Cloudflare cutover.

## Prerequisites

| Item | Notes |
|------|--------|
| Pretorya account | Log in at `app.dokploy.com` (GitHub OAuth as org owner) |
| VPS (deploy) | ≥ **8 GB RAM** recommended (3 MVP envs + Rails + parallel builds). Ubuntu 22.04/24.04, root or deploy user, **SSH key** |
| GitHub org admin | `AllAboard-THP` — install **new** Dokploy GitHub App (Mestryx app `dokploy-2026-05-04-1cfoiq` stays until offboarding) |

## 1. API key (for scripts + Cursor MCP)

1. Dokploy → **Settings** → **Profile** → **API Keys** → create key (full org access).
2. Copy [scripts/migration/dokploy-api.env.example](../../../scripts/migration/dokploy-api.env.example) to `.allaboard-migration/phase1/dokploy-api.env` (gitignored):

```bash
mkdir -p .allaboard-migration/phase1
cp scripts/migration/dokploy-api.env.example .allaboard-migration/phase1/dokploy-api.env
# Edit: set DOKPLOY_API_KEY=...
```

3. (Optional) Point Cursor MCP `user-dokploy-mcp` at Pretorya:

```json
"DOKPLOY_URL": "https://app.dokploy.com/api",
"DOKPLOY_API_KEY": "<Pretorya key>"
```

## 2. SSH key in Dokploy

1. **Settings** → **SSH Keys** → **Add SSH Key** (or **Generate ED25519 SSH Key** and store the public key for the VPS).
2. Note the **sshKeyId** for API provisioning (or use UI **Servers** → **Create Server**).
3. On the **new VPS**, install the matching public key for user `root` (or your deploy user) **before** running **Setup** in Dokploy.

## 3. Register and setup deploy server

### UI (recommended first time)

1. **Servers** → **Add Server** → type **Deploy**.
2. Name e.g. `allaboard-pretorya`, IP, port `22`, user `root`, select SSH key.
3. Run **Setup** / **Validate** until status is healthy (Docker Swarm + Traefik on the host).

### API (optional)

Fill server fields in `dokploy-api.env`, then:

```bash
node scripts/migration/pretorya-phase1-provision.mjs
```

## 4. Connect GitHub App (Pretorya)

1. **Settings** → **Git** → **Github** → **Create GitHub App** (Dokploy manifest flow).
2. Complete **Install & Authorize** when GitHub redirects (callback: `https://app.dokploy.com/api/providers/github/setup`).
3. **Org install (required for monorepo repos)** — personal account install alone is **not** enough:
   - Open [GitHub App → Install App](https://github.com/settings/apps/dokploy-2026-10-05-we3cw1/installations) (replace slug if you recreated the app).
   - Choose **AllAboard-THP** (not only user `Pretorya`).
   - Repository access: **Only select repositories** → `All-Aboard`, `Projet-Final---All-aboard`.
4. In Dokploy **Git Providers**, the provider row should no longer show **Action Required**.
5. Mestryx app `dokploy-2026-05-04-1cfoiq` stays on the org until Phase 6 offboarding.

Legacy Mestryx integration id (reference only): `githubId` `rb7oKBFoyaSfgEcIN356Z` on Mestryx — **not** reusable on Pretorya.

**Observed Pretorya app (2026-10-05):** `dokploy-2026-10-05-we3cw1` (App ID `5194702`).

## 5. Verify Phase 1

```bash
node scripts/migration/pretorya-phase1-verify.mjs
```

Exit code `0` when:

- At least one **deploy** server is registered and validates
- At least one **GitHub provider** exists
- Repos `All-Aboard` and `Projet-Final---All-aboard` appear for that provider

Report (non-secret): `.allaboard-migration/phase1/verify-report.json`

## 6. GitHub org check (CLI)

```bash
gh api orgs/AllAboard-THP/installations \
  --jq '.installations[] | select(.app_slug | startswith("dokploy")) | {app_slug, id}'
```

Expect **two** Dokploy apps briefly (Mestryx + Pretorya); after offboarding, only Pretorya.

## Phase 1 done criteria

- [ ] Deploy server **Healthy** in Dokploy (Traefik listening — ports 80/443 or tunnel-ready)
- [ ] GitHub App installed on Pretorya org with both repos
- [ ] `pretorya-phase1-verify.mjs` passes
- [ ] MCP / local env uses **Pretorya** API URL (not `dokploy.mestryx.dev`)

Next: [Phase 2 — recreate projects](./README.md) (same plan; not yet documented in repo).

## References

- [Phase 0 runbook](./phase0-runbook.md)
- [dokploy-instance.md](../dokploy-instance.md) (update after cutover)
