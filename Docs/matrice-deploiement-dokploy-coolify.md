# Matrice de deploiement - Dokploy / Coolify

## Objectif

Standardiser le deploiement par service de All-Aboard dans Dokploy ou Coolify, avec une convention unique pour:

- Dockerfile cible,
- contexte de build,
- port runtime,
- variables d'environnement,
- healthcheck et strategie de deploiement.

## Convention globale

- **1 service deployable = 1 Dockerfile = 1 ressource Dokploy/Coolify**
- Build prefere en CI puis deploiement de l'image (recommande pour la prod).
- Nommage ressources: `allaboard-<service>-<env>` (ex: `allaboard-api-staging`).
- Environnements separes: `dev`, `staging`, `prod`.

## Matrice service -> deploiement

| Service | Dossier app | Dockerfile | Port | Base Directory (Dokploy/Coolify) | Build Context | Type de service |
|---|---|---|---:|---|---|---|
| Web | `apps/web` | `infra/docker/Dockerfile.web` | 3000 | `/` | repo racine | HTTP public |
| API | `apps/api` | `infra/docker/Dockerfile.api` | 4000 | `/` | repo racine | HTTP prive/public |
| Agent | `apps/agent` | `infra/docker/Dockerfile.agent` | 4100 | `/` | repo racine | Worker/API interne |
| Indexer | `apps/indexer` | `infra/docker/Dockerfile.indexer` | 4200 (optionnel) | `/` | repo racine | Worker (souvent non expose) |

## Variables d'environnement par service

### Variables communes (tous services Node)

| Variable | Exemple | Web | API | Agent | Indexer | Obligatoire |
|---|---|:---:|:---:|:---:|:---:|:---:|
| `NODE_ENV` | `production` | x | x | x | x | Oui |
| `LOG_LEVEL` | `info` | x | x | x | x | Oui |
| `PORT` | `3000` | x | x | x | x | Oui |
| `APP_ENV` | `staging` | x | x | x | x | Oui |
| `SENTRY_DSN` | `https://...` | x | x | x | x | Recommande |

### Variables data/cache

| Variable | Web | API | Agent | Indexer | Obligatoire |
|---|:---:|:---:|:---:|:---:|:---:|
| `DATABASE_URL` |  | x | x | x | Oui (hors web pur) |
| `REDIS_URL` |  | x | x | x | Recommande |
| `STORAGE_BUCKET` |  | x | x |  | Recommande |
| `STORAGE_ENDPOINT` |  | x | x |  | Recommande |
| `STORAGE_ACCESS_KEY` |  | x | x |  | Oui si utilise |
| `STORAGE_SECRET_KEY` |  | x | x |  | Oui si utilise |

### Variables auth/securite

| Variable | Web | API | Agent | Indexer | Obligatoire |
|---|:---:|:---:|:---:|:---:|:---:|
| `JWT_SECRET` |  | x | x |  | Oui |
| `SESSION_SECRET` | x | x |  |  | Oui si session |
| `CORS_ALLOWED_ORIGINS` |  | x |  |  | Oui (API publique) |
| `RATE_LIMIT_ENABLED` |  | x |  |  | Recommande |

### Variables blockchain/indexation

| Variable | Web | API | Agent | Indexer | Obligatoire |
|---|:---:|:---:|:---:|:---:|:---:|
| `INTUITION_RPC_URL` |  | x | x | x | Oui |
| `INTUITION_API_KEY` |  | x | x | x | Selon provider |
| `INDEXER_START_BLOCK` |  |  |  | x | Oui |
| `INDEXER_CONFIRMATIONS` |  |  |  | x | Recommande |

## Configuration Dokploy (par service)

1. Creer une ressource **Application** (ou Docker Compose si besoin multi-service groupe).
2. Source: repository Git.
3. Build type: **Dockerfile**.
4. `Base Directory`: `/` (si Dockerfile reference le monorepo racine).
5. Dockerfile path: `infra/docker/Dockerfile.<service>`.
6. Definir env vars par service.
7. Configurer domaine + port + healthcheck.
8. Activer limites CPU/RAM et logs.

Note prod:
- Dokploy recommande de preferer build+publish en CI pour eviter la surcharge de build sur le serveur.

## Configuration Coolify (par service)

1. Creer une ressource Application depuis Git.
2. Build pack: **Dockerfile**.
3. `Base Directory`: `/`.
4. Dockerfile: `infra/docker/Dockerfile.<service>`.
5. Renseigner port runtime du service.
6. Ajouter env vars dans l'onglet dedie.
7. Configurer domaine/publication selon nature du service.

Notes:
- Garder `SOURCE_COMMIT` desactive si vous voulez maximiser le cache Docker.
- Utiliser pre/post deployment commands uniquement pour actions simples et idempotentes.

## Healthchecks recommandes

| Service | Endpoint / Check | Frequence | Timeout |
|---|---|---|---|
| Web | `GET /health` | 30s | 3s |
| API | `GET /health` | 15s | 3s |
| Agent | `GET /health` ou check queue | 30s | 5s |
| Indexer | check bloc courant (custom) | 60s | 5s |

## Strategie CI/CD recommandee

1. CI valide monorepo:
   - `turbo run lint typecheck test build`
2. CI construit les images:
   - `web`, `api`, `agent`, `indexer`
3. CI publie les images (registry).
4. Dokploy/Coolify deploie par service a partir de l'image/tag.
5. Rollback par service possible via tag precedent.

## Mapping des tags images

| Service | Nom image | Tag recommande |
|---|---|---|
| Web | `ghcr.io/all-aboard/web` | `sha-<commit>` + `staging`/`prod` |
| API | `ghcr.io/all-aboard/api` | `sha-<commit>` + `staging`/`prod` |
| Agent | `ghcr.io/all-aboard/agent` | `sha-<commit>` + `staging`/`prod` |
| Indexer | `ghcr.io/all-aboard/indexer` | `sha-<commit>` + `staging`/`prod` |

## Checklist de readiness avant deploiement

- Dockerfile service build localement.
- Variables d'environnement completees et segmentees par environnement.
- Endpoint healthcheck disponible.
- Logs JSON actives.
- Service non expose publiquement si non necessaire (agent/indexer).
- Strategie de rollback validee.
