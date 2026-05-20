# Graph Report - .  (2026-05-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 214 nodes · 199 edges · 31 communities (25 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7d691e68`
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
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `Deploiement Dokploy — instance All-Aboard (reference)` - 12 edges
2. `Matrice de deploiement - Dokploy / Coolify` - 12 edges
3. `Checklist de suivi d'avancement` - 12 edges
4. `Plan opérationnel — Web, API, données (SSR, env, TanStack Query)` - 11 edges
5. `Proposition stack technique - Monorepo Turborepo (2026)` - 11 edges
6. `Plan d'initialisation Turborepo - MVP All-Aboard` - 11 edges
7. `Choix de stack recommandes (2026)` - 9 edges
8. `Plan d'execution` - 7 edges
9. `MOC - Parcours utilisateur All-Aboard` - 6 edges
10. `Documentation All-Aboard — point d’entrée canonique` - 6 edges

## Surprising Connections (you probably didn't know these)
- `HomePage()` --calls--> `fetchFeed()`  [EXTRACTED]
  app/page.tsx → lib/api-server.ts
- `GET()` --calls--> `getApiBaseUrl()`  [EXTRACTED]
  app/api/feed/route.ts → lib/api-server.ts
- `GET()` --calls--> `parseFeedResponse()`  [EXTRACTED]
  app/api/feed/route.ts → lib/api-server.ts

## Communities (31 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (21): Agent IA et pipeline asynchrone, Architecture monorepo recommandee (complete), Backend et data, Bonnes pratiques de structuration (2026++), Choix de stack recommandes (2026), code:text (all-aboard/), code:json ({), Contexte (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (11): HomePage(), FeedClientPreview(), HomeContent(), Props, GET(), fetchFeed(), FetchFeedResult, getApiBaseUrl() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (18): Architecture minimale, ARCHIVE — Plan d'initialisation Turborepo (MVP All-Aboard), CI MVP, code:text (all-aboard/), Etape A - Initialiser le workspace, Etape B - Configurer Turborepo, Etape C - TypeScript monorepo, Etape D - Creer les apps MVP (+10 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): Checklist de readiness avant deploiement, Configuration Coolify (par service), Configuration Dokploy (par service), Convention globale, Healthchecks recommandes, Instance Dokploy de référence (All-Aboard), Mapping des tags images, Matrice de deploiement - Dokploy / Coolify (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (13): Agent et Indexer (preparation), API (service Fastify), Appel Web vers API (`API_URL` — reseau interne), Branches Git par environnement (etat observe), Build Docker (commun a tous les services Node), code:text (http://<nom-interne-du-service-api>:4000), Deploiement Dokploy — instance All-Aboard (reference), Domaines publics (Traefik / Dokploy) (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): Alignement `.env.example`, Avant PR (garde-fous), Checklist Dokploy (feed / Web–API), Chemins code, Contrat `GET /feed`, Historique (décision tranchée), Journal (smoke / déploiement), Liens (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): Checklist de suivi d'avancement, CI MVP, Etape A - Initialiser le workspace, Etape B - Configurer Turborepo, Etape C - TypeScript monorepo, Etape D - Creer les apps MVP, Etape E - Qualite minimale, Etape F - Preparation deploiement Dokploy/Coolify (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (7): code:mermaid (flowchart TB), Diagramme Mermaid (dataflow), Hypotheses MOC, Lecture rapide des flux, MOC - Dataflow et architecture All-Aboard, Objectif, Perimetre

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (7): Acteurs, code:mermaid (flowchart TD), Diagramme Mermaid, MOC - Parcours utilisateur All-Aboard, Notes de cadrage MOC, Objectif, Parcours utilisateur (version MOC)

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (7): code:text (Docs/tasks/<NN>-<slug-court>/), Convention de nommage, Documentation par tâche (`Docs/tasks/`), Index des dossiers tâche, Liens, Où écrire quoi, Workflow collaborateur

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (6): Documentation All-Aboard — point d’entrée canonique, Hiérarchie des documents, Principes pour limiter le rework, Règles contributeurs, Timeline (phases), État technique du dépôt

### Community 11 - "Community 11"
Cohesion: 0.38
Nodes (4): buildApp(), mockFeed, app, app

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (5): 1. Inventaire `Docs/`, 2. Sujet → source canonique, 3. Règles de maintenance, Liens rapides, Map of content (MoC) — documentation All-Aboard

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): Doc canonique (lecture), Fichiers, Notes de travail, Objectif, Tâche #NN — Titre court

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (4): Doc canonique, Notes de travail, Objectif, Tâche #18 — ADR stratégie d'authentification

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (4): FeedResponse, HelpRequest, Response, User

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (3): Liens, Plan d'initialisation Turborepo — MVP All-Aboard, Structure actuelle (référence)

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (3): __dirname, monorepoRoot, nextConfig

## Knowledge Gaps
- **132 isolated node(s):** `__dirname`, `eslintConfig`, `__dirname`, `monorepoRoot`, `nextConfig` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Plan d'initialisation Turborepo - MVP All-Aboard` connect `Community 2` to `Community 6`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Checklist de suivi d'avancement` connect `Community 6` to `Community 2`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `__dirname`, `eslintConfig`, `__dirname` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._