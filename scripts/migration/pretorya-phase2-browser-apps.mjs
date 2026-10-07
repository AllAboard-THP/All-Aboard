#!/usr/bin/env node
/**
 * Builds CDP expression to create API/Web/Storybook on Pretorya dev (Postgres must exist).
 */

import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PHASE0 = path.join(REPO_ROOT, ".allaboard-migration", "phase0");
const OUT = path.join(REPO_ROOT, ".allaboard-migration", "phase2", "apps-expr.txt");

async function main() {
  const pgHost = process.argv[2];
  if (!pgHost) {
    console.error("Usage: node pretorya-phase2-browser-apps.mjs <postgres-appName>");
    process.exit(1);
  }

  const pg = JSON.parse(
    await readFile(
      path.join(PHASE0, "postgres/AllAboard_monorepo_website-dev-Postgres.json"),
      "utf8",
    ),
  );
  const apiEnvRaw = await readFile(
    path.join(PHASE0, "applications/AllAboard_monorepo_website-dev-API.env"),
    "utf8",
  );
  const webEnvRaw = await readFile(
    path.join(PHASE0, "applications/AllAboard_monorepo_website-dev-Web.env"),
    "utf8",
  );
  const sbEnvRaw = await readFile(
    path.join(PHASE0, "applications/AllAboard_monorepo_website-dev-Storybook.env"),
    "utf8",
  );

  const patchDbUrl = (env, host, password, user, db) =>
    env
      .trim()
      .split("\n")
      .map((line) =>
        line.startsWith("DATABASE_URL=")
          ? `DATABASE_URL=postgresql://${user}:${encodeURIComponent(password)}@${host}:5432/${db}`
          : line,
      )
      .join("\n");

  const patchApiUrl = (env, apiHost) =>
    env
      .trim()
      .split("\n")
      .map((line) =>
        line.startsWith("API_URL=") ? `API_URL=http://${apiHost}:4000` : line,
      )
      .join("\n");

  const apiEnv = patchDbUrl(
    apiEnvRaw,
    pgHost,
    pg.databasePassword,
    pg.databaseUser,
    pg.databaseName,
  );

  const cfg = {
    environmentId: "V6_0e4BJOA5OedATSJcui",
    serverId: "a6V3M0XJp4JwbaFijdpAk",
    githubId: "pORhOY3dPkdpHN5ihdTuM",
    apiEnv,
    webEnv: webEnvRaw,
    sbEnv: sbEnvRaw,
  };

  const b64 = Buffer.from(JSON.stringify(cfg), "utf8").toString("base64");

  const expr = `(async()=>{const cfg=JSON.parse(atob('${b64}'));const post=async(p,b)=>{const r=await fetch('/api/'+p,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const t=await r.text();if(!r.ok)throw new Error(p+' '+r.status+' '+t.slice(0,400));return t?JSON.parse(t):null;};const find=async(name)=>{const projects=await fetch('/api/project.all',{credentials:'include'}).then(r=>r.json());for(const pr of projects){for(const env of pr.environments??[]){if(env.environmentId!==cfg.environmentId)continue;const hit=(env.services?.applications??[]).find(a=>a.name===name);if(hit)return hit.applicationId;}}return null;};const ensureApp=async(name,dockerfile,env)=>{let applicationId=await find(name);if(!applicationId){const c=await post('application.create',{name,environmentId:cfg.environmentId,serverId:cfg.serverId});applicationId=c.applicationId;}await post('application.saveBuildType',{applicationId,buildType:'dockerfile',dockerfile,dockerContextPath:'.',dockerBuildStage:''});await post('application.saveGithubProvider',{applicationId,owner:'AllAboard-THP',repository:'All-Aboard',branch:'Dev',buildPath:'/',githubId:cfg.githubId,watchPaths:[],enableSubmodules:false,triggerType:'push'});await post('application.update',{applicationId,autoDeploy:true,triggerType:'push',sourceType:'github',owner:'AllAboard-THP',repository:'All-Aboard',branch:'Dev',buildPath:'/',githubId:cfg.githubId,enableSubmodules:false,buildType:'dockerfile',dockerfile,dockerContextPath:'.'});if(env)await post('application.saveEnvironment',{applicationId,env});return post('application.one',{applicationId});};const patchApi=(e,host)=>e.split('\\n').map(l=>l.startsWith('API_URL=')?'API_URL=http://'+host+':4000':l).join('\\n');const api=await ensureApp('API','infra/docker/Dockerfile.api',cfg.apiEnv);const web=await ensureApp('Web','infra/docker/Dockerfile.web',patchApi(cfg.webEnv,api.appName));const storybook=await ensureApp('Storybook','infra/docker/Dockerfile.storybook',patchApi(cfg.sbEnv,api.appName));const domain=async(id,host,port)=>{const a=await post('application.one',{applicationId:id});if((a.domains??[]).some(d=>d.host===host))return;await post('domain.create',{host,port,https:false,certificateType:'none',stripPath:false,domainType:'application',applicationId:id,path:'/',internalPath:'/'});};await domain(api.applicationId,'api-dev.allaboard.fr',4000);await domain(web.applicationId,'dev.allaboard.fr',3000);await domain(storybook.applicationId,'storybook.allaboard.fr',8080);for(const [id,title] of [[api.applicationId,'API'],[web.applicationId,'Web'],[storybook.applicationId,'Storybook']]){await post('application.deploy',{applicationId:id,title:'Pretorya phase2 '+title,description:'Initial dev deploy'});}return{api:{id:api.applicationId,appName:api.appName},web:{id:web.applicationId,appName:web.appName},storybook:{id:storybook.applicationId,appName:storybook.appName}};})()`;

  await writeFile(OUT, expr, "utf8");
  console.log(OUT, expr.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
