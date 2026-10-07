/**
 * Dokploy UI session runner (no secrets in this file).
 * Prerequisite: localStorage.pretoryaPhase2Cfg = base64 JSON from --emit-cfg-b64
 */
(async () => {
  const cfg = JSON.parse(atob(localStorage.getItem("pretoryaPhase2Cfg") || ""));
  if (!cfg?.envs?.length) {
    throw new Error("Missing localStorage.pretoryaPhase2Cfg");
  }
  const post = async (p, b) => {
    const r = await fetch("/api/" + p, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(b ?? {}),
    });
    const t = await r.text();
    let d;
    try {
      d = t ? JSON.parse(t) : null;
    } catch {
      d = t;
    }
    if (!r.ok) throw new Error(p + " " + r.status + " " + String(t).slice(0, 400));
    return d;
  };
  const get = async (p, q) => {
    const qs = new URLSearchParams(q).toString();
    const r = await fetch("/api/" + p + (qs ? "?" + qs : ""), { credentials: "include" });
    const t = await r.text();
    if (!r.ok) throw new Error(p + " " + r.status);
    return t ? JSON.parse(t) : null;
  };
  const findSvc = async (envId, kind, name) => {
    const projects = await get("project.all", {});
    for (const pr of projects) {
      for (const env of pr.environments ?? []) {
        if (env.environmentId !== envId) continue;
        const apps = env.applications ?? env.services?.applications ?? [];
        const pgs = env.postgres ?? env.services?.postgres ?? [];
        if (kind === "postgres") {
          const h = pgs.find((x) => x.name === name) ?? (name === "Postgres" ? pgs[0] : null);
          if (h) return h;
        } else {
          const h = apps.find((x) => x.name === name);
          if (h) return h;
        }
      }
    }
    return null;
  };
  const ensureEnv = async (projectId, envName) => {
    const detail = await get("project.one", { projectId });
    let env = (detail.environments ?? []).find((e) => e.name === envName);
    if (!env) {
      env = await post("environment.create", {
        projectId,
        name: envName,
        description: "MVP " + envName + " Pretorya",
      });
    }
    return env.environmentId ?? env.id;
  };
  const reports = [];
  for (const spec of cfg.envs) {
    const environmentId = await ensureEnv(cfg.projectId, spec.envName);
    let postgres = await findSvc(environmentId, "postgres", "Postgres");
    if (!postgres) {
      const suffix = Math.random().toString(36).slice(2, 8);
      const created = await post("postgres.create", {
        name: "Postgres",
        appName: "allaboard-monorepo-website-postgres-" + spec.envName + "-" + suffix,
        databaseName: spec.pg.databaseName,
        databaseUser: spec.pg.databaseUser,
        databasePassword: spec.pg.databasePassword,
        dockerImage: spec.pg.dockerImage ?? "postgres:18",
        description: "Postgres " + spec.envName,
        environmentId,
        serverId: cfg.serverId,
      });
      await post("postgres.deploy", { postgresId: created.postgresId ?? created.id });
      postgres = await get("postgres.one", { postgresId: created.postgresId ?? created.id });
    } else {
      postgres = await get("postgres.one", { postgresId: postgres.postgresId });
    }
    const pgHost = postgres.appName;
    const pgPass = postgres.databasePassword ?? spec.pg.databasePassword;
    const patchDb = (raw) => {
      const user = spec.pg.databaseUser || "allaboard";
      const db = spec.pg.databaseName || "allaboard";
      const url =
        "DATABASE_URL=postgresql://" +
        user +
        ":" +
        encodeURIComponent(pgPass) +
        "@" +
        pgHost +
        ":5432/" +
        db;
      const lines = raw
        .trim()
        .split("\n")
        .filter((l) => !l.startsWith("MVP_LOGIN_PASSWORD=") && !l.startsWith("DATABASE_URL="));
      lines.push(url);
      return lines.join("\n");
    };
    let apiEnv = patchDb(spec.apiEnv);
    if (!/^JWT_SECRET=.{32,}/m.test(apiEnv)) {
      apiEnv += "\nJWT_SECRET=" + spec.jwtSecret;
    }
    const patchApiUrl = (raw, host) => {
      const lines = raw.trim().split("\n").filter((l) => !l.startsWith("API_URL="));
      lines.push("API_URL=http://" + host + ":4000");
      return lines.join("\n");
    };
    const ensureApp = async (name, dockerfile, env) => {
      let ref = await findSvc(environmentId, "application", name);
      let applicationId = ref?.applicationId;
      if (!applicationId) {
        const c = await post("application.create", {
          name,
          environmentId,
          serverId: cfg.serverId,
        });
        applicationId = c.applicationId ?? c.id;
      }
      await post("application.saveBuildType", {
        applicationId,
        buildType: "dockerfile",
        dockerfile,
        dockerContextPath: ".",
        dockerBuildStage: "",
        herokuVersion: null,
        railpackVersion: null,
      });
      await post("application.saveGithubProvider", {
        applicationId,
        owner: "AllAboard-THP",
        repository: "All-Aboard",
        branch: spec.branch,
        buildPath: "/",
        githubId: cfg.githubId,
        watchPaths: [],
        enableSubmodules: false,
        triggerType: "push",
      });
      await post("application.update", {
        applicationId,
        autoDeploy: true,
        triggerType: "push",
        sourceType: "github",
        owner: "AllAboard-THP",
        repository: "All-Aboard",
        branch: spec.branch,
        buildPath: "/",
        githubId: cfg.githubId,
        enableSubmodules: false,
        buildType: "dockerfile",
        dockerfile,
        dockerContextPath: ".",
      });
      if (env) {
        await post("application.saveEnvironment", {
          applicationId,
          env,
          buildArgs: "",
          buildSecrets: "",
          createEnvFile: true,
        });
      }
      return get("application.one", { applicationId });
    };
    const api = await ensureApp("API", "infra/docker/Dockerfile.api", apiEnv);
    const web = await ensureApp("Web", "infra/docker/Dockerfile.web", patchApiUrl(spec.webEnv, api.appName));
    const domain = async (id, host, port) => {
      const a = await get("application.one", { applicationId: id });
      if ((a.domains ?? []).some((d) => d.host === host)) return;
      await post("domain.create", {
        host,
        port,
        https: false,
        certificateType: "none",
        stripPath: false,
        domainType: "application",
        applicationId: id,
        path: "/",
        internalPath: "/",
      });
    };
    await domain(api.applicationId, spec.apiHost, 4000);
    await domain(web.applicationId, spec.webHost, 3000);
    await post("postgres.deploy", { postgresId: postgres.postgresId });
    for (const [id, title] of [
      [api.applicationId, spec.envName + " API"],
      [web.applicationId, spec.envName + " Web"],
    ]) {
      await post("application.deploy", {
        applicationId: id,
        title: "Pretorya phase2b " + title,
        description: "staging/prod recreate",
      });
    }
    reports.push({
      envName: spec.envName,
      environmentId,
      postgres: { postgresId: postgres.postgresId, appName: pgHost },
      api: { applicationId: api.applicationId, appName: api.appName },
      web: { applicationId: web.applicationId, appName: web.appName },
      domains: [spec.webHost, spec.apiHost],
    });
  }
  return reports;
})();
