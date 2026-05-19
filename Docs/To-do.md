# To-do

**Documentation canonique** : [README.md](README.md) (timeline, état MVP). **Alignement phases** : mêmes cases que ci-dessous, sans dupliquer la timeline.

## Priorité immédiate

- [ ] Garder la version actuelle en production tant que le MVP n'est pas complètement validé en staging.
- [ ] Travailler uniquement sur l'environnement `dev` jusqu'à un MVP fonctionnel bout-en-bout.
- [ ] Définir la checklist de promotion `dev -> staging`.
- [ ] Préparer la configuration `staging` sans déploiement (env vars, domaines, healthchecks, ressources Dokploy/Coolify).
- [ ] Formaliser la règle de release : aucun déploiement `prod` sans validation fonctionnelle complète en `staging`.

## Alignement timeline

- [x] **Phase 0–1** : monorepo, Web/API, feed SSR + `API_URL`, socle TanStack — voir [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md).
- [x] **Phase 3 (home feed)** : `useQuery` + BFF `/api/feed` + **Rafraîchir** / `invalidateQueries` sur `['feed']` — même plan (journal + chemins code).
- [x] **Phase 2** : ADR auth + Postgres + routes + parcours « demande d'aide » MVP (`/help/new`, BFF) — voir [ADR 0001](adr/0001-authentication-strategy.md) et [plan opérationnel](plan-mise-en-place-web-api-donnees.md).
- [ ] **Phase 3 (résiduel)** : étendre TanStack (autres `queryKey`, mutations) hors home ; `credentials` si fetch client cross-origin vers l'API.

## Checklist promotion dev -> staging

- [ ] Build monorepo OK (`turbo run build`).
- [ ] Lint + typecheck OK (`turbo run lint typecheck`).
- [ ] Smoke tests web/api OK (`turbo run test`).
- [ ] Healthchecks disponibles et valides (`/health` web, api, agent si exposé).
- [ ] Variables d'environnement `staging` complétées et vérifiées.
- [ ] Migrations base de données validées sur staging.
- [ ] Docker images par service construites (web/api/agent/indexer si nécessaire).
- [ ] Rollback par tag valide pour chaque service.
