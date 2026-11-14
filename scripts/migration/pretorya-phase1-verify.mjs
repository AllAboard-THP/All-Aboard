#!/usr/bin/env node
/**
 * Phase 1 — verify Pretorya Dokploy: deploy server ready + GitHub App connected.
 *
 * Usage:
 *   node scripts/migration/pretorya-phase1-verify.mjs
 *
 * Credentials: env vars or `.allaboard-migration/phase1/dokploy-api.env`
 * Writes: `.allaboard-migration/phase1/verify-report.json` (no secrets)
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUIRED_REPOS,
  dokployRequest,
  loadPhase1Env,
  PHASE1_ENV_PATH,
} from "./pretorya-phase1-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(REPO_ROOT, ".allaboard-migration", "phase1");

async function main() {
  const loaded = await loadPhase1Env();
  if (!loaded) {
    console.error(`No env file at ${PHASE1_ENV_PATH}`);
    console.error("Copy scripts/migration/dokploy-api.env.example and set DOKPLOY_API_KEY.");
    process.exit(1);
  }

  const report = {
    verifiedAt: new Date().toISOString(),
    dokployUrl: process.env.DOKPLOY_URL?.replace(/\/api$/, "") ?? null,
    servers: [],
    githubProviders: [],
    repoAccess: [],
    checks: {
      hasDeployServer: false,
      serverSetupOk: false,
      hasGithubProvider: false,
      reposReachable: false,
      githubTestConnection: false,
    },
    errors: [],
  };

  try {
    const servers = await dokployRequest("server.all");
    const list = Array.isArray(servers) ? servers : [];
    for (const server of list) {
      const serverId = server.serverId ?? server.id;
      let validated = null;
      try {
        validated = await dokployRequest("server.validate", { serverId });
      } catch (err) {
        report.errors.push(`server.validate ${serverId}: ${err.message}`);
      }
      report.servers.push({
        serverId,
        name: server.name,
        ipAddress: server.ipAddress,
        serverType: server.serverType,
        status: server.status ?? server.serverStatus,
        validate: validated,
      });
    }
    const deployServers = list.filter(
      (s) => (s.serverType ?? "deploy") === "deploy" || !s.serverType,
    );
    report.checks.hasDeployServer = deployServers.length >= 1;
    report.checks.serverSetupOk = report.servers.some((s) => {
      const v = s.validate;
      if (!v || typeof v !== "object") return s.status === "active" || s.status === "done";
      return v.valid === true || v.status === "ok" || v.connected === true;
    });
  } catch (err) {
    report.errors.push(`server.all: ${err.message}`);
  }

  try {
    const providers = await dokployRequest("github.githubProviders");
    const list = Array.isArray(providers) ? providers : [];
    report.githubProviders = list.map((p) => ({
      githubId: p.githubId ?? p.id,
      name: p.name,
      githubAppName: p.githubAppName ?? p.appName,
      gitProviderId: p.gitProviderId,
    }));
    report.checks.hasGithubProvider = list.length >= 1;

    const githubId = list[0]?.githubId ?? list[0]?.id;
    if (githubId) {
      try {
        const test = await dokployRequest("github.testConnection", {}, { githubId });
        report.checks.githubTestConnection =
          test === true || test?.ok === true || test?.success === true;
      } catch (err) {
        report.errors.push(`github.testConnection: ${err.message}`);
      }

      for (const { owner, repo } of REQUIRED_REPOS) {
        try {
          const repos = await dokployRequest("github.getGithubRepositories", {
            githubId,
          });
          const names = Array.isArray(repos)
            ? repos.map((r) => r.name ?? r.repository).filter(Boolean)
            : [];
          const found = names.some(
            (n) => n === repo || n?.toLowerCase?.() === repo.toLowerCase(),
          );
          report.repoAccess.push({ owner, repo, found, sampleCount: names.length });
        } catch (err) {
          report.repoAccess.push({ owner, repo, found: false, error: err.message });
        }
      }
      report.checks.reposReachable = report.repoAccess.every((r) => r.found);
    }
  } catch (err) {
    report.errors.push(`github.githubProviders: ${err.message}`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "verify-report.json");
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const pass =
    report.checks.hasDeployServer &&
    report.checks.hasGithubProvider &&
    report.checks.reposReachable;

  console.log(`Report: ${outPath}`);
  console.log(JSON.stringify(report.checks, null, 2));
  if (report.errors.length) {
    console.warn("Errors:", report.errors.join("; "));
  }
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
