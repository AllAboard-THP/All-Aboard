#!/usr/bin/env node
/**
 * Phase 2b — recreate MVP staging + production on Pretorya (Postgres, API, Web).
 *
 * Credentials: `.allaboard-migration/phase1/dokploy-api.env` or env DOKPLOY_*.
 * Phase 0 exports: `.allaboard-migration/phase0/` (gitignored).
 *
 * Usage:
 *   node scripts/migration/pretorya-phase2-recreate-staging-prod.mjs
 *   node scripts/migration/pretorya-phase2-recreate-staging-prod.mjs --emit-browser
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
const GITHUB_OWNER = "AllAboard-THP";
const GITHUB_REPO = "All-Aboard";

/** @type {Array<{ envName: string; branch: string; prefix: string; webHost: string; apiHost: string }>} */
const TARGET_ENVS = [
  {
    envName: "staging",
    branch: "staging",
    prefix: "AllAboard_monorepo_website-staging",
    webHost: "staging.allaboard.fr",
    apiHost: "api-staging.allaboard.fr",
  },
  {
    envName: "production",
    branch: "main",
    prefix: "AllAboard_monorepo_website-production",
    webHost: "allaboard.fr",
    apiHost: "api.allaboard.fr",
  },
];

async function readText(filePath) {
  return readFile(filePath, "utf8");
}

async function readEnvFile(relPath) {
  const full = path.join(PHASE0_DIR, relPath);
  await access(full);
  return readText(full);
}

function patchDatabaseUrl(envBlock, postgresAppName, password, user = "allaboard", db = "allaboard") {
  const lines = envBlock.trim().split("\n");
  const out = [];
  let replaced = false;
  for (const line of lines) {
    if (line.startsWith("DATABASE_URL=")) {
      out.push(
        `DATABASE_URL=postgresql://${user}:${encodeURIComponent(password)}@${postgresAppName}:5432/${db}`,
      );
      replaced = true;
    } else if (line.startsWith("MVP_LOGIN_PASSWORD=")) {
      continue;
    } else {
      out.push(line);
    }
  }
  if (!replaced) {
    out.push(
      `DATABASE_URL=postgresql://${user}:${encodeURIComponent(password)}@${postgresAppName}:5432/${db}`,
    );
  }
  return out.join("\n");
}

function patchApiUrl(envBlock, apiAppName) {
  const lines = envBlock.trim().split("\n");
  const out = [];
  let replaced = false;
  for (const line of lines) {
    if (line.startsWith("API_URL=")) {
      out.push(`API_URL=http://${apiAppName}:4000`);
      replaced = true;
    } else {
      out.push(line);
    }
  }
  if (!replaced) {
    out.push(`API_URL=http://${apiAppName}:4000`);
  }
  return out.join("\n");
}

function ensureJwtSecret(envBlock) {
  if (envBlock.split("\n").some((l) => l.startsWith("JWT_SECRET=") && l.length > "JWT_SECRET=".length + 31)) {
    return { env: envBlock, generatedJwt: false };
  }
  const secret = randomBytes(32).toString("base64url");
  const lines = envBlock.trim().split("\n").filter((l) => !l.startsWith("JWT_SECRET="));
  lines.push(`JWT_SECRET=${secret}`);
  return { env: lines.join("\n"), generatedJwt: true };
}

async function findService(environmentId, kind, name) {
  const projects = await dokployRequest("project.all");
  for (const project of projects) {
    for (const env of project.environments ?? []) {
      if (env.environmentId !== environmentId) continue;
      const applications = env.applications ?? env.services?.applications ?? [];
      const postgresList = env.postgres ?? env.services?.postgres ?? [];
      if (kind === "postgres") {
        const hit =
          postgresList.find((p) => p.name === name) ??
          (name === "Postgres" ? postgresList[0] : undefined);
        if (hit) return hit;
      } else {
        const hit = applications.find((a) => a.name === name);
        if (hit) return hit;
      }
    }
  }
  return null;
}

async function ensureProject() {
  const projects = await dokployRequest("project.all");
  let project = projects.find((p) => p.name === PROJECT_NAME);
  if (!project) {
    project = await dokployRequest("project.create", {}, {
      name: PROJECT_NAME,
      description: "MVP Pretorya migration",
    });
  }
  return project.projectId ?? project.id;
}

