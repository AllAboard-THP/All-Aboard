#!/usr/bin/env node
/**
 * Phase 2c — recreate legacy Rails `website` on Pretorya (Postgres + rails-fullstack).
 *
 * Empty Postgres (no Mestryx dump). See Docs/deployment/migration-pretorya/DECISIONS.md.
 *
 * Credentials: `.allaboard-migration/phase1/dokploy-api.env`
 * Secrets layout: `.allaboard-migration/phase0/` (Phase 0 export).
 *
 * Usage: node scripts/migration/pretorya-phase2-recreate-rails.mjs
 */

import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import {
  dokployRequest,
  loadPhase1Env,
  PHASE1_ENV_PATH,
} from "./pretorya-phase1-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PHASE0_DIR = path.join(REPO_ROOT, ".allaboard-migration", "phase0");
const OUT_DIR = path.join(REPO_ROOT, ".allaboard-migration", "phase2");

const PROJECT_NAME = "website";
const ENV_NAME = "production";
const POSTGRES_NAME = "Allaboard-rails";
const APP_NAME = "rails-fullstack";
const GITHUB_OWNER = "AllAboard-THP";
const GITHUB_REPO = "Projet-Final---All-aboard";
const BRANCH = "deploy";
const DOCKERFILE = "Dockerfile";
const DOMAIN = "rails.allaboard.fr";
const APP_PORT = 3000;

async function readText(filePath) {
  return readFile(filePath, "utf8");
}

async function readEnvFile(relPath) {
  const full = path.join(PHASE0_DIR, relPath);
  try {
    await access(full);
  } catch {
    throw new Error(`Missing Phase 0 export: ${relPath}`);
  }
  return readText(full);
}

function envValue(envBlock, key) {
  for (const line of envBlock.split("\n")) {
    if (line.startsWith(`${key}=`)) return line.slice(key.length + 1);
  }
  return null;
}

function patchRailsEnv(envBlock, postgresAppName, password, databaseName, databaseUser) {
  const masterKey = envValue(envBlock, "RAILS_MASTER_KEY");
  if (!masterKey) {
    throw new Error("RAILS_MASTER_KEY missing from Phase 0 rails env export");
  }
  const databaseUrl = `postgresql://${encodeURIComponent(databaseUser)}:${encodeURIComponent(password)}@${postgresAppName}:5432/${databaseName}`;
  return `RAILS_MASTER_KEY=${masterKey}\nDATABASE_URL=${databaseUrl}\n`;
}

async function ensureProjectAndEnv() {
  let projects = await dokployRequest("project.all");
  let project = projects.find((p) => p.name === PROJECT_NAME);
  if (!project) {
    console.log(`Creating project "${PROJECT_NAME}"…`);
    await dokployRequest("project.create", {}, {
      name: PROJECT_NAME,
      description: "Rails legacy Pretorya migration",
    });
    projects = await dokployRequest("project.all");
    project = projects.find((p) => p.name === PROJECT_NAME);
  }
  if (!project) {
    throw new Error(`Project "${PROJECT_NAME}" missing after create`);
  }
  const projectId = project.projectId ?? project.id;
  const detail = await dokployRequest("project.one", { projectId });
  const environments = detail.environments ?? [];
  let env = environments.find((e) => e.name === ENV_NAME);
  if (!env) {
    console.log(`Creating environment "${ENV_NAME}"…`);
    env = await dokployRequest("environment.create", {}, {
      projectId,
      name: ENV_NAME,
      description: "Rails production Pretorya",
    });
  }
  return {
    projectId,
    environmentId: env.environmentId ?? env.id,
  };
}

async function resolveDeployServerId() {
  const servers = await dokployRequest("server.all");
  const list = Array.isArray(servers) ? servers : [];
  const deploy =
    list.find((s) => s.name === "allaboard-pretorya") ??
    list.find((s) => (s.serverType ?? "deploy") === "deploy");
  const serverId = deploy?.serverId ?? deploy?.id;
  if (!serverId) {
    throw new Error("No deploy server found (expected allaboard-pretorya)");
  }
  return serverId;
}

