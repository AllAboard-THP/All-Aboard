#!/usr/bin/env node
/**
 * Phase 0 — export Dokploy (Mestryx) secrets and service metadata for Pretorya migration.
 * Writes ONLY under .allaboard-migration/ (gitignored). Never commit that directory.
 *
 * Usage:
 *   export DOKPLOY_URL="https://dokploy.example.com/api"
 *   export DOKPLOY_API_KEY="..."
 *   node scripts/migration/pretorya-phase0-export.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const OUT_DIR = path.join(REPO_ROOT, ".allaboard-migration", "phase0");

const DOKPLOY_URL = process.env.DOKPLOY_URL?.replace(/\/$/, "");
const DOKPLOY_API_KEY = process.env.DOKPLOY_API_KEY;

if (!DOKPLOY_URL || !DOKPLOY_API_KEY) {
  console.error(
    "Missing DOKPLOY_URL and/or DOKPLOY_API_KEY (see Docs/deployment/migration-pretorya/phase0-runbook.md).",
  );
  process.exit(1);
}

/** @param {string} procedure */
async function dokployGet(procedure, query = {}) {
  const params = new URLSearchParams(query);
  const qs = params.toString();
  const url = `${DOKPLOY_URL}/${procedure}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { "x-api-key": DOKPLOY_API_KEY },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${procedure} HTTP ${res.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

/** Strip deployment history and other large blobs from application payloads. */
function slimApplication(app) {
  if (!app || typeof app !== "object") return app;
  const { deployments, ...rest } = app;
  return {
    ...rest,
    deployments: Array.isArray(deployments)
      ? deployments.slice(0, 3).map((d) => ({
          deploymentId: d.deploymentId,
          status: d.status,
          createdAt: d.createdAt,
          title: d.title,
        }))
      : [],
  };
}

function decodeTunnelTokenPayload(token) {
  if (!token || typeof token !== "string") return null;
  const raw = token.trim().replace(/^CLOUDFLARE_TUNNEL_TOKEN=/, "");
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

const POSTGRES_TARGETS = [
  {
    slug: "mvp-dev",
    postgresId: "ESgIaMY5-5uzqucpECtZh",
    project: "AllAboard monorepo website",
    environment: "dev",
  },
  {
    slug: "mvp-staging",
    postgresId: "hd5RzZWmQiRXYir8GfKRe",
    project: "AllAboard monorepo website",
    environment: "staging",
  },
  {
    slug: "mvp-production",
    postgresId: "5Jco-m_K6JX5CbrNuXf7Y",
    project: "AllAboard monorepo website",
    environment: "production",
  },
  {
    slug: "rails-production",
    postgresId: "M5asQHvNqHpD8jjxp6FG4",
    project: "website",
    environment: "production",
  },
];

const SKIP_APP_NAMES = new Set(["Agent", "Indexer"]);

async function main() {
  const stamp = new Date().toISOString();
  await mkdir(path.join(OUT_DIR, "applications"), { recursive: true });
  await mkdir(path.join(OUT_DIR, "postgres"), { recursive: true });
  await mkdir(path.join(OUT_DIR, "compose"), { recursive: true });

  const projects = await dokployGet("project.all");
  const manifest = {
    exportedAt: stamp,
    dokployUrl: DOKPLOY_URL.replace(/\/api$/, ""),
    organizationId: "9gpH5XINvHD96wHAtkKyT",
    projects: [],
    postgres: [],
    cloudflareTunnel: null,
    publicHostsFromDokploy: [],
  };

  for (const project of projects) {
    const projectEntry = {
      projectId: project.projectId,
      name: project.name,
      environments: [],
    };

    for (const env of project.environments ?? []) {
      const envEntry = {
        environmentId: env.environmentId,
        name: env.name,
        applications: [],
        postgres: [],
        compose: [],
      };

      for (const appRef of env.applications ?? []) {
        if (SKIP_APP_NAMES.has(appRef.name)) continue;
        const app = await dokployGet("application.one", {
          applicationId: appRef.applicationId,
        });
        const slim = slimApplication(app);
        const rel = path.join(
          "applications",
          `${project.name}-${env.name}-${appRef.name}.json`.replace(/[^\w.-]+/g, "_"),
        );
        await writeFile(
          path.join(OUT_DIR, rel),
          `${JSON.stringify(slim, null, 2)}\n`,
          "utf8",
        );

        const envFile = slim.env ?? "";
        if (envFile) {
          await writeFile(
            path.join(
              OUT_DIR,
              "applications",
              `${project.name}-${env.name}-${appRef.name}.env`.replace(/[^\w.-]+/g, "_"),
            ),
            `${envFile.trim()}\n`,
            "utf8",
          );
        }

        for (const domain of slim.domains ?? []) {
          manifest.publicHostsFromDokploy.push({
            host: domain.host,
            port: domain.port,
            https: domain.https,
            path: domain.path,
            service: `${project.name} / ${env.name} / ${appRef.name}`,
            applicationId: appRef.applicationId,
            dockerAppName: slim.appName,
          });
        }

        envEntry.applications.push({
          applicationId: appRef.applicationId,
          name: appRef.name,
          appName: slim.appName,
          branch: slim.branch,
          repository: slim.repository,
          owner: slim.owner,
          dockerfile: slim.dockerfile,
          autoDeploy: slim.autoDeploy,
          exportFile: rel,
        });
      }

      for (const pgRef of env.postgres ?? []) {
        const pg = await dokployGet("postgres.one", {
          postgresId: pgRef.postgresId,
        });
        const rel = path.join(
          "postgres",
          `${project.name}-${env.name}-${pgRef.name}.json`.replace(/[^\w.-]+/g, "_"),
        );
        await writeFile(
          path.join(OUT_DIR, rel),
          `${JSON.stringify(pg, null, 2)}\n`,
          "utf8",
        );
        envEntry.postgres.push({
          postgresId: pgRef.postgresId,
          name: pgRef.name,
          appName: pg.appName,
          databaseName: pg.databaseName,
          databaseUser: pg.databaseUser,
          exportFile: rel,
        });
      }

      for (const composeRef of env.compose ?? []) {
        const compose = await dokployGet("compose.one", {
          composeId: composeRef.composeId,
        });
        const rel = path.join(
          "compose",
          `${project.name}-${env.name}-${composeRef.name}.json`.replace(/[^\w.-]+/g, "_"),
        );
        await writeFile(
          path.join(OUT_DIR, rel),
          `${JSON.stringify(compose, null, 2)}\n`,
          "utf8",
        );
        if (compose.env) {
          await writeFile(
            path.join(
              OUT_DIR,
              "compose",
              `${project.name}-${env.name}-${composeRef.name}.env`.replace(/[^\w.-]+/g, "_"),
            ),
            `${String(compose.env).trim()}\n`,
            "utf8",
          );
          const tokenLine = String(compose.env)
            .split("\n")
            .find((l) => l.startsWith("CLOUDFLARE_TUNNEL_TOKEN="));
          if (tokenLine) {
            const payload = decodeTunnelTokenPayload(tokenLine.split("=", 2)[1]);
            manifest.cloudflareTunnel = {
              composeId: composeRef.composeId,
              composeAppName: compose.appName,
              accountId: payload?.a ?? null,
              tunnelId: payload?.t ?? null,
              note: "Full token stored only in compose/*.env under .allaboard-migration/ — regenerate for Pretorya.",
            };
          }
        }
        envEntry.compose.push({
          composeId: composeRef.composeId,
          name: composeRef.name,
          appName: compose.appName,
          exportFile: rel,
        });
      }

      projectEntry.environments.push(envEntry);
    }

    manifest.projects.push(projectEntry);
  }

  for (const target of POSTGRES_TARGETS) {
    const pg = await dokployGet("postgres.one", { postgresId: target.postgresId });
    manifest.postgres.push({
      ...target,
      appName: pg.appName,
      databaseName: pg.databaseName,
      databaseUser: pg.databaseUser,
      dockerImage: pg.dockerImage,
      pgDumpCommand: `docker exec -t ${pg.appName} pg_dump -U ${pg.databaseUser} -d ${pg.databaseName} -Fc -f /tmp/${target.slug}.dump`,
      pgDumpCopyHint: `docker cp ${pg.appName}:/tmp/${target.slug}.dump ./${target.slug}.dump`,
    });
  }

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(`Phase 0 export written to ${OUT_DIR}`);
  console.log(`Public hosts (Dokploy domains): ${manifest.publicHostsFromDokploy.length}`);
  if (manifest.cloudflareTunnel?.tunnelId) {
    console.log(`Cloudflare tunnel id: ${manifest.cloudflareTunnel.tunnelId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
