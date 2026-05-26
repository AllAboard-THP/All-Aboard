# Graph Report - .  (2026-05-20)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 654 nodes · 662 edges · 61 communities (54 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `60af213d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 52|Community 52]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 13 edges
3. `cn()` - 13 edges
4. `Plan opérationnel — Web, API, données (SSR, env, TanStack Query)` - 13 edges
5. `Deploiement Dokploy — instance All-Aboard (reference)` - 12 edges
6. `Matrice de deploiement - Dokploy / Coolify` - 12 edges
7. `Checklist de suivi d'avancement` - 12 edges
8. `Proposition stack technique - Monorepo Turborepo (2026)` - 11 edges
9. `Plan d'initialisation Turborepo - MVP All-Aboard` - 11 edges
10. `scripts` - 9 edges

## Surprising Connections (you probably didn't know these)
- `fastify` --calls--> `buildApp()`  [INFERRED]
  package.json → src/app.ts
- `HomePage()` --calls--> `fetchFeed()`  [EXTRACTED]
  app/page.tsx → lib/api-server.ts
- `clsx` --calls--> `cn()`  [INFERRED]
  ui/package.json → ui/src/lib/utils.ts
- `POST()` --calls--> `getApiBaseUrl()`  [EXTRACTED]
  app/api/auth/login/route.ts → lib/api-server.ts
- `GET()` --calls--> `getApiBaseUrl()`  [EXTRACTED]
  app/api/feed/route.ts → lib/api-server.ts

