#!/usr/bin/env node
/**
 * Phase 2a — recreate MVP dev on Pretorya (Postgres, API, Web, Storybook).
 *
 * Credentials: `.allaboard-migration/phase1/dokploy-api.env` or env DOKPLOY_*.
 * Dev secrets: `.allaboard-migration/phase0/applications/*-dev-*.env` (Phase 0 export).
 *
 * Usage: node scripts/migration/pretorya-phase2-recreate-dev.mjs
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

const PROJECT_NAME = "AllAboard monorepo website";
const ENV_NAME = "dev";
const GITHUB_OWNER = "AllAboard-THP";
const GITHUB_REPO = "All-Aboard";
const BRANCH = "Dev";

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

function patchDatabaseUrl(envBlock, postgresAppName, password) {
  const lines = envBlock.trim().split("\n");
  const out = [];
  let replaced = false;
  for (const line of lines) {
    if (line.startsWith("DATABASE_URL=")) {
      out.push(
        `DATABASE_URL=postgresql://allaboard:${encodeURIComponent(password)}@${postgresAppName}:5432/allaboard`,
      );
      replaced = true;
    } else {
      out.push(line);
    }
  }
  if (!replaced) {
    throw new Error("DATABASE_URL not found in API env export");
  }
  return out.join("\n");
}

function patchApiUrl(envBlock, apiAppName) {
  const lines = envBlock.trim().split("\n");
  return lines
    .map((line) =>
      line.startsWith("API_URL=")
        ? `API_URL=http://${apiAppName}:4000`
        : line,
    )
    .join("\n");
}

async function ensureProjectAndDevEnv() {
  const projects = await dokployRequest("project.all");
  let project = projects.find((p) => p.name === PROJECT_NAME);
  if (!project) {
    console.log(`Creating project "${PROJECT_NAME}"…`);
    project = await dokployRequest("project.create", {}, {
      name: PROJECT_NAME,
      description: "MVP Pretorya migration",
    });
  }
  const projectId = project.projectId ?? project.id;
  const detail = await dokployRequest("project.one", { projectId });
  const environments = detail.environments ?? [];
  let devEnv = environments.find((e) => e.name === ENV_NAME);
  if (!devEnv) {
    console.log(`Creating environment "${ENV_NAME}"…`);
    devEnv = await dokployRequest("environment.create", {}, {
      projectId,
      name: ENV_NAME,
      description: "MVP dev Pretorya",
    });
  }
  return {
    projectId,
    environmentId: devEnv.environmentId ?? devEnv.id,
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
  return githubId;
}

async function findService(environmentId, kind, name) {
  const projects = await dokployRequest("project.all");
  for (const project of projects) {
    for (const env of project.environments ?? []) {
      if (env.environmentId !== environmentId) continue;
      const services = env.services ?? {};
      if (kind === "postgres") {
        const hit = (services.postgres ?? []).find((p) => p.name === name);
        if (hit) return hit;
      } else {
        const hit = (services.applications ?? []).find((a) => a.name === name);
        if (hit) return hit;
      }
    }
  }
  return null;
}

async function ensurePostgres(environmentId, serverId, pgExport) {
  const existing = await findService(environmentId, "postgres", "Postgres");
  if (existing?.postgresId) {
    const one = await dokployRequest("postgres.one", {
      postgresId: existing.postgresId,
    });
    return one;
  }

  const suffix = randomBytes(3).toString("hex");
  const appName = `allaboard-monorepo-website-postgres-dev-${suffix}`;
  console.log("Creating Postgres…");
  const created = await dokployRequest("postgres.create", {}, {
    name: "Postgres",
    appName,
    databaseName: pgExport.databaseName ?? "allaboard",
    databaseUser: pgExport.databaseUser ?? "allaboard",
    databasePassword: pgExport.databasePassword,
    dockerImage: pgExport.dockerImage ?? "postgres:18",
    description: "Postgres principal AllAboard dev (Pretorya)",
    environmentId,
    serverId,
  });
  const postgresId = created.postgresId ?? created.id;
  console.log("Deploying Postgres…");
  await dokployRequest("postgres.deploy", {}, { postgresId });
  return dokployRequest("postgres.one", { postgresId });
}

async function ensureApplication({
  environmentId,
  serverId,
  githubId,
  name,
  dockerfile,
  apiEnv,
  webEnv,
  storybookEnv,
}) {
  const existing = await findService(environmentId, "application", name);
  let applicationId = existing?.applicationId;

  if (!applicationId) {
    console.log(`Creating application "${name}"…`);
    const created = await dokployRequest("application.create", {}, {
      name,
      environmentId,
      serverId,
    });
    applicationId = created.applicationId ?? created.id;
  }

  await dokployRequest("application.saveBuildType", {}, {
    applicationId,
    buildType: "dockerfile",
    dockerfile,
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
    dockerfile,
    dockerContextPath: ".",
  });

  const envPayload =
    name === "API" ? apiEnv : name === "Web" ? webEnv : storybookEnv;
  if (envPayload) {
    await dokployRequest("application.saveEnvironment", {}, {
      applicationId,
      env: envPayload,
      buildArgs: "",
      buildSecrets: "",
      createEnvFile: true,
    });
  }

  const one = await dokployRequest("application.one", { applicationId });
  return one;
}

async function ensureDomain(applicationId, host, port) {
  const app = await dokployRequest("application.one", { applicationId });
  const domains = app.domains ?? [];
  if (domains.some((d) => d.host === host)) {
    return;
  }
  console.log(`Adding domain ${host}…`);
  await dokployRequest("domain.create", {}, {
    host,
    port,
    https: false,
    certificateType: "none",
    stripPath: false,
    domainType: "application",
    applicationId,
    path: "/",
    internalPath: "/",
  });
}

async function deployApplication(applicationId, title) {
  console.log(`Deploying ${title}…`);
  await dokployRequest("application.deploy", {}, {
    applicationId,
    title,
    description: "Pretorya phase2 dev recreate",
  });
}

async function main() {
  const loaded = await loadPhase1Env();
  if (!loaded && !process.env.DOKPLOY_API_KEY) {
    console.error(`Missing ${PHASE1_ENV_PATH} or DOKPLOY_API_KEY`);
    process.exit(1);
  }

  const pgJson = JSON.parse(
    await readText(
      path.join(PHASE0_DIR, "postgres", "AllAboard_monorepo_website-dev-Postgres.json"),
    ),
  );
  const apiEnvRaw = await readEnvFile(
    "applications/AllAboard_monorepo_website-dev-API.env",
  );
  const webEnvRaw = await readEnvFile(
    "applications/AllAboard_monorepo_website-dev-Web.env",
  );
  const storybookEnvRaw = await readEnvFile(
    "applications/AllAboard_monorepo_website-dev-Storybook.env",
  );

  const { projectId, environmentId } = await ensureProjectAndDevEnv();
  const serverId = await resolveDeployServerId();
  const githubId = await resolveGithubId();

  const postgres = await ensurePostgres(environmentId, serverId, pgJson);
  const postgresAppName = postgres.appName;
  const pgPassword = postgres.databasePassword ?? pgJson.databasePassword;

  const apiEnv = patchDatabaseUrl(apiEnvRaw, postgresAppName, pgPassword);

  const api = await ensureApplication({
    environmentId,
    serverId,
    githubId,
    name: "API",
    dockerfile: "infra/docker/Dockerfile.api",
    apiEnv,
  });
  const apiAppName = api.appName;

  const webEnv = patchApiUrl(webEnvRaw, apiAppName);
  const storybookEnv = patchApiUrl(storybookEnvRaw, apiAppName);

  const web = await ensureApplication({
    environmentId,
    serverId,
    githubId,
    name: "Web",
    dockerfile: "infra/docker/Dockerfile.web",
    webEnv,
  });

  const storybook = await ensureApplication({
    environmentId,
    serverId,
    githubId,
    name: "Storybook",
    dockerfile: "infra/docker/Dockerfile.storybook",
    storybookEnv,
  });

  await ensureDomain(api.applicationId, "api-dev.allaboard.fr", 4000);
  await ensureDomain(web.applicationId, "dev.allaboard.fr", 3000);
  await ensureDomain(storybook.applicationId, "storybook.allaboard.fr", 8080);

  console.log("Deploying Postgres (if not already running)…");
  await dokployRequest("postgres.deploy", {}, {
    postgresId: postgres.postgresId,
  });
  await deployApplication(api.applicationId, "API");
  await deployApplication(web.applicationId, "Web");
  await deployApplication(storybook.applicationId, "Storybook");

  const report = {
    recreatedAt: new Date().toISOString(),
    projectId,
    environmentId,
    serverId,
    githubId,
    postgres: {
      postgresId: postgres.postgresId,
      appName: postgresAppName,
    },
    api: { applicationId: api.applicationId, appName: apiAppName },
    web: { applicationId: web.applicationId, appName: web.appName },
    storybook: {
      applicationId: storybook.applicationId,
      appName: storybook.appName,
    },
    domains: [
      "dev.allaboard.fr",
      "api-dev.allaboard.fr",
      "storybook.allaboard.fr",
    ],
  };

  await mkdir(OUT_DIR, { recursive: true });
  const reportPath = path.join(OUT_DIR, "dev-recreate-report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
