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
pnpm --filter web run build   # inclut prepare-standalone (.next/static + public → bundle standalone)
CI=true pnpm --filter web run test:e2e
```

Le serveur E2E (`playwright.config.ts`) utilise le bundle **standalone** : sans copie des assets statiques, l’hydratation React échoue (chunks `/_next/static` en **404**). Voir `scripts/prepare-standalone.mjs` (aligné `infra/docker/Dockerfile.web`).

Séquence complète **gate L** (V + T + P) depuis la racine :

```bash
# Une fois sur WSL si Chromium échoue (libnspr4.so) :
sudo pnpm --filter web exec playwright install-deps chromium

./scripts/gate-l-kit-ux.sh
```

## WSL / Linux (dépendances système)

Si les tests échouent au lancement de Chromium avec `libnspr4.so: cannot open shared object file` :

```bash
sudo pnpm --filter web exec playwright install-deps chromium
```

Alternative équivalente (Debian/Ubuntu/WSL) :

```bash
sudo apt-get update
sudo apt-get install -y \
  libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
```

Puis rejouer `CI=true pnpm --filter web run test:e2e` (attendu : **9 passed**).

## CGU

Clé `localStorage` : `allaboard-cgu-accepted` = `"1"`. Les specs R1, R2, R4–R6 pré-acceptent via `addInitScript` ; **R3** réinitialise pour tester la modale.

## Auth de test

Login `/login` : cookie démo `allaboard-session` (hors prod, pas de backend auth métier).