async function resolveGithubId() {
  const providers = await dokployRequest("github.githubProviders");
  const list = Array.isArray(providers) ? providers : [];
  const githubId = list[0]?.githubId ?? list[0]?.id;
  if (!githubId) {
    throw new Error("No GitHub provider on Pretorya — complete Phase 1 Git setup");
  }
  const repos = await dokployRequest("github.getGithubRepositories", { githubId });
  const names = Array.isArray(repos)
    ? repos.map((r) => r.name ?? r.repository)
    : [];
  if (!names.includes(GITHUB_REPO)) {
    throw new Error(
      `GitHub provider cannot see ${GITHUB_OWNER}/${GITHUB_REPO}. Install the Pretorya Dokploy GitHub App on that repo.`,
    );
  }
  return githubId;
}

async function findService(environmentId, kind, name) {
  const projects = await dokployRequest("project.all");
  for (const project of projects) {
    for (const env of project.environments ?? []) {
      if (env.environmentId !== environmentId) continue;
      const services = env.services ?? {};
      const list =
        kind === "postgres"
          ? (services.postgres ?? env.postgres ?? [])
          : (services.applications ?? env.applications ?? []);
      const hit = list.find((item) => item.name === name);
      if (hit) return hit;
    }
  }
  return null;
}

async function ensurePostgres(environmentId, serverId, pgExport) {
  const existing = await findService(environmentId, "postgres", POSTGRES_NAME);
  if (existing?.postgresId) {
    return dokployRequest("postgres.one", { postgresId: existing.postgresId });
  }

  const suffix = randomBytes(3).toString("hex");
  const appName = `website-allaboard-rails-${suffix}`;
  console.log("Creating Rails Postgres…");
  const created = await dokployRequest("postgres.create", {}, {
    name: POSTGRES_NAME,
    appName,
    databaseName: pgExport.databaseName,
    databaseUser: pgExport.databaseUser,
    databasePassword: pgExport.databasePassword,
    dockerImage: pgExport.dockerImage ?? "postgres:18",
    description: "Postgres Rails legacy (Pretorya, empty)",
    environmentId,
    serverId,
  });
  const postgresId = created.postgresId ?? created.id;
  console.log("Deploying Rails Postgres…");
  await dokployRequest("postgres.deploy", {}, { postgresId });
  return dokployRequest("postgres.one", { postgresId });
}

async function ensureApplication({
  environmentId,
  serverId,
  githubId,
  envPayload,
}) {
  const existing = await findService(environmentId, "application", APP_NAME);
  let applicationId = existing?.applicationId;

  if (!applicationId) {
    console.log(`Creating application "${APP_NAME}"…`);
    const created = await dokployRequest("application.create", {}, {
      name: APP_NAME,
      environmentId,
      serverId,
    });
    applicationId = created.applicationId ?? created.id;
  }

  await dokployRequest("application.saveBuildType", {}, {
    applicationId,
    buildType: "dockerfile",
    dockerfile: DOCKERFILE,
    dockerContextPath: ".",
    dockerBuildStage: "",
    herokuVersion: null,
    railpackVersion: null,
  });

  await dokployRequest("application.saveGithubProvider", {}, {
    applicationId,
    owner: GITHUB_OWNER,
    repository: GITHUB_REPO,
    branch: BRANCH,
    buildPath: "/",
    githubId,
    watchPaths: [],
    enableSubmodules: false,
    triggerType: "push",
  });

  await dokployRequest("application.update", {}, {
    applicationId,
    autoDeploy: true,
    triggerType: "push",
    sourceType: "github",
    owner: GITHUB_OWNER,
    repository: GITHUB_REPO,
    branch: BRANCH,
    buildPath: "/",
    githubId,
    enableSubmodules: false,
    buildType: "dockerfile",
    dockerfile: DOCKERFILE,
    dockerContextPath: ".",
  });

  await dokployRequest("application.saveEnvironment", {}, {
    applicationId,
    env: envPayload,
    buildArgs: "",
    buildSecrets: "",
    createEnvFile: true,
  });

  return dokployRequest("application.one", { applicationId });
}