async function ensureEnvironment(projectId, envName) {
  const detail = await dokployRequest("project.one", { projectId });
  const environments = detail.environments ?? [];
  let env = environments.find((e) => e.name === envName);
  if (!env) {
    console.log(`Creating environment "${envName}"…`);
    env = await dokployRequest("environment.create", {}, {
      projectId,
      name: envName,
      description: `MVP ${envName} Pretorya`,
    });
  }
  return env.environmentId ?? env.id;
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

async function ensurePostgres(environmentId, serverId, pgExport, envName) {
  const existing = await findService(environmentId, "postgres", "Postgres");
  if (existing?.postgresId) {
    return dokployRequest("postgres.one", { postgresId: existing.postgresId });
  }

  const suffix = randomBytes(3).toString("hex");
  const appName = `allaboard-monorepo-website-postgres-${envName}-${suffix}`;
  console.log(`Creating Postgres (${envName})…`);
  const created = await dokployRequest("postgres.create", {}, {
    name: "Postgres",
    appName,
    databaseName: pgExport.databaseName ?? "allaboard",
    databaseUser: pgExport.databaseUser ?? "allaboard",
    databasePassword: pgExport.databasePassword,
    dockerImage: pgExport.dockerImage ?? "postgres:18",
    description: `Postgres AllAboard ${envName} (Pretorya)`,
    environmentId,
    serverId,
  });
  const postgresId = created.postgresId ?? created.id;
  await dokployRequest("postgres.deploy", {}, { postgresId });
  return dokployRequest("postgres.one", { postgresId });
}

async function ensureApplication({
  environmentId,
  serverId,
  githubId,
  branch,
  name,
  dockerfile,
  envPayload,
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
    branch,
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
    branch,
    buildPath: "/",
    githubId,
    enableSubmodules: false,
    buildType: "dockerfile",
    dockerfile,
    dockerContextPath: ".",
  });

  if (envPayload) {
    await dokployRequest("application.saveEnvironment", {}, {
      applicationId,
      env: envPayload,
      buildArgs: "",
      buildSecrets: "",
      createEnvFile: true,
    });
  }

  return dokployRequest("application.one", { applicationId });
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
    description: "Pretorya phase2b staging/prod recreate",
  });
}

async function recreateEnv(projectId, serverId, githubId, spec) {
  const pgFile =
    spec.envName === "staging"
      ? "AllAboard_monorepo_website-staging-Postgres.json"
      : "AllAboard_monorepo_website-production-Postgres.json";
  const pgExport = JSON.parse(await readText(path.join(PHASE0_DIR, "postgres", pgFile)));

  const apiEnvRaw = await readEnvFile(`applications/${spec.prefix}-API.env`);
  const webEnvRaw = await readEnvFile(`applications/${spec.prefix}-Web.env`);

  const environmentId = await ensureEnvironment(projectId, spec.envName);

  const postgres = await ensurePostgres(environmentId, serverId, pgExport, spec.envName);
  const postgresAppName = postgres.appName;
  const pgPassword = postgres.databasePassword ?? pgExport.databasePassword;

  let apiEnv = patchDatabaseUrl(apiEnvRaw, postgresAppName, pgPassword);
  const jwtPatch = ensureJwtSecret(apiEnv);
  apiEnv = jwtPatch.env;

  const api = await ensureApplication({
    environmentId,
    serverId,
    githubId,
    branch: spec.branch,
    name: "API",
    dockerfile: "infra/docker/Dockerfile.api",
    envPayload: apiEnv,
  });

  const webEnv = patchApiUrl(webEnvRaw, api.appName);
  const web = await ensureApplication({
    environmentId,
    serverId,
    githubId,
    branch: spec.branch,
    name: "Web",
    dockerfile: "infra/docker/Dockerfile.web",
    envPayload: webEnv,
  });

  await ensureDomain(api.applicationId, spec.apiHost, 4000);
  await ensureDomain(web.applicationId, spec.webHost, 3000);

  await dokployRequest("postgres.deploy", {}, { postgresId: postgres.postgresId });
  await deployApplication(api.applicationId, `${spec.envName} API`);
  await deployApplication(web.applicationId, `${spec.envName} Web`);

  return {
    envName: spec.envName,
    environmentId,
    branch: spec.branch,
    domains: [spec.webHost, spec.apiHost],
    generatedJwtSecret: jwtPatch.generatedJwt,
    postgres: { postgresId: postgres.postgresId, appName: postgresAppName },
    api: { applicationId: api.applicationId, appName: api.appName },
    web: { applicationId: web.applicationId, appName: web.appName },
  };
}

