# Phase 0 — Cloudflare inventory (Mestryx → Pretorya)

**Generated:** 2026-10-05T07:59:43.106Z

Secrets (tunnel install token, API token) live only under `.allaboard-migration/` — never commit.

## Tunnel (Mestryx Dokploy compose export)

| Field | Value |
|-------|--------|
| Account ID | `ff2e13bece310944bfbccdc0546cf1da` |
| Tunnel ID | `e1e5ba46-8988-40db-8e48-1662853a4426` |
| Compose service (Dokploy) | `infra-cloudflared-a9fuis` |
| `cloudflared` networking | `network_mode: host` → Traefik on `:80` on the Dokploy host |

## Zero Trust — Public Hostnames (ingress)

Set CLOUDFLARE_API_TOKEN (+ CLOUDFLARE_ACCOUNT_ID) or `.allaboard-migration/phase0/cloudflare-api.env` to pull Zero Trust ingress, SSL/TLS, and authoritative DNS from API.

**Baseline (from Mestryx `cloudflared` compose):** each public hostname should target **`http://127.0.0.1:80`** (Traefik). Dokploy routes by `Host` header to the container port below.

| Public hostname | Traefik backend (Dokploy port) |
|-----------------|--------------------------------|
| `dev.allaboard.fr` | Web :3000 |
| `api-dev.allaboard.fr` | API :4000 |
| `storybook.allaboard.fr` | Storybook :8080 |
| `staging.allaboard.fr` | Web :3000 |
| `api-staging.allaboard.fr` | API :4000 |
| `allaboard.fr` | Web :3000 |
| `api.allaboard.fr` | API :4000 |
| `rails.allaboard.fr` | Rails :3000 |

## Public hostnames — Dokploy Traefik (reference)

Domains attached in Dokploy (`https: false` — TLS terminates at Cloudflare).

| Host | Container port | Service | Docker app name |
|------|----------------|---------|-----------------|
| `allaboard.fr` | 3000 | AllAboard monorepo website / production / Web | `app-copy-back-end-bandwidth-zcmvef` |
| `api-dev.allaboard.fr` | 4000 | AllAboard monorepo website / dev / API | `allaboard-monorepo-website-api-1six21` |
| `api-staging.allaboard.fr` | 4000 | AllAboard monorepo website / staging / API | `app-back-up-mobile-microchip-nqw5cs` |
| `api.allaboard.fr` | 4000 | AllAboard monorepo website / production / API | `app-compress-open-source-port-crlo7v` |
| `dev.allaboard.fr` | 3000 | AllAboard monorepo website / dev / Web | `allaboard-monorepo-website-web-zv00ar` |
| `rails.allaboard.fr` | 3000 | website / production / rails-fullstack | `website-railsfullstack-qusjma` |
| `staging.allaboard.fr` | 3000 | AllAboard monorepo website / staging / Web | `app-reboot-neural-microchip-nsesgi` |
| `storybook.allaboard.fr` | 8080 | AllAboard monorepo website / dev / Storybook | `allaboard-monorepo-website-web-mqmjl2` |

## DNS

### SSL/TLS (zone `allaboard.fr`)

- Confirm mode **Full** (not Flexible) in Cloudflare → SSL/TLS → Overview.

### Public resolver snapshot (2026-10-05 methodology)

When **proxied** (orange cloud), resolvers often return Cloudflare anycast **A/AAAA** instead of the tunnel **CNAME**. All MVP hosts below resolve to Cloudflare edge IPs (expected).

| FQDN | A | CNAME |
|------|---|-------|
| `allaboard.fr` | 188.114.96.2, 188.114.97.2 (CF edge) | — |
| `dev.allaboard.fr` | 188.114.96.2, 188.114.97.2 (CF edge) | — |
| `api-dev.allaboard.fr` | 188.114.96.2, 188.114.97.2 (CF edge) | — |
| `storybook.allaboard.fr` | 188.114.97.2, 188.114.96.2 (CF edge) | — |
| `staging.allaboard.fr` | 188.114.97.2, 188.114.96.2 (CF edge) | — |
| `api-staging.allaboard.fr` | 188.114.96.2, 188.114.97.2 (CF edge) | — |
| `api.allaboard.fr` | 188.114.96.2, 188.114.97.2 (CF edge) | — |
| `rails.allaboard.fr` | 188.114.97.2, 188.114.96.2 (CF edge) | — |
| `www.allaboard.fr` | 188.114.96.2, 188.114.97.2 (CF edge) | — |

## Phase 4 cutover checklist (from this inventory)

- [ ] Create Pretorya tunnel + install token on new host
- [ ] Replicate each **Public Hostname** → service URL (table above)
- [ ] One hostname at a time; keep Mestryx connector until rollback window ends
- [ ] SSL/TLS **Full** on zone

## Maintenance

Re-run after Dokploy or Cloudflare changes:

```bash
node scripts/migration/pretorya-phase0-export.mjs
node scripts/migration/pretorya-phase0-cloudflare-inventory.mjs
```

Optional API credentials file (gitignored): `.allaboard-migration/phase0/cloudflare-api.env` — see `scripts/migration/cloudflare-api.env.example`.