async function ensureDomain(applicationId) {
  const app = await dokployRequest("application.one", { applicationId });
  const domains = app.domains ?? [];
  if (domains.some((d) => d.host === DOMAIN)) return;
  console.log(`Adding domain ${DOMAIN}…`);
  await dokployRequest("domain.create", {}, {
    host: DOMAIN,
    port: APP_PORT,
    https: false,
    certificateType: "none",
    stripPath: false,
    domainType: "application",
    applicationId,
    path: "/",
    internalPath: "/",
  });
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStatus(label, readStatus, timeoutMs) {
  const start = Date.now();
  let last = "";
  while (Date.now() - start < timeoutMs) {
    const status = await readStatus();
    if (status !== last) {
      console.log(`${label}: ${status}`);
      last = status;
    }
    if (status === "done") return status;
    if (status === "error") {
      throw new Error(`${label} deploy status is error`);
    }
    await sleep(15000);
  }
  throw new Error(`${label} timed out (last status: ${last || "unknown"})`);
}

async function main() {
  const loaded = await loadPhase1Env();
  if (!loaded && !process.env.DOKPLOY_API_KEY) {
    console.error(`Missing ${PHASE1_ENV_PATH} or DOKPLOY_API_KEY`);
    process.exit(1);
  }

  const pgExport = JSON.parse(
    await readText(
      path.join(PHASE0_DIR, "postgres", "website-production-Allaboard-rails.json"),
    ),
  );
  const railsEnvRaw = await readEnvFile(
    "applications/website-production-rails-fullstack.env",
  );

  const { projectId, environmentId } = await ensureProjectAndEnv();
  const serverId = await resolveDeployServerId();
  const githubId = await resolveGithubId();

  const postgres = await ensurePostgres(environmentId, serverId, pgExport);
  const postgresAppName = postgres.appName;
  const pgPassword = postgres.databasePassword ?? pgExport.databasePassword;
  const databaseName = postgres.databaseName ?? pgExport.databaseName;
  const databaseUser = postgres.databaseUser ?? pgExport.databaseUser;

  await waitForStatus(
    "Postgres",
    async () => {
      const one = await dokployRequest("postgres.one", {
        postgresId: postgres.postgresId,
      });
      return one.applicationStatus ?? "unknown";
    },
    10 * 60 * 1000,
  );

  const railsEnv = patchRailsEnv(
    railsEnvRaw,
    postgresAppName,
    pgPassword,
    databaseName,
    databaseUser,
  );

  const app = await ensureApplication({
    environmentId,
    serverId,
    githubId,
    envPayload: railsEnv,
  });

  await ensureDomain(app.applicationId);

  console.log("Deploying rails-fullstack…");
  await dokployRequest("application.deploy", {}, {
    applicationId: app.applicationId,
    title: "rails-fullstack",
    description: "Pretorya phase2c rails recreate",
  });

  await waitForStatus(
    "rails-fullstack",
    async () => {
      const one = await dokployRequest("application.one", {
        applicationId: app.applicationId,
      });
      return one.applicationStatus ?? "unknown";
    },
    25 * 60 * 1000,
  );

  const report = {
    recreatedAt: new Date().toISOString(),
    projectId,
    environmentId,
    serverId,
    githubId,
    postgres: {
      postgresId: postgres.postgresId,
      appName: postgresAppName,
      databaseName,
      dockerImage: pgExport.dockerImage ?? "postgres:18",
      data: "empty",
    },
    application: {
      applicationId: app.applicationId,
      appName: app.appName,
      name: APP_NAME,
      repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
      branch: BRANCH,
      dockerfile: DOCKERFILE,
    },
    domains: [{ host: DOMAIN, port: APP_PORT, https: false }],
    notRestored: "Mestryx pg_dump skipped — empty Rails DB per DECISIONS.md",
    publicTraffic: "Still on Mestryx until Cloudflare cutover (Phase 4–5).",
  };

  await mkdir(OUT_DIR, { recursive: true });
  const reportPath = path.join(OUT_DIR, "rails-recreate-report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
