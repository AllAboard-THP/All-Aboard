# Plan d'initialisation Turborepo - MVP All-Aboard

## Objectif

Mettre en place un monorepo Turborepo minimal, propre et evolutif pour livrer rapidement le premier MVP All-Aboard.

## Portee MVP (semaine 1)

- `apps/web` pour le front web.
- `apps/api` pour le backend MVP.
- `packages/types` pour les types partages.
- `packages/config-typescript` et `packages/config-eslint` pour standardiser le repo.
- Pipeline Turborepo: `dev`, `build`, `lint`, `typecheck`, `test`.
- CI minimale avec cache Turborepo.
- Deploiement par service via Dockerfile (Dokploy ou Coolify).

## Architecture minimale

```text
all-aboard/
  apps/
    web/
    api/
    agent/
  packages/
    types/
    config-typescript/
    config-eslint/
  infra/
    docker/
      Dockerfile.web
      Dockerfile.api
      Dockerfile.agent
      .dockerignore
  docs/
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.json
```

## Plan d'execution

### Etape A - Initialiser le workspace

1. Initialiser `pnpm` a la racine.
2. Installer `turbo` en dependance de developpement.
3. Definir `pnpm-workspace.yaml` avec:
   - `apps/*`
   - `packages/*`
4. Ajouter les scripts root:
   - `dev`
   - `build`
   - `lint`
   - `typecheck`
   - `test`

### Etape B - Configurer Turborepo

1. Creer `turbo.json`.
2. Configurer les dependances de taches:
   - `build` depend de `^build`
   - `typecheck` depend de `^typecheck`
   - `lint` depend de `^lint`
3. Configurer `dev` en mode:
   - `persistent: true`
   - `cache: false`
4. Definir les outputs de build (`dist/**`, `.next/**`, etc.).

### Etape C - TypeScript monorepo

1. Root `tsconfig.json` avec project references.
2. Chaque package TS en `composite: true`.
3. Utiliser `tsc -b` pour les builds incrementaux.

### Etape D - Creer les apps MVP

1. `apps/web`
   - page health (`/health`)
   - premiere page feed mock
2. `apps/api`
   - endpoint health
   - endpoint feed mock
3. `packages/types`
   - types metier initiaux (`User`, `HelpRequest`, `Response`)

### Etape E - Qualite minimale

1. ESLint partage via `packages/config-eslint`.
2. TS config partagee via `packages/config-typescript`.
3. Ajouter au moins 1 test smoke par app.

### Etape F - Preparation deploiement Dokploy/Coolify

1. Creer un Dockerfile par service deployable (`web`, `api`, `agent`).
2. S'assurer que chaque service peut etre build/deploye independamment.
3. Ajouter un `.dockerignore` monorepo optimise.
4. Configurer Dokploy/Coolify service par service (base directory, port, env vars, healthcheck).
5. Appliquer la matrice de deploiement comme reference unique:
   - [`Docs/matrice-deploiement-dokploy-coolify.md`](matrice-deploiement-dokploy-coolify.md)

## Scripts cibles (racine)

- `dev`: lance tous les serveurs de dev utiles.
- `build`: compile apps + packages.
- `lint`: controle qualite statique.
- `typecheck`: validation TypeScript globale.
- `test`: tests unitaires/smoke.

## CI MVP

Pipeline PR recommande:

1. `pnpm install --frozen-lockfile`
2. `turbo run lint typecheck test build`
3. construire et publier les images Docker par service en CI
4. activer le remote cache Turborepo

Note:
- Pour Dokploy, la doc recommande de privilegier build+publish en CI pour eviter la surcharge de build sur le serveur.
- Pour Coolify, mode Dockerfile supporte nativement le deploiement par service (avec `Base Directory`, env vars, ports).

## Regles de gouvernance (des le jour 1)

- Dependances internes en `workspace:*`.
- Une responsabilite claire par package.
- `apps/web` n'importe pas de code `db`/infra.
- Exports explicites dans chaque package.
- ADR courte pour chaque decision structurante.
- Un service = une image = un Dockerfile = une configuration Dokploy/Coolify.

## Roadmap 30 jours (MVP -> v1)

- **J1-J3**: bootstrap monorepo + tooling + CI.
- **J4-J10**: base fonctionnelle web + api + types partages.
- **J11-J20**: auth + premier parcours "demande d'aide".
- **J21-J30**: observabilite, hardening, staging + parametrage Dokploy/Coolify selon la matrice de deploiement.

## Checklist de suivi d'avancement

### Portee MVP (semaine 1)