function buildBrowserRunner(cfg) {
  const b64 = Buffer.from(JSON.stringify(cfg), "utf8").toString("base64");
  return `(async()=>{const cfg=JSON.parse(atob('${b64}'));const post=async(p,b)=>{const r=await fetch('/api/'+p,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(b??{})});const t=await r.text();let d;try{d=t?JSON.parse(t):null;}catch{d=t;}if(!r.ok)throw new Error(p+' '+r.status+' '+String(t).slice(0,400));return d;};const get=async(p,q)=>{const qs=new URLSearchParams(q).toString();const r=await fetch('/api/'+p+(qs?'?'+qs:''),{credentials:'include'});const t=await r.text();if(!r.ok)throw new Error(p+' '+r.status);return t?JSON.parse(t):null;};const findSvc=async(envId,kind,name)=>{const projects=await get('project.all',{});for(const pr of projects){for(const env of pr.environments??[]){if(env.environmentId!==envId)continue;const apps=env.applications??env.services?.applications??[];const pgs=env.postgres??env.services?.postgres??[];if(kind==='postgres'){const h=pgs.find(x=>x.name===name)??(name==='Postgres'?pgs[0]:null);if(h)return h;}else{const h=apps.find(x=>x.name===name);if(h)return h;}}}return null;};const ensureEnv=async(projectId,envName)=>{const detail=await get('project.one',{projectId});let env=(detail.environments??[]).find(e=>e.name===envName);if(!env){env=await post('environment.create',{projectId,name:envName,description:'MVP '+envName+' Pretorya'});}return env.environmentId??env.id;};const reports=[];for(const spec of cfg.envs){const environmentId=await ensureEnv(cfg.projectId,spec.envName);let postgres=await findSvc(environmentId,'postgres','Postgres');if(!postgres){const suffix=Math.random().toString(36).slice(2,8);const created=await post('postgres.create',{name:'Postgres',appName:'allaboard-monorepo-website-postgres-'+spec.envName+'-'+suffix,databaseName:spec.pg.databaseName,databaseUser:spec.pg.databaseUser,databasePassword:spec.pg.databasePassword,dockerImage:spec.pg.dockerImage??'postgres:18',description:'Postgres '+spec.envName,environmentId,serverId:cfg.serverId});await post('postgres.deploy',{postgresId:created.postgresId??created.id});postgres=await get('postgres.one',{postgresId:created.postgresId??created.id});}else{postgres=await get('postgres.one',{postgresId:postgres.postgresId});}const pgHost=postgres.appName;const pgPass=postgres.databasePassword??spec.pg.databasePassword;const patchDb=(raw)=>{const user=spec.pg.databaseUser||'allaboard';const db=spec.pg.databaseName||'allaboard';const url='DATABASE_URL=postgresql://'+user+':'+encodeURIComponent(pgPass)+'@'+pgHost+':5432/'+db;const lines=raw.trim().split('\\n').filter(l=>!l.startsWith('MVP_LOGIN_PASSWORD=')&&!l.startsWith('DATABASE_URL='));lines.push(url);return lines.join('\\n');};let apiEnv=patchDb(spec.apiEnv);if(!/^JWT_SECRET=.{32,}/m.test(apiEnv)){apiEnv+='\\nJWT_SECRET='+spec.jwtSecret;}const patchApiUrl=(raw,host)=>{const lines=raw.trim().split('\\n').filter(l=>!l.startsWith('API_URL='));lines.push('API_URL=http://'+host+':4000');return lines.join('\\n');};const ensureApp=async(name,dockerfile,env)=>{let ref=await findSvc(environmentId,'application',name);let applicationId=ref?.applicationId;if(!applicationId){const c=await post('application.create',{name,environmentId,serverId:cfg.serverId});applicationId=c.applicationId??c.id;}await post('application.saveBuildType',{applicationId,buildType:'dockerfile',dockerfile,dockerContextPath:'.',dockerBuildStage:''});await post('application.saveGithubProvider',{applicationId,owner:'AllAboard-THP',repository:'All-Aboard',branch:spec.branch,buildPath:'/',githubId:cfg.githubId,watchPaths:[],enableSubmodules:false,triggerType:'push'});await post('application.update',{applicationId,autoDeploy:true,triggerType:'push',sourceType:'github',owner:'AllAboard-THP',repository:'All-Aboard',branch:spec.branch,buildPath:'/',githubId:cfg.githubId,enableSubmodules:false,buildType:'dockerfile',dockerfile,dockerContextPath:'.'});if(env)await post('application.saveEnvironment',{applicationId,env,createEnvFile:true});return get('application.one',{applicationId});};const api=await ensureApp('API','infra/docker/Dockerfile.api',apiEnv);const web=await ensureApp('Web','infra/docker/Dockerfile.web',patchApiUrl(spec.webEnv,api.appName));const domain=async(id,host,port)=>{const a=await get('application.one',{applicationId:id});if((a.domains??[]).some(d=>d.host===host))return;await post('domain.create',{host,port,https:false,certificateType:'none',stripPath:false,domainType:'application',applicationId:id,path:'/',internalPath:'/'});};await domain(api.applicationId,spec.apiHost,4000);await domain(web.applicationId,spec.webHost,3000);await post('postgres.deploy',{postgresId:postgres.postgresId});for(const [id,title] of [[api.applicationId,spec.envName+' API'],[web.applicationId,spec.envName+' Web']]){await post('application.deploy',{applicationId:id,title:'Pretorya phase2b '+title,description:'staging/prod recreate'});}reports.push({envName:spec.envName,environmentId,postgres:{postgresId:postgres.postgresId,appName:pgHost},api:{applicationId:api.applicationId,appName:api.appName},web:{applicationId:web.applicationId,appName:web.appName},domains:[spec.webHost,spec.apiHost]});}return reports;})()`;
}

