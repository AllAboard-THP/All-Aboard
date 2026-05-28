# Tâche #49 — OpenAPI specification

**Issue** : https://github.com/AllAboard-THP/All-Aboard/issues/49

## Objectif

Documenter le contrat API Phase 2 de façon versionnée (OpenAPI 3.1), avec une UI Swagger en dev/staging, sans exposer `/docs` en production publique.

## Décision (spike)

### Options comparées

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **`@fastify/swagger` + `@fastify/swagger-ui` (généré depuis routes)** | Spec auto depuis schémas Fastify ; `/docs` interactif | Dérive possible vs `packages/types` ; effort schémas JSON sur chaque route |
| **Spec OpenAPI maintenue à la main (`apps/api/openapi.yaml`)** | Contrôle explicite ; review diff Git facile ; alignée sur le plan opérationnel | Duplication avec `packages/types` (acceptée MVP) |
| **Génération depuis Zod/schemas partagés** | Single source of truth | Setup monorepo lourd ; Zod 4 + Fastify 5 pas encore standardisé dans le dépôt |

### Recommandation retenue — **hybride statique**

1. **Source versionnée** : [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) — contrat Phase 2 (`/health`, `/feed`, `/auth/*`, `/help-requests/*`, `/mentor/feed`), schémas alignés sur [`packages/types/src/index.ts`](../../../packages/types/src/index.ts).
2. **UI dev/staging** : [`@fastify/swagger`](https://github.com/fastify/fastify-swagger) en mode **`static`** + [`@fastify/swagger-ui`](https://github.com/fastify/fastify-swagger-ui) sur **`GET /docs`** — voir [`apps/api/src/openapi.ts`](../../../apps/api/src/openapi.ts).
3. **Pas de codegen web** pour l’instant — le BFF Next reste la consommation navigateur ; codegen client **reporté**.
4. **CI / review** : changement endpoint = **api + types + `openapi.yaml` + tests** dans la même PR (règle existante [Docs/README.md](../../README.md)).

### Questions ouvertes (issue #49) — tranchées

| Question | Décision MVP |
|----------|--------------|
| Périmètre v1 | Tous les endpoints Phase 2 listés ci-dessus |
| Publication `/docs` | **Dev + staging** (`APP_ENV` ≠ `production`) ; override `OPENAPI_DOCS=true\|false` |
| Prod publique | `/docs` **désactivé** sans ADR sécurité dédiée |
| Consommation | Doc développeur + smoke manuel ; pas de codegen |

### Évolution possible (post-MVP)

- Extraire schémas Zod partagés (`packages/types` ou `packages/api-schemas`) et générer YAML en CI.
- Passer `@fastify/swagger` en mode **dynamic** une fois les schémas route alignés — avec test de non-régression contre le YAML.
- ADR si exposition Swagger en prod (auth, rate limit, désactivation write).

## Implémentation livrée

| Fichier | Rôle |
|---------|------|
| [`apps/api/openapi.yaml`](../../../apps/api/openapi.yaml) | Spec OpenAPI 3.1 Phase 2 |
| [`apps/api/src/openapi.ts`](../../../apps/api/src/openapi.ts) | Enregistrement conditionnel Swagger UI |
| [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) | `buildApp()` async — docs avant routes |
| [`apps/api/src/app.test.ts`](../../../apps/api/src/app.test.ts) | Tests spec `/feed` + garde `/docs` prod |

### Variables d’environnement

| Variable | Service | Rôle |
|----------|---------|------|
| `APP_ENV` | API | Si `production` → pas de `/docs` (défaut staging/dev : docs actifs) |
| `OPENAPI_DOCS` | API | Override explicite : `true` / `false` |

### Vérification locale

```bash
# Terminal 1 — API
cd apps/api && pnpm dev

# Navigateur
open http://localhost:4000/docs
```

```bash
pnpm --filter api test
```

## Critères de clôture #49

- [x] Spike doc (ce README)
- [x] Spec minimale versionnée (`openapi.yaml`)
- [x] Swagger UI dev/staging (`/docs`)
- [x] Tests Vitest (spec + garde prod)
- [x] `pnpm verify` vert

**Clôture issue** : commenter sur #49 avec lien vers ce dossier + merge PR ; passer le statut Project **Done**.

## Doc canonique (lecture)

- [Plan opérationnel — Contrats API](../../plan-mise-en-place-web-api-donnees.md)
- [packages/types](../../../packages/types/src/index.ts)
- [ADR 0001 auth](../../adr/0001-authentication-strategy.md)