- [ ] `apps/web` pour le front web.
- [ ] `apps/api` pour le backend MVP.
- [ ] `packages/types` pour les types partages.
- [ ] `packages/config-typescript` et `packages/config-eslint` pour standardiser le repo.
- [ ] Pipeline Turborepo: `dev`, `build`, `lint`, `typecheck`, `test`.
- [ ] CI minimale avec cache Turborepo.
- [ ] Deploiement par service via Dockerfile (Dokploy ou Coolify).

### Etape A - Initialiser le workspace

- [ ] Initialiser `pnpm` a la racine.
- [ ] Installer `turbo` en dependance de developpement.
- [ ] Definir `pnpm-workspace.yaml` avec `apps/*` et `packages/*`.
- [ ] Ajouter les scripts root `dev`, `build`, `lint`, `typecheck`, `test`.

### Etape B - Configurer Turborepo

- [ ] Creer `turbo.json`.
- [ ] Configurer les dependances de taches (`build`, `typecheck`, `lint`).
- [ ] Configurer `dev` avec `persistent: true` et `cache: false`.
- [ ] Definir les outputs de build (`dist/**`, `.next/**`, etc.).

### Etape C - TypeScript monorepo

- [ ] Configurer le `tsconfig.json` root avec project references.
- [ ] Passer chaque package TS en `composite: true`.
- [ ] Utiliser `tsc -b` pour les builds incrementaux.

### Etape D - Creer les apps MVP

- [ ] Creer `apps/web`.
- [ ] Ajouter la page health (`/health`) dans `apps/web`.
- [ ] Ajouter une premiere page feed mock dans `apps/web`.
- [ ] Creer `apps/api`.
- [ ] Ajouter l'endpoint health dans `apps/api`.
- [ ] Ajouter l'endpoint feed mock dans `apps/api`.
- [ ] Creer `packages/types`.
- [ ] Ajouter les types metier initiaux (`User`, `HelpRequest`, `Response`).

### Etape E - Qualite minimale

- [ ] Mettre en place ESLint partage via `packages/config-eslint`.
- [ ] Mettre en place TS config partagee via `packages/config-typescript`.
- [ ] Ajouter au moins 1 test smoke par app.

### Etape F - Preparation deploiement Dokploy/Coolify

- [ ] Creer un Dockerfile par service deployable (`web`, `api`, `agent`).
- [ ] Verifier que chaque service peut etre build/deploye independamment.
- [ ] Ajouter un `.dockerignore` monorepo optimise.
- [ ] Configurer Dokploy/Coolify service par service (base directory, port, env vars, healthcheck).
- [ ] Appliquer la matrice de deploiement comme reference unique.

### Scripts cibles (racine)

- [ ] Script `dev` operationnel.
- [ ] Script `build` operationnel.
- [ ] Script `lint` operationnel.
- [ ] Script `typecheck` operationnel.
- [ ] Script `test` operationnel.

### CI MVP

- [ ] Executer `pnpm install --frozen-lockfile` dans le pipeline PR.
- [ ] Executer `turbo run lint typecheck test build` dans le pipeline PR.
- [ ] Construire et publier les images Docker par service en CI.
- [ ] Activer le remote cache Turborepo.
- [ ] Appliquer la recommandation Dokploy (build+publish en CI).
- [ ] Appliquer la configuration Coolify Dockerfile (Base Directory, env vars, ports).

### Regles de gouvernance (des le jour 1)

- [ ] Utiliser les dependances internes en `workspace:*`.
- [ ] Maintenir une responsabilite claire par package.
- [ ] Garantir que `apps/web` n'importe pas de code `db`/infra.
- [ ] Definir des exports explicites dans chaque package.
- [ ] Creer une ADR courte pour chaque decision structurante.
- [ ] Respecter la regle: un service = une image = un Dockerfile = une configuration Dokploy/Coolify.

### Roadmap 30 jours (MVP -> v1)

- [ ] **J1-J3**: bootstrap monorepo + tooling + CI.
- [ ] **J4-J10**: base fonctionnelle web + api + types partages.
- [ ] **J11-J20**: auth + premier parcours "demande d'aide".
- [ ] **J21-J30**: observabilite, hardening, staging + parametrage Dokploy/Coolify selon la matrice de deploiement.

## References

- [Matrice de deploiement Dokploy/Coolify](matrice-deploiement-dokploy-coolify.md)
- [Turborepo Docs - Workspaces](https://turbo.build/docs/guides/workspaces)
- [Turborepo Docs - Managing dependencies](https://turbo.build/docs/crafting-your-repository/managing-dependencies)
- [TypeScript - Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Node.js release schedule](https://nodejs.org/about/releases)
- [Dokploy - Core Features](https://docs.dokploy.com/docs/core/features)
- [Dokploy - Going Production](https://docs.dokploy.com/docs/core/applications/going-production)
- [Coolify - Dockerfile Build Pack](https://coolify.io/docs/builds/packs/dockerfile)