## Communities (61 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (41): dependencies, class-variance-authority, clsx, radix-ui, @radix-ui/react-slot, tailwind-merge, devDependencies, @allaboard/config-eslint (+33 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (24): fastify, AppDatabase, createDb(), createPool(), helpRequests, buildApp(), BuildAppOptions, createBodySchema (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (33): dependencies, @allaboard/types, @allaboard/ui, next, react, react-dom, @tanstack/react-query, devDependencies (+25 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (31): dependencies, @allaboard/types, drizzle-orm, @fastify/cookie, @fastify/cors, @fastify/jwt, pg, zod (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (30): Architecture minimale, ARCHIVE — Plan d'initialisation Turborepo (MVP All-Aboard), Checklist de suivi d'avancement, CI MVP, CI MVP, code:text (all-aboard/), Etape A - Initialiser le workspace, Etape A - Initialiser le workspace (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (21): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), Default (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (16): HomePage(), HomeContent(), GET(), POST(), fetchFeed(), FetchFeedResult, getApiBaseUrl(), parseFeedResponse() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (22): Alignement `.env.example`, Avant PR (garde-fous), BFF Next (`apps/web` — same-origin), Checklist Dokploy (feed / Web–API), Chemins code, code:json ({ "items": [{ "id": "uuid", "title": "…", "authorId": "bob",), code:bash (# Dev HTTPS (Dokploy)), Codes d’erreur communs (corps JSON) (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): Agent IA et pipeline asynchrone, Architecture monorepo recommandee (complete), Backend et data, Bonnes pratiques de structuration (2026++), Choix de stack recommandes (2026), code:text (all-aboard/), code:json ({), Contexte (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (19): devDependencies, @allaboard/config-eslint, @allaboard/config-typescript, eslint, typescript, exports, import, main (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (19): compilerOptions, composite, declaration, declarationMap, esModuleInterop, isolatedModules, lib, module (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (17): dependencies, eslint-config-next, @eslint/eslintrc, @eslint/js, typescript-eslint, exports, ./base, ./design-system-boundaries (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (16): Checklist de readiness avant deploiement, Configuration Coolify (par service), Configuration Dokploy (par service), Convention globale, Healthchecks recommandes, Instance Dokploy de référence (All-Aboard), Mapping des tags images, Matrice de deploiement - Dokploy / Coolify (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (14): Button(), buttonVariants, AllVariants, Default, Destructive, Disabled, Ghost, Large (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (6): FeedClientPreview(), HelpRequestForm(), Props, MarketingPageShell(), MarketingPageShellProps, mockFetch

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (13): Agent et Indexer (preparation), API (service Fastify), Appel Web vers API (`API_URL` — reseau interne), Branches Git par environnement (etat observe), Build Docker (commun a tous les services Node), code:text (http://<nom-interne-du-service-api>:4000), Deploiement Dokploy — instance All-Aboard (reference), Domaines publics (Traefik / Dokploy) (+5 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (12): 1. Postgres (env dev), 2. Variables service **API** (dev), 3. Variables service **Web** (dev), 4. Smoke automatisé, 5. Smoke navigateur, 6. Journal et pilotage, code:text (postgresql://<USER>:<PASSWORD>@<HOST_INTERNE>:5432/<DATABASE), code:bash (MVP_LOGIN_PASSWORD='<secret-dokploy>' pnpm smoke:dev) (+4 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, noEmit, paths, plugins, exclude (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.20
Nodes (9): Concepts et architecture (Getting Started + Concepts), Démarrage rapide (Quick Start), Index — documentation Intuition, Notes pour le monorepo All-Aboard, Outils développeur (SDK, GraphQL, contrats, protocole), Racine et méta, Ressources et optionnel, Réseau et infrastructure (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (9): compilerOptions, composite, declaration, declarationMap, outDir, rootDir, exclude, extends (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (8): compilerOptions, incremental, jsx, lib, noEmit, plugins, extends, $schema

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (8): exports, ./base.json, ./next.json, ./node.json, files, name, private, version

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (7): ADR 0001 — Authentification MVP (Phase 2), Alternatives non retenues, Conséquences, Contexte, Décision, Liens, Statut

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (7): ADR 0002 — Design system monorepo (`packages/ui` + `apps/storybook`), Alternatives non retenues, Conséquences, Contexte, Décision, Liens, Statut

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): code:mermaid (flowchart TB), Diagramme Mermaid (dataflow), Hypotheses MOC, Lecture rapide des flux, MOC - Dataflow et architecture All-Aboard, Objectif, Perimetre

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (7): Acteurs, code:mermaid (flowchart TD), Diagramme Mermaid, MOC - Parcours utilisateur All-Aboard, Notes de cadrage MOC, Objectif, Parcours utilisateur (version MOC)

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (7): code:text (Docs/tasks/<NN>-<slug-court>/), Convention de nommage, Documentation par tâche (`Docs/tasks/`), Index des dossiers tâche, Liens, Où écrire quoi, Workflow collaborateur

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (7): compilerOptions, module, moduleResolution, noEmit, types, extends, $schema

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (7): compilerOptions, jsx, lib, noEmit, exclude, extends, include

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (6): Doc canonique, Done (#24 closable), Hors scope #24, Objectif, Skills agents (`.agents/skills/`), Tâche #24 — Design system monorepo (`packages/ui` + Storybook)

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (6): Documentation All-Aboard — point d'entrée canonique, Hiérarchie des documents, Principes pour limiter le rework, Règles contributeurs, Timeline (phases), État technique du dépôt

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (6): CreateHelpRequestBody, CreateHelpRequestResponse, FeedResponse, HelpRequest, Response, User

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (6): extends, $schema, tasks, typecheck, dependsOn, outputs

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (5): 1. Inventaire `Docs/`, 2. Sujet → source canonique, 3. Règles de maintenance, Liens rapides, Map of content (MoC) — documentation All-Aboard

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (5): Doc canonique (lecture), Fichiers, Notes de travail, Objectif, Tâche #NN — Titre court

### Community 38 - "Community 38"
Cohesion: 0.40
Nodes (4): Doc canonique, Notes de travail, Objectif, Tâche #18 — ADR stratégie d'authentification

### Community 40 - "Community 40"
Cohesion: 0.50
Nodes (3): Liens, Plan d'initialisation Turborepo — MVP All-Aboard, Structure actuelle (référence)

### Community 41 - "Community 41"
Cohesion: 0.50
Nodes (3): dialect, entries, version

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (3): storybookNoProductAppImports, uiNoAppImports, webNoStorybookImports

### Community 43 - "Community 43"
Cohesion: 0.50
Nodes (3): __dirname, monorepoRoot, nextConfig

## Knowledge Gaps
- **452 isolated node(s):** `__dirname`, `eslintConfig`, `__dirname`, `monorepoRoot`, `nextConfig` (+447 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 5` to `Community 0`, `Community 13`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `cn()` (e.g. with `clsx` and `Button()`) actually correct?**
  _`cn()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `__dirname`, `eslintConfig`, `__dirname` to the rest of the system?**
  _452 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0855614973262032 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._