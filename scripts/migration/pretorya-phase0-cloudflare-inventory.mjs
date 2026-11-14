#!/usr/bin/env node
/**
 * Phase 0 — Cloudflare Zero Trust tunnel + public hostname inventory.
 *
 * Credentials (any one):
 * - CLOUDFLARE_API_TOKEN (+ optional CLOUDFLARE_ACCOUNT_ID)
 * - `.allaboard-migration/phase0/cloudflare-api.env` (gitignored), e.g.:
 *     CLOUDFLARE_API_TOKEN=...
 *     CLOUDFLARE_ACCOUNT_ID=...
 *
 * Without API token, writes Dokploy domain list + public DNS resolver snapshot.
 */

import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import dns from "node:dns/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(REPO_ROOT, ".allaboard-migration", "phase0");
const DOC_PATH = path.join(
  REPO_ROOT,
  "Docs/deployment/migration-pretorya/phase0-cloudflare-inventory.md",
);
const ZONE_NAME = "allaboard.fr";

const PUBLIC_HOSTS = [
  "",
  "dev",
  "api-dev",
  "storybook",
  "staging",
  "api-staging",
  "api",
  "rails",
  "www",
];

async function loadCloudflareCredentials() {
  const fromEnv = {
    token: process.env.CLOUDFLARE_API_TOKEN?.trim() || null,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || null,
  };
  if (fromEnv.token) return fromEnv;

  const envPath = path.join(OUT_DIR, "cloudflare-api.env");
  try {
    await access(envPath);
    const raw = await readFile(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key === "CLOUDFLARE_API_TOKEN" && value) fromEnv.token = value;
      if (key === "CLOUDFLARE_ACCOUNT_ID" && value) fromEnv.accountId = value;
    }
  } catch {
    /* optional file */
  }
  return fromEnv;
}

async function cfGet(token, pathname) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.json();
  if (!body.success) {
    throw new Error(`Cloudflare ${pathname}: ${JSON.stringify(body.errors ?? body)}`);
  }
  return body.result;
}

async function resolvePublicDns() {
  const rows = [];
  for (const label of PUBLIC_HOSTS) {
    const fqdn = label ? `${label}.${ZONE_NAME}` : ZONE_NAME;
    const row = { fqdn, A: null, AAAA: null, CNAME: null, TXT: null };
    for (const type of ["A", "AAAA", "CNAME", "TXT"]) {
      try {
        row[type] = await dns.resolve(fqdn, type);
      } catch {
        row[type] = null;
      }
    }
    rows.push(row);
  }
  return rows;
}

function isCloudflareProxyIp(ip) {
  return (
    typeof ip === "string" &&
    (ip.startsWith("104.") ||
      ip.startsWith("172.64.") ||
      ip.startsWith("172.65.") ||
      ip.startsWith("172.66.") ||
      ip.startsWith("172.67.") ||
      ip.startsWith("188.114.") ||
      ip.startsWith("173.245.") ||
      ip.startsWith("103.21.") ||
      ip.startsWith("103.22.") ||
      ip.startsWith("103.31.") ||
      ip.startsWith("141.101.") ||
      ip.startsWith("108.162.") ||
      ip.startsWith("190.93.") ||
      ip.startsWith("197.234.") ||
      ip.startsWith("198.41."))
  );
}

