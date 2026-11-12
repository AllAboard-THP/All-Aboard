#!/usr/bin/env node
/**
 * Builds a browser Runtime.evaluate payload for Phase 2a (session cookie auth).
 * Reads `.allaboard-migration/phase2/cfg.json` (gitignored).
 * Output: `.allaboard-migration/phase2/cdp-apply-dev.json` (gitignored).
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const CFG_PATH = path.join(REPO_ROOT, ".allaboard-migration", "phase2", "cfg.json");
const OUT_PATH = path.join(REPO_ROOT, ".allaboard-migration", "phase2", "cdp-apply-dev.json");

const RUNNER = String.raw`
async () => {
  const cfg = JSON.parse(atob('__B64__'));
  const post = async (procedure, body) => {
    const res = await fetch('/api/' + procedure, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) throw new Error(procedure + ' HTTP ' + res.status + ': ' + text.slice(0, 400));
    return data;
  };

  const patchDbUrl = (env, host, password) =>
    env
      .trim()
      .split('\n')
      .map((line) =>
        line.startsWith('DATABASE_URL=')
          ? 'DATABASE_URL=postgresql://' + cfg.pgUser + ':' + encodeURIComponent(password) + '@' + host + ':5432/' + cfg.pgDb
          : line,
      )
      .join('\n');

  const patchApiUrl = (env, apiHost) =>
    env
      .trim()
      .split('\n')
      .map((line) =>
        line.startsWith('API_URL=') ? 'API_URL=http://' + apiHost + ':4000' : line,
      )
      .join('\n');

  const findInProjectAll = async (envId, kind, name) => {
    const projects = await fetch('/api/project.all', { credentials: 'include' }).then((r) => r.json());
    for (const project of projects) {
      for (const env of project.environments ?? []) {
        if (env.environmentId !== envId) continue;
        const services = env.services ?? {};
        if (kind === 'postgres') {
          const hit = (services.postgres ?? []).find((p) => p.name === name);
          if (hit) return hit;
        } else {
          const hit = (services.applications ?? []).find((a) => a.name === name);
          if (hit) return hit;
        }
      }
    }
    return null;
  };

  const suffix = Math.random().toString(36).slice(2, 8);
  let postgres = await findInProjectAll(cfg.environmentId, 'postgres', 'Postgres');
  if (!postgres) {
    const created = await post('postgres.create', {
      name: 'Postgres',
      appName: 'allaboard-monorepo-website-postgres-dev-' + suffix,
      databaseName: cfg.pgDb,
      databaseUser: cfg.pgUser,
      databasePassword: cfg.pgPassword,
      dockerImage: 'postgres:18',
      description: 'Postgres principal AllAboard dev (Pretorya)',
      environmentId: cfg.environmentId,
      serverId: cfg.serverId,
    });
    await post('postgres.deploy', { postgresId: created.postgresId ?? created.id });
    postgres = await post('postgres.one', { postgresId: created.postgresId ?? created.id });
  } else {
    postgres = await post('postgres.one', { postgresId: postgres.postgresId });
  }

  const pgHost = postgres.appName;
  const apiEnv = patchDbUrl(cfg.apiEnv, pgHost, cfg.pgPassword);

  const ensureApp = async (name, dockerfile, env) => {
    let ref = await findInProjectAll(cfg.environmentId, 'application', name);
    let applicationId = ref?.applicationId;
    if (!applicationId) {
      const created = await post('application.create', {
        name,
        environmentId: cfg.environmentId,
        serverId: cfg.serverId,
      });
      applicationId = created.applicationId ?? created.id;
    }
    await post('application.saveBuildType', {
      applicationId,
      buildType: 'dockerfile',
      dockerfile,
      dockerContextPath: '.',
      dockerBuildStage: '',
    });
    await post('application.saveGithubProvider', {
      applicationId,
      owner: 'AllAboard-THP',
      repository: 'All-Aboard',
      branch: 'Dev',
      buildPath: '/',
      githubId: cfg.githubId,
      watchPaths: [],
      enableSubmodules: false,
      triggerType: 'push',
    });
    await post('application.update', {
      applicationId,
      autoDeploy: true,
      triggerType: 'push',
      sourceType: 'github',
      owner: 'AllAboard-THP',
      repository: 'All-Aboard',
      branch: 'Dev',
      buildPath: '/',
      githubId: cfg.githubId,
      enableSubmodules: false,
      buildType: 'dockerfile',
      dockerfile,
      dockerContextPath: '.',
    });
    if (env) {
      await post('application.saveEnvironment', { applicationId, env });
    }
    return post('application.one', { applicationId });
  };

  const api = await ensureApp('API', 'infra/docker/Dockerfile.api', apiEnv);
  const webEnv = patchApiUrl(cfg.webEnv, api.appName);
  const sbEnv = patchApiUrl(cfg.sbEnv, api.appName);
  const web = await ensureApp('Web', 'infra/docker/Dockerfile.web', webEnv);
  const storybook = await ensureApp('Storybook', 'infra/docker/Dockerfile.storybook', sbEnv);

  const ensureDomain = async (applicationId, host, port) => {
    const app = await post('application.one', { applicationId });
    if ((app.domains ?? []).some((d) => d.host === host)) return;
    await post('domain.create', {
      host,
      port,
      https: false,
      certificateType: 'none',
      stripPath: false,
      domainType: 'application',
      applicationId,
      path: '/',
      internalPath: '/',
    });
  };

  await ensureDomain(api.applicationId, 'api-dev.allaboard.fr', 4000);
  await ensureDomain(web.applicationId, 'dev.allaboard.fr', 3000);
  await ensureDomain(storybook.applicationId, 'storybook.allaboard.fr', 8080);

  await post('application.deploy', {
    applicationId: api.applicationId,
    title: 'Pretorya phase2 API',
    description: 'Initial dev deploy',
  });
  await post('application.deploy', {
    applicationId: web.applicationId,
    title: 'Pretorya phase2 Web',
    description: 'Initial dev deploy',
  });
  await post('application.deploy', {
    applicationId: storybook.applicationId,
    title: 'Pretorya phase2 Storybook',
    description: 'Initial dev deploy',
  });

  return {
    postgresId: postgres.postgresId,
    postgresAppName: pgHost,
    api: { id: api.applicationId, appName: api.appName },
    web: { id: web.applicationId, appName: web.appName },
    storybook: { id: storybook.applicationId, appName: storybook.appName },
  };
}
`;

async function main() {
  await access(CFG_PATH);
  const cfgRaw = await readFile(CFG_PATH, "utf8");
  const b64 = Buffer.from(cfgRaw, "utf8").toString("base64");
  const expression = `(${RUNNER.replace("__B64__", b64)})()`;
  await mkdir(path.dirname(OUT_PATH), { recursive: true });
  await writeFile(
    OUT_PATH,
    `${JSON.stringify({ expression }, null, 2)}\n`,
    "utf8",
  );
  console.log(OUT_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
