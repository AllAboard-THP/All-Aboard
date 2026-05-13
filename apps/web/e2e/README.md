# E2E Playwright (`apps/web/e2e`)

Correspondance avec le [plan d’intégration kit UX](../../Docs/plan-integration-kit-ux-allaboard.md) : recette **R1–R6** ([§12](../../Docs/plan-integration-kit-ux-allaboard.md#recette-manuelle-r1--r6)), jalon **P**, décision **D4** ([exécution agent autonome](../../Docs/plan-integration-kit-ux-allaboard.md#execution-agent-autonome)).

| Fichier | ID plan | Statut |
|---------|----------|--------|
| `r1-visitor.spec.ts` | **R1** | Actif — landing + lien `/health` |
| `r2-auth.spec.ts` | **R2** | `test.skip` — routes auth App Router à ajouter |
| `r3-cgu.spec.ts` | **R3** | `test.skip` — modale CGU à brancher |
| `r4-feed.spec.ts` | **R4** | Actif — bloc feed SSR (succès **ou** erreur si `API_URL` injoignable) |
| `r5-messages.spec.ts` | **R5** | `test.skip` — messages / chat non livrés |
| `r6-admin-mentor.spec.ts` | **R6** | `test.skip` — dashboards mentor / admin non livrés |

## Commandes

```bash
# depuis la racine du monorepo
pnpm --filter web run test:e2e:install        # Chromium (machine locale, sans sudo)
pnpm --filter web run test:e2e:install:ci     # CI GitHub : Chromium + dépendances système (`--with-deps`)
pnpm --filter web run build
CI=true pnpm --filter web run test:e2e       # même ordre que la CI (build déjà fait si vous enchaînez)
```

En **local**, `playwright.config` peut lancer `build` puis le serveur **standalone** sur le port **3005** (évite d’accrocher le `pnpm dev` du port 3000). Surcharge : `E2E_PORT=3010`.

## Données et `API_URL`

La page d’accueil appelle le feed côté serveur (`fetchFeed`). Sans API sur `API_URL` (défaut `http://127.0.0.1:4000`), le bloc feed affiche une **erreur** : les specs **R4** acceptent **liste ou erreur** tant que le panneau feed est visible.

Pour valider un JSON feed réel en local : démarrer `apps/api` et exporter `API_URL` avant `test:e2e` (voir [plan Web/API](../../Docs/plan-mise-en-place-web-api-donnees.md)).

## Auth de test

Aucun bypass d’auth en production. Quand des parcours **R2** / **R3** seront implémentés, documenter ici un mécanisme **hors prod** (`E2E=1`, cookie de test, etc.) aligné avec le plan Web/API.

## Dépannage (Linux / WSL)

Si le navigateur Playwright refuse de démarrer (ex. **`libnspr4.so: cannot open shared object file`**), installer les dépendances système :

```bash
pnpm --filter web exec playwright install-deps
```

(certaines distributions exigent **sudo**.) Sur **GitHub Actions**, l’étape `test:e2e:install:ci` installe déjà Chromium **avec** `--with-deps`.
