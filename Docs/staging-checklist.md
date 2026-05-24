# Checklist promotion dev → staging

Référence issue [#31](https://github.com/AllAboard-THP/All-Aboard/issues/31) / [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32). **Ne pas déployer staging** tant que cette checklist n’est pas validée par l’équipe.

## Parcours produit (dev)

- [ ] Feed SSR + liens `/requests/[id]` OK
- [ ] Création `/help/new` → détail demande OK
- [ ] Doublon 409 → lien demande existante OK
- [ ] Dashboard mentor (`alice` + tags) OK
- [ ] `pnpm verify` OK sur `Dev`
- [ ] `pnpm smoke:dev` OK (HTTPS dev)

## Auth (bloquant staging public)

- [ ] [ADR 0003](adr/0003-authentication-users-production.md) validé
- [ ] `MVP_LOGIN_PASSWORD` retiré de staging
- [ ] Comptes réels ou SSO tranchés

## Infra Dokploy staging

- [ ] Vars Web/API alignées [matrice](../matrice-deploiement-dokploy-coolify.md)
- [ ] `DATABASE_URL`, `JWT_SECRET`, `API_URL` interne cohérents
- [ ] Smoke HTTPS : `BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr pnpm smoke:dev`
- [ ] Aucun secret committé dans le dépôt

## Qualité

- [ ] `pnpm test:e2e` (Playwright) OK sur parcours critique
- [ ] Journal [plan opérationnel](../plan-mise-en-place-web-api-donnees.md) à jour
