# To-do

**Documentation canonique** : [README.md](README.md) (timeline MVP ; ce fichier reste la liste d’actions prioritaires et de promotion d’environnement).

## Priorite immediate

- [ ] Garder la version actuelle en production tant que le MVP n'est pas
      completement valide en staging.
- [ ] Travailler uniquement sur l'environnement `dev` jusqu'a obtenir un MVP
      fonctionnel bout-en-bout.
- [ ] Definir la checklist de promotion `dev -> staging`.
- [ ] Preparer la configuration `staging` sans deploiement (env vars,
      domaines, healthchecks, ressources Dokploy/Coolify).
- [ ] Formaliser la regle de release: aucun deploiement `prod` sans validation
      fonctionnelle complete en `staging`.

## Alignement timeline (voir README canonique)

- [ ] **Phase 1** : `apps/web` consomme l’API (`API_URL` / SSR) pour `/feed` **et** inclut le socle TanStack (`@tanstack/react-query` + provider) — **Option B** tranchée ; voir [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md). **Doc** : cocher la section *Documentation au fil de l’implémentation* au même rythme que le code (todos `doc-impl-*` du plan Cursor).
- [ ] **Phase 2** : ADR auth + routes + parcours « demande d’aide » minimal.
- [ ] **Phase 3** : `@tanstack/react-query` si besoin client (feed interactif, mutations).

## Checklist promotion dev -> staging

- [ ] Build monorepo OK (`turbo run build`).
- [ ] Lint + typecheck OK (`turbo run lint typecheck`).
- [ ] Smoke tests web/api OK (`turbo run test`).
- [ ] Healthchecks disponibles et valides (`/health` web, api, agent si
      expose).
- [ ] Variables d'environnement `staging` completees et verifiees.
- [ ] Migrations base de donnees validees sur staging.
- [ ] Docker images par service construites (web/api/agent/indexer si
      necessaire).
- [ ] Rollback par tag valide pour chaque service.