async function fetchCloudflareApiInventory(token, accountId, tunnelId) {
  const out = {
    zone: null,
    sslMode: null,
    dnsRecords: [],
    tunnels: [],
    mestryxTunnel: null,
    mestryxConnections: [],
    zeroTrustRoutes: [],
  };

  const zones = await cfGet(token, `/zones?name=${ZONE_NAME}&status=active&per_page=1`);
  const zone = zones?.[0];
  if (!zone) {
    throw new Error(`Zone ${ZONE_NAME} not found for this API token`);
  }
  out.zone = { id: zone.id, name: zone.name, status: zone.status };

  const ssl = await cfGet(token, `/zones/${zone.id}/settings/ssl`);
  out.sslMode = ssl?.value ?? null;

  let page = 1;
  const perPage = 100;
  while (true) {
    const batch = await cfGet(
      token,
      `/zones/${zone.id}/dns_records?per_page=${perPage}&page=${page}`,
    );
    if (!batch?.length) break;
    out.dnsRecords.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  const tunnels = await cfGet(
    token,
    `/accounts/${accountId}/cfd_tunnel?is_deleted=false&per_page=50`,
  );
  out.tunnels = tunnels.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    connsActiveAt: t.conns_active_at ?? null,
    connsInactiveAt: t.conns_inactive_at ?? null,
    createdAt: t.created_at ?? null,
  }));

  if (tunnelId) {
    const tunnel = await cfGet(
      token,
      `/accounts/${accountId}/cfd_tunnel/${tunnelId}`,
    );
    out.mestryxTunnel = {
      id: tunnel.id,
      name: tunnel.name,
      status: tunnel.status,
      connsActiveAt: tunnel.conns_active_at ?? null,
      connsInactiveAt: tunnel.conns_inactive_at ?? null,
      remoteConfig: tunnel.remote_config ?? null,
    };

    const connections = await cfGet(
      token,
      `/accounts/${accountId}/cfd_tunnel/${tunnelId}/connections`,
    );
    out.mestryxConnections = (connections ?? []).map((c) => ({
      id: c.id ?? c.uuid,
      coloName: c.colo_name ?? null,
      clientVersion: c.client_version ?? null,
      originIp: c.origin_ip ?? null,
      openedAt: c.opened_at ?? null,
      isPendingReconnect: c.is_pending_reconnect ?? null,
    }));

    const config = await cfGet(
      token,
      `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
    );
    const ingress = config?.config?.ingress ?? config?.ingress ?? [];
    out.zeroTrustRoutes = ingress
      .filter((r) => r.hostname)
      .map((r) => ({
        hostname: r.hostname,
        service: r.service,
        originRequest: r.originRequest ?? null,
      }));
  }

  return out;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = JSON.parse(
    await readFile(path.join(OUT_DIR, "manifest.json"), "utf8"),
  );
  const creds = await loadCloudflareCredentials();

  const inventory = {
    generatedAt: new Date().toISOString(),
    cloudflareAccountId: manifest.cloudflareTunnel?.accountId ?? creds.accountId ?? null,
    tunnelIdFromMestryxToken: manifest.cloudflareTunnel?.tunnelId ?? null,
    cloudflaredComposeAppName: manifest.cloudflareTunnel?.composeAppName ?? null,
    dokployTraefikHosts: manifest.publicHostsFromDokploy,
    publicDnsResolver: await resolvePublicDns(),
    zeroTrustRoutes: [],
    dnsNotes:
      "Public traffic: Cloudflare edge → cloudflared (host network) → Traefik :80 → Dokploy services.",
  };

  if (creds.token && (creds.accountId || inventory.cloudflareAccountId)) {
    const accountId = creds.accountId || inventory.cloudflareAccountId;
    try {
      const api = await fetchCloudflareApiInventory(
        creds.token,
        accountId,
        inventory.tunnelIdFromMestryxToken,
      );
      inventory.zone = api.zone;
      inventory.sslMode = api.sslMode;
      inventory.dnsRecordsFromApi = api.dnsRecords;
      inventory.tunnels = api.tunnels;
      inventory.mestryxTunnel = api.mestryxTunnel;
      inventory.mestryxConnections = api.mestryxConnections;
      inventory.zeroTrustRoutes = api.zeroTrustRoutes;
    } catch (err) {
      inventory.apiError = String(err.message ?? err);
    }
  } else {
    inventory.apiSkipped =
      "Set CLOUDFLARE_API_TOKEN (+ CLOUDFLARE_ACCOUNT_ID) or `.allaboard-migration/phase0/cloudflare-api.env` to pull Zero Trust ingress, SSL/TLS, and authoritative DNS from API.";
  }

  await writeFile(
    path.join(OUT_DIR, "cloudflare-inventory.json"),
    `${JSON.stringify(inventory, null, 2)}\n`,
    "utf8",
  );

  const md = buildMarkdown(inventory);
  await writeFile(DOC_PATH, md, "utf8");
  console.log(`Wrote ${DOC_PATH}`);
  console.log(`Wrote ${path.join(OUT_DIR, "cloudflare-inventory.json")}`);
  if (inventory.apiError) {
    console.error(`Cloudflare API error: ${inventory.apiError}`);
    process.exitCode = 1;
  }
}

function buildMarkdown(inv) {
  const lines = [
    "# Phase 0 — Cloudflare inventory (Mestryx → Pretorya)",
    "",
    `**Generated:** ${inv.generatedAt}`,
    "",
    "Secrets (tunnel install token, API token) live only under `.allaboard-migration/` — never commit.",
    "",
    "## Tunnel (Mestryx Dokploy compose export)",
    "",
    "| Field | Value |",
    "|-------|--------|",
    `| Account ID | \`${inv.cloudflareAccountId ?? "—"}\` |`,
    `| Tunnel ID | \`${inv.tunnelIdFromMestryxToken ?? "—"}\` |`,
    `| Compose service (Dokploy) | \`${inv.cloudflaredComposeAppName ?? "—"}\` |`,
    `| \`cloudflared\` networking | \`network_mode: host\` → Traefik on \`:80\` on the Dokploy host |`,
    "",
  ];

  if (inv.mestryxTunnel) {
    lines.push(
      "## Active tunnel (Cloudflare API)",
      "",
      "| Field | Value |",
      "|-------|--------|",
      `| Name | ${inv.mestryxTunnel.name} |`,
      `| Status | **${inv.mestryxTunnel.status}** |`,
      `| Connections active since | ${inv.mestryxTunnel.connsActiveAt ?? "—"} |`,
      `| Remote config (dashboard) | ${inv.mestryxTunnel.remoteConfig ? "yes" : "no"} |`,
      "",
    );
    if (inv.mestryxConnections?.length) {
      lines.push(
        "### Connectors (edge connections)",
        "",
        "| Colo | Origin IP | Client | Opened |",
        "|------|-----------|--------|--------|",
      );
      for (const c of inv.mestryxConnections) {
        lines.push(
          `| ${c.coloName ?? "—"} | \`${c.originIp ?? "—"}\` | ${c.clientVersion ?? "—"} | ${c.openedAt ?? "—"} |`,
        );
      }
      lines.push("");
    }
  } else if (!inv.apiSkipped && !inv.apiError) {
    lines.push(
      "_Tunnel live status not fetched (missing tunnel ID in manifest)._",
      "",
    );
  }

  if (inv.tunnels?.length) {
    lines.push("## All tunnels in account (API)", "", "| Name | ID | Status |", "|------|-----|--------|");
    for (const t of inv.tunnels) {
      lines.push(`| ${t.name} | \`${t.id}\` | ${t.status} |`);
    }
    lines.push("");
  }

  lines.push(
    "## Zero Trust — Public Hostnames (ingress)",
    "",
  );

  if (inv.zeroTrustRoutes?.length) {
    lines.push("| Hostname | Service URL |", "|----------|-------------|");
    for (const r of inv.zeroTrustRoutes) {
      lines.push(`| \`${r.hostname}\` | \`${r.service}\` |`);
    }
    lines.push("");
  } else {
    lines.push(
      inv.apiSkipped ??
        inv.apiError ??
        "_No routes fetched._",
      "",
      "**Baseline (from Mestryx `cloudflared` compose):** each public hostname should target **`http://127.0.0.1:80`** (Traefik). Dokploy routes by `Host` header to the container port below.",
      "",
      "| Public hostname | Traefik backend (Dokploy port) |",
      "|-----------------|--------------------------------|",
      "| `dev.allaboard.fr` | Web :3000 |",
      "| `api-dev.allaboard.fr` | API :4000 |",
      "| `storybook.allaboard.fr` | Storybook :8080 |",
      "| `staging.allaboard.fr` | Web :3000 |",
      "| `api-staging.allaboard.fr` | API :4000 |",
      "| `allaboard.fr` | Web :3000 |",
      "| `api.allaboard.fr` | API :4000 |",
      "| `rails.allaboard.fr` | Rails :3000 |",
      "",
    );
  }

  lines.push(
    "## Public hostnames — Dokploy Traefik (reference)",
    "",
    "Domains attached in Dokploy (`https: false` — TLS terminates at Cloudflare).",
    "",
    "| Host | Container port | Service | Docker app name |",
    "|------|----------------|---------|-----------------|",
  );

  for (const row of inv.dokployTraefikHosts.sort((a, b) =>
    a.host.localeCompare(b.host),
  )) {
    lines.push(
      `| \`${row.host}\` | ${row.port} | ${row.service} | \`${row.dockerAppName}\` |`,
    );
  }

  lines.push("", "## DNS", "");

  if (inv.sslMode) {
    lines.push(
      "### SSL/TLS (zone `allaboard.fr`, API)",
      "",
      `| Setting | Value |`,
      `|---------|--------|`,
      `| SSL/TLS encryption mode | **${inv.sslMode}** |`,
      "",
      inv.sslMode === "full" || inv.sslMode === "strict"
        ? "OK for cutover (not Flexible)."
        : "**Action:** set mode to **Full** (or Full Strict) before production cutover.",
      "",
    );
  } else {
    lines.push(
      "### SSL/TLS (zone `allaboard.fr`)",
      "",
      "- Confirm mode **Full** (not Flexible) in Cloudflare → SSL/TLS → Overview.",
      "",
    );
  }

  const tunnelDns =
    inv.dnsRecordsFromApi?.filter(
      (r) =>
        (r.content && String(r.content).includes("cfargotunnel.com")) ||
        r.type === "CNAME",
    ) ?? [];

  const relevantDns =
    inv.dnsRecordsFromApi?.filter((r) => {
      const n = String(r.name).replace(/\.$/, "");
      return (
        n === ZONE_NAME ||
        n.endsWith(`.${ZONE_NAME}`) ||
        String(r.content ?? "").includes("cfargotunnel.com")
      );
    }) ?? [];

  if (relevantDns.length) {
    lines.push(
      "### Authoritative DNS (Cloudflare API)",
      "",
      "| Type | Name | Content | Proxied |",
      "|------|------|---------|---------|",
    );
    for (const r of relevantDns.sort((a, b) => a.name.localeCompare(b.name))) {
      const proxied = r.proxied ? "yes" : "no";
      lines.push(
        `| ${r.type} | \`${r.name}\` | \`${r.content}\` | ${proxied} |`,
      );
    }
    lines.push("");
    if (tunnelDns.length) {
      lines.push(
        `_Records referencing \`cfargotunnel.com\`: ${tunnelDns.length} (tunnel CNAME targets)._`,
        "",
      );
    }
  }

  lines.push(
    "### Public resolver snapshot (2026-10-05 methodology)",
    "",
    "When **proxied** (orange cloud), resolvers often return Cloudflare anycast **A/AAAA** instead of the tunnel **CNAME**. All MVP hosts below resolve to Cloudflare edge IPs (expected).",
    "",
    "| FQDN | A | CNAME |",
    "|------|---|-------|",
  );

  for (const row of inv.publicDnsResolver ?? []) {
    const a = row.A?.join(", ") ?? "—";
    const cname = row.CNAME?.join(", ") ?? "—";
    const cf = row.A?.every(isCloudflareProxyIp) ? " (CF edge)" : "";
    lines.push(`| \`${row.fqdn}\` | ${a}${cf} | ${cname} |`);
  }

  lines.push(
    "",
    "## Phase 4 cutover checklist (from this inventory)",
    "",
    "- [ ] Create Pretorya tunnel + install token on new host",
    "- [ ] Replicate each **Public Hostname** → service URL (table above)",
    "- [ ] One hostname at a time; keep Mestryx connector until rollback window ends",
    "- [ ] SSL/TLS **Full** on zone",
    "",
    "## Maintenance",
    "",
    "Re-run after Dokploy or Cloudflare changes:",
    "",
    "```bash",
    "node scripts/migration/pretorya-phase0-export.mjs",
    "node scripts/migration/pretorya-phase0-cloudflare-inventory.mjs",
    "```",
    "",
    "Optional API credentials file (gitignored): `.allaboard-migration/phase0/cloudflare-api.env` — see `scripts/migration/cloudflare-api.env.example`.",
    "",
  );

  return `${lines.join("\n")}\n`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
