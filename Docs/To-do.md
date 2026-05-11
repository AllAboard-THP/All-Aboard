# To-do

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
