# Phase 1 — execution log (non-secret)

| Step | Status | Location / notes |
|------|--------|------------------|
| Pretorya org on Dokploy Cloud | Done (2026-10-05) | Logged in as org **Pretorya**; billing **3 server slots** on plan |
| SSH key in Dokploy | Done (2026-10-05) | Key name `dokploy-allaboard-ed25519` (ED25519 generated in UI) |
| GitHub App + Dokploy provider | Partial (2026-10-05) | App `dokploy-2026-10-05-we3cw1` created; Dokploy Git provider linked (no **Action Required**). **Pending:** install on org **AllAboard-THP** with repos `All-Aboard` + `Projet-Final---All-aboard` |
| Remote deploy server | **Blocked** | No VPS IP yet — **Settings → Remote Servers → Create Server** after Hetzner/other VPS (≥ 8 GB RAM). Add Dokploy public key to VPS, then **Setup** |
| Pretorya API key + verify script | Pending | Copy [dokploy-api.env.example](../../../scripts/migration/dokploy-api.env.example) → `.allaboard-migration/phase1/dokploy-api.env`; run `node scripts/migration/pretorya-phase1-verify.mjs` |
| Cursor MCP → Pretorya | Pending | Point `user-dokploy-mcp` at `https://app.dokploy.com/api` (not Mestryx) |

## GitHub org check

```bash
gh api orgs/AllAboard-THP/installations \
  --jq '.installations[] | select(.app_slug|startswith("dokploy")) | {app_slug, id}'
```

Expect **two** Dokploy apps until offboarding: Mestryx `dokploy-2026-05-04-1cfoiq` + Pretorya `dokploy-2026-10-05-we3cw1`.