function filterTargetEnvs() {
  const onlyIdx = process.argv.indexOf("--only");
  if (onlyIdx === -1) return TARGET_ENVS;
  const name = process.argv[onlyIdx + 1];
  const hit = TARGET_ENVS.filter((e) => e.envName === name);
  if (!hit.length) {
    throw new Error(`Unknown --only ${name} (expected staging or production)`);
  }
  return hit;
}

async function loadBrowserConfig() {
  const projectId = "-pOukeEDD3Tx807D0WDLO";
  const serverId = "a6V3M0XJp4JwbaFijdpAk";
  const githubId = "pORhOY3dPkdpHN5ihdTuM";

  /** @type {typeof TARGET_ENVS[number] & { apiEnv: string; webEnv: string; pg: object; jwtSecret: string }[]} */
  const envs = [];
  for (const spec of filterTargetEnvs()) {
    const pgPath =
      spec.envName === "staging"
        ? "AllAboard_monorepo_website-staging-Postgres.json"
        : "AllAboard_monorepo_website-production-Postgres.json";
    const pg = JSON.parse(await readText(path.join(PHASE0_DIR, "postgres", pgPath)));
    const apiEnv = await readEnvFile(`applications/${spec.prefix}-API.env`);
    const webEnv = await readEnvFile(`applications/${spec.prefix}-Web.env`);
    envs.push({
      ...spec,
      apiEnv,
      webEnv,
      pg: {
        databaseName: pg.databaseName,
        databaseUser: pg.databaseUser,
        databasePassword: pg.databasePassword,
        dockerImage: pg.dockerImage,
      },
      jwtSecret: randomBytes(32).toString("base64url"),
    });
  }
  return { projectId, serverId, githubId, envs };
}

async function main() {
  const emitBrowser = process.argv.includes("--emit-browser");

  if (process.argv.includes("--emit-cfg-b64")) {
    const cfg = await loadBrowserConfig();
    process.stdout.write(Buffer.from(JSON.stringify(cfg), "utf8").toString("base64"));
    return;
  }

  if (emitBrowser) {
    const cfg = await loadBrowserConfig();
    const expr = buildBrowserRunner(cfg);
    const outPath = path.join(OUT_DIR, "staging-prod-browser-expr.txt");
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(outPath, expr, "utf8");
    console.log(outPath);
    console.log(expr);
    return;
  }

  const loaded = await loadPhase1Env();
  if (!loaded && !process.env.DOKPLOY_API_KEY) {
    console.error(`Missing ${PHASE1_ENV_PATH} or DOKPLOY_API_KEY`);
    console.error("Tip: regenerate API key in Dokploy Profile, or run with --emit-browser + logged-in app.dokploy.com session.");
    process.exit(1);
  }

  const projectId = await ensureProject();
  const serverId = await resolveDeployServerId();
  const githubId = await resolveGithubId();

  const reports = [];
  for (const spec of filterTargetEnvs()) {
    console.log(`\n=== ${spec.envName} ===`);
    reports.push(await recreateEnv(projectId, serverId, githubId, spec));
  }

  const report = {
    recreatedAt: new Date().toISOString(),
    projectId,
    serverId,
    githubId,
    environments: reports,
  };

  await mkdir(OUT_DIR, { recursive: true });
  const reportPath = path.join(OUT_DIR, "staging-prod-recreate-report.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Report: ${reportPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
