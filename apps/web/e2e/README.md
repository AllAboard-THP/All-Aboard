# E2E Playwright (`apps/web/e2e`)

Correspondance avec le [plan d’intégration kit UX](../../Docs/plan-integration-kit-ux-allaboard.md) : recette **R1–R6** ([§12](../../Docs/plan-integration-kit-ux-allaboard.md#recette-manuelle-r1--r6)), jalon **P**, décision **D4**.

| Fichier | ID plan | Statut |
|---------|----------|--------|
| `r1-visitor.spec.ts` | **R1** | Actif — landing + lien `/health` |
| `r2-auth.spec.ts` | **R2** | Actif — login erreurs + session démo |
| `r3-cgu.spec.ts` | **R3** | Actif — modale CGU |
| `r4-feed.spec.ts` | **R4** | Actif — bloc feed SSR |
| `r5-messages.spec.ts` | **R5** | Actif — split view messages |
| `r6-admin-mentor.spec.ts` | **R6** | Actif — dashboards admin / mentor |

Helpers : `helpers.ts` (`acceptCguInStorage`, `resetCguInStorage`).

## Commandes

```bash
pnpm --filter web run test:e2e:install
pnpm --filter web run build
CI=true pnpm --filter web run test:e2e
```

## CGU

Clé `localStorage` : `allaboard-cgu-accepted` = `"1"`. Les specs R1, R2, R4–R6 pré-acceptent via `addInitScript` ; **R3** réinitialise pour tester la modale.

## Auth de test

Login `/login` : cookie démo `allaboard-session` (hors prod, pas de backend auth métier).
