# Deploiement Dokploy — instance All-Aboard (reference)

Ce document decrit la configuration **effective** du projet All-Aboard sur Dokploy, telle qu’observable via l’API Dokploy (MCP `user-dokploy-allaboard-mcp`). Il complete la [matrice theorique](matrice-deploiement-dokploy-coolify.md) (conventions, **tables de variables par type** — ne pas les recopier ici).

**Timeline produit / stack applicative** (ordre des phases, TanStack, auth) : [README documentation — canonique](README.md).

**Mise a jour** : 2026-05-12 (domaines `allaboard.fr` + API dediees ; Agent/Indexer **desactives** sur les trois environnements — releve MCP + changements operes via MCP). **Post-merge PR #9 (Phase 1 Web/API)** : deploiements dev Web + API en **done** (Dokploy MCP) ; smoke HTTPS `https://dev.allaboard.fr`, `https://api-dev.allaboard.fr/feed`, `https://dev.allaboard.fr/api/feed` OK — detail dans [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) (journal).

**Secrets** : mots de passe base de donnees, cles API et tokens GitHub se configurent **uniquement** dans Dokploy. Ne jamais les commiter dans ce depot.

---

## Projet et environnements

| Element | Valeur |
|--------|--------|
| Projet Dokploy | `AllAboard monorepo website` |
| Depots Git | `AllAboard-THP/All-Aboard` (integration GitHub App Dokploy) |
| Environnements | `production`, `staging`, `dev` |

Chaque environnement contient typiquement :

- quatre **ressources application** : Web, API, Agent, Indexer (les deux derniers peuvent etre **desactives** tant que le code n’est pas pret — voir section Agent et Indexer) ;
- une base **Postgres** managée par Dokploy.

---

## Build Docker (commun a tous les services Node)

| Parametre | Valeur |
|-----------|--------|
| `buildType` | `dockerfile` |
| `buildPath` | `/` (racine du monorepo) |
| `dockerContextPath` | `.` |
| Sous-modules Git | desactives (`enableSubmodules: false`) |
| Declenchement | **Web + API** : `push` sur la branche configuree, `autoDeploy: true`. **Agent + Indexer** (mai 2026) : `autoDeploy: false` — pas de deploiement sur push tant que les apps ne sont pas dans le repo. |

Dockerfiles utilises (chemins relatifs a la racine du repo) :

| Application | Dockerfile |
|-------------|------------|
| Web | `infra/docker/Dockerfile.web` |
| API | `infra/docker/Dockerfile.api` |
| Agent | `infra/docker/Dockerfile.agent` |
| Indexer | `infra/docker/Dockerfile.indexer` |

---

## Branches Git par environnement (etat observe)

Strategie **Web + API** : aligner la branche Dokploy sur la branche Git de release de l’environnement.

| Environnement | Web | API |
|----------------|-----|-----|
| production | `main` | `main` |
| staging | `staging` | `staging` |
| dev | `Dev` | `Dev` |

**Agent** et **Indexer** : branches configurees sur `Dev` dans l’instance observee, y compris sous `production`. C’est coherent pour preparer le code, mais **desaligne** par rapport a Web/API en prod ; a ajuster quand les services `apps/agent` et `apps/indexer` seront stabilises (voir section Statut).

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

**Exposition** : domaine Traefik dedie par environnement (tableau *Domaines publics* ci-dessus). Pour le **SSR Web → API interne**, pas besoin de CORS. Pour un **fetch navigateur** vers `https://api-*.allaboard.fr`, configurer `CORS_ALLOWED_ORIGINS` (voir matrice). Le flux feed **home** actuel passe par le BFF Next — voir [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md).

---

## Postgres (Dokploy)

- Une instance **Postgres** par environnement (service separe dans le projet).
- Image utilisee sur l’instance de reference : **PostgreSQL 18**.
- Base et utilisateur dedies (noms affiches dans l’UI : ex. base `allaboard`).
- Hote pour les autres services du meme projet : nom interne du service Postgres (visible dans Dokploy), port **5432**.

`DATABASE_URL` pour Agent / Indexer doit utiliser cet hote interne et les identifiants definis dans l’UI (ne pas les dupliquer ici).

---

## Agent et Indexer (preparation)

Les applications Dokploy **Agent** et **Indexer** existent dans les trois environnements, avec les Dockerfiles prevus et des variables preparees (`PORT` 4100 / 4200, `DATABASE_URL`, placeholders `REDIS_URL`, Intuition, `INDEXER_*`, etc.).

**Statut operationnel (2026-05-12)** : tant que le depot ne contient pas `apps/agent` et `apps/indexer` exploitables par le build Docker, ces services sont **mis en pause** sur l’instance de reference :

- `enabled: false` (application desactivee dans Dokploy) ;
- `autoDeploy: false` (aucun deploiement automatique sur push Git) ;
- conteneurs **arretes** (`application-stop`), pour eviter builds en echec repetes et bruit dans le tableau de bord.

**Pour reactiver** : implementer les apps dans le monorepo, verifier un build local / CI des images, puis dans Dokploy — pour chaque environnement — reactiver l’application (`enabled: true`), remettre `autoDeploy` si souhaite, aligner les **branches** avec Web/API (au lieu de `Dev` partout en prod), et lancer un deploiement manuel. Alternative : supprimer les ressources Agent/Indexer dans Dokploy si on prefere ne pas garder de placeholders.

---

## Postgres : acces operationnel

- Sauvegardes : configurer selon la politique Dokploy (backups du service Postgres).
- Rotation des mots de passe : uniquement via l’UI ou l’API Dokploy, puis mettre a jour `DATABASE_URL` sur les services qui consomment la base.

---

## Synthese statut services (reference MCP)

| Environnement | Web | API | Agent | Indexer |
|----------------|-----|-----|-------|---------|
| production | deploye OK | deploye OK | **desactive** (pas d’auto-deploy, conteneur arrete) | **desactive** |
| staging | deploye OK | deploye OK | **desactive** | **desactive** |
| dev | deploye OK | deploye OK | **desactive** | **desactive** |

Dernier etat connu avant mise en pause : echec de build / runtime faute de packages `apps/agent` et `apps/indexer` dans le repo.

---

## Maintenance documentaire

Pour realigner ce fichier avec la realite :

1. Utiliser le MCP Dokploy All-Aboard (`project-all`, puis `application-one` / `postgres-one` par identifiant).
2. Mettre a jour domaines, branches et statuts sans copier de secrets.

**Attention** : certaines reponses API Dokploy (ex. apres `application-stop`) peuvent contenir des champs sensibles (`env` complet, metadonnees GitHub). Ne pas coller ces JSON dans le depot ni dans des tickets publics.
