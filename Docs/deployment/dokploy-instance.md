# Deploiement Dokploy — instance All-Aboard (reference)

Ce document decrit la configuration **effective** du projet All-Aboard sur Dokploy, telle qu’observable via l’API Dokploy (MCP `user-dokploy-allaboard-mcp`). Il complete la [matrice theorique](matrice-deploiement-dokploy-coolify.md) (conventions, **tables de variables par type** — ne pas les recopier ici).

**Timeline produit / stack applicative** (ordre des phases, TanStack, auth) : [README documentation — canonique](README.md).

**Mise a jour** : 2026-06-03 (#69 — CI build Agent + doc retrait Indexer legacy ; `apps/agent` scaffold merge #66). 2026-05-29 (staging : MVP Phase 2 + auth ADR 0003 — `DEV_SEED_PASSWORD`, pas de `MVP_LOGIN_PASSWORD` ; smoke complet 2026-05-29). **2026-05-20** : domaines `allaboard.fr` + API dediees ; Agent/Indexer **desactives** ; post-merge PR #9 Phase 1 — smoke feed OK. Detail smoke : [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) (journal) ; runbooks : [dev Phase 2](runbook-dokploy-dev-phase2.md), [staging Phase 2](runbook-dokploy-staging-phase2.md).

**Secrets** : mots de passe base de donnees, cles API et tokens GitHub se configurent **uniquement** dans Dokploy. Ne jamais les commiter dans ce depot.

---

## Projet et environnements

| Element | Valeur |
|--------|--------|
| Projet Dokploy | `AllAboard monorepo website` |
| Depots Git | `AllAboard-THP/All-Aboard` (integration GitHub App Dokploy) |
| Environnements | `production`, `staging`, `dev` |

Chaque environnement contient typiquement :

- quatre **ressources application** : Web, API, Agent, Indexer (Agent **pret au build** depuis #66 — toujours **desactive** en instance jusqu’a validation ops ; Indexer = **placeholder legacy** — ne pas reactiver, voir section Agent et Indexer) ;
- une base **Postgres** managée par Dokploy.

---

## Build Docker (commun a tous les services Node)

| Parametre | Valeur |
|-----------|--------|
| `buildType` | `dockerfile` |
| `buildPath` | `/` (racine du monorepo) |
| `dockerContextPath` | `.` |
| Sous-modules Git | desactives (`enableSubmodules: false`) |
| Declenchement | **Web + API** : `push` sur la branche configuree, `autoDeploy: true`. **Agent** : `autoDeploy: false` — deploiement manuel apres validation CI (#69). **Indexer (legacy)** : `autoDeploy: false` — **ne pas reactiver**. |

Dockerfiles utilises (chemins relatifs a la racine du repo) :

| Application | Dockerfile | Notes |
|-------------|------------|-------|
| Web | `infra/docker/Dockerfile.web` | — |
| API | `infra/docker/Dockerfile.api` | — |
| Agent | `infra/docker/Dockerfile.agent` | `apps/agent` — CI build + smoke `/health` (#69) |
| Indexer | `infra/docker/Dockerfile.indexer` | **Legacy** — pas de `apps/indexer` ; ne pas build / reactiver |

---

## Branches Git par environnement (etat observe)

Strategie **Web + API** : aligner la branche Dokploy sur la branche Git de release de l’environnement.

| Environnement | Web | API |
|----------------|-----|-----|
| production | `main` | `main` |
| staging | `staging` | `staging` |
| dev | `Dev` | `Dev` |

**Agent** : branches configurees sur `Dev` dans l’instance observee, y compris sous `production`. A ajuster lors de la **reactivation** Agent : aligner sur Web/API (pas `Dev` en prod).

**Indexer (legacy)** : ressource Dokploy historique — **ne pas reactiver** ; preferer suppression de l’application dans le projet Dokploy (voir section Agent et Indexer).

---

## Domaines publics (Traefik / Dokploy)

Chaque environnement a un **hote Web** et un **hote API** distincts sous `allaboard.fr` (releve MCP `application-one`, champs `domains[].host` et `port`).

| Environnement | Web (`host`) | Port conteneur Web | API (`host`) | Port conteneur API |
|----------------|--------------|-------------------|--------------|-------------------|
| production | `allaboard.fr` | 3000 | `api.allaboard.fr` | 4000 |
| staging | `staging.allaboard.fr` | 3000 | `api-staging.allaboard.fr` | 4000 |
| dev | `dev.allaboard.fr` | 3000 | `api-dev.allaboard.fr` | 4000 |

**URLs publiques canoniques** (a utiliser dans la doc produit, clients mobiles, CORS, webhooks ; preferer **HTTPS** une fois les certificats actives dans Dokploy pour chaque domaine) :

| Environnement | Site | API (origine) |
|----------------|------|----------------|
| production | `https://allaboard.fr` | `https://api.allaboard.fr` |
| staging | `https://staging.allaboard.fr` | `https://api-staging.allaboard.fr` |
| dev | `https://dev.allaboard.fr` | `https://api-dev.allaboard.fr` |

Exemples de chemins API (meme contrat qu’en local, detail dans [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md)) :

- `GET /health`, `GET /feed` (public)
- `POST /auth/login`, `POST /help-requests` (JWT sur creation ; login MVP)
- Smoke : `pnpm smoke:dev` — [runbook-dokploy-dev-phase2.md](runbook-dokploy-dev-phase2.md)

URLs dev : `https://api-dev.allaboard.fr/health`, `https://dev.allaboard.fr/api/feed`, `https://dev.allaboard.fr/help/new`.

**Note TLS** : les objets domaine Dokploy peuvent encore indiquer `https: false` selon l’etat de la terminaison ; l’objectif operationnel reste le **HTTPS** partout (Let’s Encrypt ou certificat manage dans l’UI domaine).

---

## Appel Web vers API (`API_URL` — reseau interne)

Pour le **SSR Next.js** (serveur dans le conteneur Web), `API_URL` doit en general pointer vers le **nom DNS interne** du service API sur le reseau Docker Dokploy, port **4000**, par exemple :

```text
http://<nom-interne-du-service-api>:4000
```

Le prefixe exact (`app-…` ou nom long type `allaboard-monorepo-website-api-…`) est attribue par Dokploy. Apres un redeploiement ou un renommage, mettre a jour la variable **Web** dans Dokploy pour rester aligne sur le service API du **meme environnement**.

Variables d’environnement **Web** (cles, sans valeurs) : `API_URL`, `NODE_ENV`, `APP_ENV`, `LOG_LEVEL`.

**Double exposition** : aujourd’hui l’API est joignable **publiquement** via les domaines `api*.allaboard.fr` **et** en **interne** pour le Web. C’est voulu : interne = latence et simplicite SSR ; public = navigateur, mobile, partenaires, `CORS_ALLOWED_ORIGINS` cote Fastify.

Pour du **fetch navigateur** same-origin, on peut alternativement exposer des rewrites Next (`/api/...`) ; sinon le client appelle directement `https://api-staging.allaboard.fr` (avec CORS configure sur l’API).

---

## API (service Fastify)

Cles d’environnement typiques : `NODE_ENV`, `APP_ENV`, `LOG_LEVEL`, `PORT=4000`. Grille `CORS_*` et secrets : [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md).

**Phase 2 (obligatoire sur l’API dev)** — sans ces variables le conteneur peut crasher au demarrage (`502` derriere Cloudflare) :

| Variable | Role |
|----------|------|
| `DATABASE_URL` | Postgres interne (hote service Postgres dev, port 5432) |
| `JWT_SECRET` | Min. 32 caracteres (`NODE_ENV=production` dans l’image Docker) |
| `MVP_LOGIN_PASSWORD` | Dev/CI uniquement (fallback login sans DB) — **pas** staging/prod |
| `DEV_SEED_PASSWORD` | Seed `bob@dev.local` / `alice@dev.local` (ADR 0003) — staging + dev |

Procedure : [runbook-dokploy-dev-phase2.md](runbook-dokploy-dev-phase2.md). Auth : [ADR 0001](adr/0001-authentication-strategy.md).

**Exposition** : domaine Traefik dedie par environnement (tableau *Domaines publics* ci-dessus). Pour le **SSR Web → API interne**, pas besoin de CORS. Pour un **fetch navigateur** vers `https://api-*.allaboard.fr`, configurer `CORS_ALLOWED_ORIGINS` (voir matrice). Le flux feed **home** actuel passe par le BFF Next — voir [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md).

---

## Postgres (Dokploy)

- Une instance **Postgres** par environnement (service separe dans le projet).
- Image utilisee sur l’instance de reference : **PostgreSQL 18**.
- Base et utilisateur dedies (noms affiches dans l’UI : ex. base `allaboard`).
- Hote pour les autres services du meme projet : nom interne du service Postgres (visible dans Dokploy), port **5432**.

`DATABASE_URL` pour Agent / Indexer doit utiliser cet hote interne et les identifiants definis dans l’UI (ne pas les dupliquer ici).

---

## Agent et Indexer

### Agent All-Aboard (`apps/agent`)

Le package [`apps/agent`](../apps/agent/README.md) est **present dans le monorepo** (scaffold #66) : `GET /health`, stub `POST /routing/evaluate`, image [`infra/docker/Dockerfile.agent`](../infra/docker/Dockerfile.agent).

**Statut instance (2026-06-03)** : application Dokploy **Agent** toujours **desactivee** (`enabled: false`, `autoDeploy: false`, conteneur arrete) — gate CI #69 livre ; **production** reste en pause jusqu’a validation humaine explicite.

**CI (#69)** : job GitHub Actions `agent` (paths-filter `apps/agent/**`, `infra/docker/Dockerfile.agent`, …) — build Docker + smoke `GET /health` sur port **4100**. Detail : [Docs/tasks/69-agent-ci-dokploy/README.md](tasks/69-agent-ci-dokploy/README.md).

**Procedure de reactivation Agent** (dev / staging — apres CI vert sur la branche cible) :

1. Dokploy → environnement cible → application **Agent** → `enabled: true`.
2. Branch Git : aligner sur **Web/API** de l’environnement (`Dev` / `staging` / `main` — pas `Dev` en production).
3. Variables : `PORT=4100`, `NODE_ENV=production`, `APP_ENV`, `LOG_LEVEL` — grille [matrice-deploiement-dokploy-coolify.md](matrice-deploiement-dokploy-coolify.md). Pas de domaine Traefik public — **service interne** uniquement.
4. Cote **API** : definir `AGENT_URL` vers le nom DNS interne du service Agent (ex. `http://<service-agent>:4100`) une fois l’integration handoff #68 deployee.
5. Lancer un **deploiement manuel** ; conserver `autoDeploy: false` tant que l’integration n’est pas validee end-to-end.
6. Smoke reseau interne : `GET http://<service-agent>:4100/health` → `{ "status": "ok" }`.

**Production** : ne pas reactiver tant qu’ops + produit n’ont pas valide le handoff agent (#68) et la charge attendue.

### Indexer placeholder (legacy — ne pas reactiver)

Les applications Dokploy **Indexer** existent encore dans les trois environnements (Dockerfile `infra/docker/Dockerfile.indexer`, variables `INDEXER_*`, port **4200**).

**Decision architecture (ADR 0004)** : All-Aboard **n’implemente pas** `apps/indexer`. L’indexation graphe est assuree par l’**indexer reseau Intuition** (subnet + GraphQL) ; All-Aboard publie via le **bridge outbox** (#67) dans `apps/api`.

| Element | Action |
|---------|--------|
| `infra/docker/Dockerfile.indexer` | Artefact bootstrap historique — **ne pas build** en CI ni Dokploy |
| Service Dokploy « Indexer » | **Ne pas reactiver** (`enabled: false`) ; **recommande** : supprimer la ressource du projet |
| Indexer Intuition | Infra externe — hors Dokploy All-Aboard |

**Statut operationnel** : identique a mai 2026 — `enabled: false`, `autoDeploy: false`, conteneurs arretes. Le build echouerait faute de package `apps/indexer` ; laisser desactive ou supprimer evite le bruit dashboard.

**Ne pas confondre** : « Indexer Dokploy All-Aboard » (legacy) ≠ « Indexer Intuition » (reseau blockchain documente dans [ADR 0004](adr/0004-agent-indexer-architecture.md)).

---

## Postgres : acces operationnel

- Sauvegardes : configurer selon la politique Dokploy (backups du service Postgres).
- Rotation des mots de passe : uniquement via l’UI ou l’API Dokploy, puis mettre a jour `DATABASE_URL` sur les services qui consomment la base.

---

## Synthese statut services (reference MCP)

| Environnement | Web | API | Agent | Indexer |
|----------------|-----|-----|-------|---------|
| production | deploye OK | deploye OK | **desactive** (CI #69 OK ; reactiver manuellement apres validation) | **legacy — ne pas reactiver** |
| staging | deploye OK (MVP Phase 2, commit `d9ca975` ; Web redeploy manuel 2026-05-27 si build auto en erreur) | deploye OK (vars Phase 2 — 2026-05-25 ; PR #54) | **desactive** (pret build Agent) | **legacy — ne pas reactiver** |
| dev | deploye OK | deploye OK (Phase 2 : vars Postgres + JWT) | **desactive** (pret build Agent) | **legacy — ne pas reactiver** |

**Dev (2026-05-25)** : MVP parcours Bob validé — journal [plan opérationnel](plan-mise-en-place-web-api-donnees.md), [runbook dev](runbook-dokploy-dev-phase2.md).

**Staging (2026-05-29)** : MVP Phase 2 + auth ADR 0003 (`DEV_SEED_PASSWORD`, comptes seed OK) — [runbook staging](runbook-dokploy-staging-phase2.md). Healthchecks : `GET …/health`, `GET …/feed` (UUID), BFF `/api/feed`, `POST …/auth/login` → 401 si invalides, 200 avec email seed si valides.

Dernier etat connu : **Agent** — code + CI Docker livres (#66, #69) ; instance Dokploy encore en pause. **Indexer** — placeholder legacy sans `apps/indexer` ; ne pas reactiver (ADR 0004).

---

## Maintenance documentaire

Pour realigner ce fichier avec la realite :

1. Utiliser le MCP Dokploy All-Aboard (`project-all`, puis `application-one` / `postgres-one` par identifiant).
2. Mettre a jour domaines, branches et statuts sans copier de secrets.

**Attention** : certaines reponses API Dokploy (ex. apres `application-stop`) peuvent contenir des champs sensibles (`env` complet, metadonnees GitHub). Ne pas coller ces JSON dans le depot ni dans des tickets publics.
