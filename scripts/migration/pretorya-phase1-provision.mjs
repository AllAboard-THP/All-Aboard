#!/usr/bin/env node
/**
 * Phase 1 — register a remote deploy server on Pretorya Dokploy and run setup.
 *
 * Requires in `.allaboard-migration/phase1/dokploy-api.env`:
 *   DOKPLOY_URL, DOKPLOY_API_KEY
 *   DOKPLOY_SERVER_NAME, DOKPLOY_SERVER_IP, DOKPLOY_SERVER_SSH_KEY_ID
 * Optional: DOKPLOY_SERVER_SSH_PORT (22), DOKPLOY_SERVER_SSH_USER (root)
 *
 * Usage: node scripts/migration/pretorya-phase1-provision.mjs
 */

import {
  dokployRequest,
  loadPhase1Env,
  PHASE1_ENV_PATH,
} from "./pretorya-phase1-lib.mjs";

async function main() {
  const loaded = await loadPhase1Env();
  if (!loaded) {
    console.error(`Missing ${PHASE1_ENV_PATH}`);
    process.exit(1);
  }

  const name = process.env.DOKPLOY_SERVER_NAME;
  const ipAddress = process.env.DOKPLOY_SERVER_IP;
  const sshKeyId = process.env.DOKPLOY_SERVER_SSH_KEY_ID;
  const port = Number(process.env.DOKPLOY_SERVER_SSH_PORT ?? "22");
  const username = process.env.DOKPLOY_SERVER_SSH_USER ?? "root";

  if (!name || !ipAddress || !sshKeyId) {
    console.error(
      "Set DOKPLOY_SERVER_NAME, DOKPLOY_SERVER_IP, DOKPLOY_SERVER_SSH_KEY_ID in dokploy-api.env",
    );
    process.exit(1);
  }

  const existing = await dokployRequest("server.all");
  const list = Array.isArray(existing) ? existing : [];
  const match = list.find(
    (s) => s.ipAddress === ipAddress || s.name === name,
  );

  let serverId = match?.serverId ?? match?.id;
  if (!serverId) {
    console.log(`Creating server "${name}" (${ipAddress})…`);
    const created = await dokployRequest("server.create", {}, {
      name,
      description: "All-Aboard Pretorya migration (deploy)",
      ipAddress,
      port,
      username,
      sshKeyId,
      serverType: "deploy",
    });
    serverId = created?.serverId ?? created?.id;
    if (!serverId) {
      throw new Error(`server.create returned no serverId: ${JSON.stringify(created)}`);
    }
    console.log(`Created serverId=${serverId}`);
  } else {
    console.log(`Server already registered: ${serverId} (${match.name})`);
  }

  console.log("Running server.setup (Docker + Traefik) — may take several minutes…");
  await dokployRequest("server.setup", {}, { serverId });

  console.log("Validating server…");
  const validation = await dokployRequest("server.validate", { serverId });
  console.log(JSON.stringify(validation, null, 2));

  console.log("Done. Run: node scripts/migration/pretorya-phase1-verify.mjs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
