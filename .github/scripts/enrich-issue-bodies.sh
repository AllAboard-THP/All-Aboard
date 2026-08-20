#!/usr/bin/env bash
# Enrich GitHub issue bodies with doc links + succinct task details.
set -eu

REPO="AllAboard-THP/All-Aboard"
BASE="https://github.com/AllAboard-THP/All-Aboard/blob/Dev"

update() {
  local n="$1"
  local file="$2"
  gh issue edit "$n" -R "$REPO" --body-file "$file"
  echo "OK #$n"
}

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# --- #13 Epic Phase 2 ---
cat > "$TMP/13.md" <<EOF
## Objectif
Livrer la **Phase 2** : auth, persistance Postgres, parcours minimal « demande d'aide » (création + consultation feed).

## Détail succinct
- Trancher l'auth (ADR) puis API + web alignés sur le parcours produit MOC.
- Trois pistes en parallèle : Frontend (#15), Backend (#16), Platform (#17).
- Ne pas toucher \`apps/thp-final\` sauf inspiration UX.

## Documentation
- [Timeline MVP & phases](${BASE}/Docs/README.md)
- [Parcours utilisateur (MOC)](${BASE}/Docs/moc-parcours-utilisateur.md)
- [Plan Web ↔ API](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [Pilotage Project](${BASE}/.github/PROJECT.md)

## Epics enfants
- [ ] #15 Frontend — UI/UX
- [ ] #16 Backend — API
- [ ] #17 Platform — Staging
EOF
update 13 "$TMP/13.md"

cat > "$TMP/15.md" <<EOF
## Objectif
Tout le **visible** dans \`apps/web\` : design system, navigation, pages produit, BFF Next, TanStack côté client.

## Détail succinct
- SSR via \`API_URL\` pour données initiales ; client via BFF \`/api/*\` (same-origin).
- Design system monorepo : [#24](https://github.com/${REPO}/issues/24) (\`packages/ui\` + \`apps/storybook\`).
- S'inspirer de \`apps/thp-final\` pour l'UX, sans porter le code Rails.

## Documentation
- [Doc #24 design system](${BASE}/Docs/tasks/24-design-system-monorepo/README.md)
- [Plan opérationnel Web/API](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [Parcours utilisateur](${BASE}/Docs/moc-parcours-utilisateur.md)

## Tâches
- [ ] #24 DS monorepo + Storybook (bases)
- [ ] #25 Shell navigation & layout
- [ ] #26 Page feed réelle
- [ ] #27 Formulaire création demande
- [ ] #28 Page détail demande
- [ ] #29 Dashboard mentor
- [ ] #30 États UX
- [ ] #36 TanStack hors home
EOF
update 15 "$TMP/15.md"

cat > "$TMP/16.md" <<EOF
## Objectif
\`apps/api\` : auth, **Postgres**, endpoints métier, tests de contrat alignés sur \`packages/types\`.

## Détail succinct
- Remplacer le mock \`GET /feed\` par la DB.
- CRUD demandes d'aide + middleware auth (post-ADR #18).
- Une PR = api + types + tests (+ web si contrat change).

## Documentation
- [README — Phase 2](${BASE}/Docs/README.md)
- [Contrat GET /feed](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [Matrice variables auth](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md) — \`JWT_SECRET\`, \`DATABASE_URL\`
- [Types partagés](${BASE}/packages/types/src/index.ts)

## Chemins code existants
- \`apps/api/src/\` — Fastify, \`/health\`, \`/feed\` mock

## Tâches
- [ ] #18 ADR auth
- [ ] #19 Postgres + feed DB
- [ ] #20 POST /help-requests
- [ ] #21 Middleware auth
- [ ] #22 Doublon & stub Rubberduck
- [ ] #23 CORS (Phase 3)
EOF
update 16 "$TMP/16.md"

cat > "$TMP/17.md" <<EOF
## Objectif
**Exploitation** : Postgres branché en dev, promotion staging, smoke et e2e — sans bloquer les dev produit.

## Détail succinct
- Rester sur env **dev** jusqu'au MVP bout-en-bout ([To-do](${BASE}/Docs/To-do.md)).
- Préparer staging **sans déployer** tant que la checklist n'est pas validée.
- Documenter les smokes dans le journal du plan opérationnel.

## Documentation
- [To-do — promotion staging](${BASE}/Docs/To-do.md)
- [Instance Dokploy](${BASE}/Docs/deploiement-dokploy-instance-allaboard.md) — domaines, \`API_URL\`
- [Matrice déploiement](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md)
- [AGENTS.md — \`pnpm verify\`](${BASE}/AGENTS.md)

## Tâches
- [ ] #31 Checklist dev→staging
- [ ] #32 Env staging Dokploy
- [ ] #33 DATABASE_URL dev
- [ ] #34 Smoke post-déploiement
- [ ] #35 Playwright e2e
EOF
update 17 "$TMP/17.md"

cat > "$TMP/18.md" <<EOF
## Objectif
Rédiger un **ADR** dans le dépôt avant toute implémentation auth web + API.

## Détail succinct
Trancher : session cookies httpOnly vs JWT Bearer ; intégration **BFF Next** vs appel direct API ; impact \`credentials\` TanStack ; variables Dokploy (\`JWT_SECRET\`, \`SESSION_SECRET\`).

## Documentation
- [README — Phase 2 auth](${BASE}/Docs/README.md)
- [Matrice auth / sécurité](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md)
- [Plan Web/API — auth cross-origin](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)

## Critères d'acceptation
- [ ] Fichier ADR dans le dépôt (ex. \`Docs/adr/\`)
- [ ] Décision revue par l'équipe (3 dev)
- [ ] Issues #21, #27 débloquées conceptuellement

## Bloque
#21 (middleware auth), #27 (formulaire authentifié)
EOF
update 18 "$TMP/18.md"

cat > "$TMP/19.md" <<EOF
## Objectif
Remplacer \`mockFeed\` par des données **Postgres** ; \`GET /feed\` retourne un feed réel.

## Détail succinct
- Schéma minimal \`HelpRequest\` + migration.
- Aligner \`packages/types\`, parsing web, **tests API**.
- Contrat inchangé : \`{ items: HelpRequest[] }\`.

## Documentation
- [Contrat GET /feed](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [Types HelpRequest](${BASE}/packages/types/src/index.ts)
- [#33 Postgres dev](https://github.com/AllAboard-THP/All-Aboard/issues/33) — prérequis infra

## Chemins code
- \`apps/api/src/\` (mock actuel)
- \`apps/web/lib/api-server.ts\` — \`parseFeedResponse\`

## Critères d'acceptation
- [ ] \`GET /feed\` lit la DB
- [ ] Tests Vitest feed
- [ ] \`pnpm verify\` OK

## Dépend de
#33 (DATABASE_URL)
EOF
update 19 "$TMP/19.md"

cat > "$TMP/20.md" <<EOF
## Objectif
Endpoint **POST /help-requests** : création d'une demande d'aide persistée.

## Détail succinct
- Validation entrée ; champs MOC minimum : titre, auteur, tags (mentor / domaine).
- Types partagés + test contrat.
- Préparer le branchement web (#27) via BFF.

## Documentation
- [Parcours MOC — création demande](${BASE}/Docs/moc-parcours-utilisateur.md)
- [Types](${BASE}/packages/types/src/index.ts)

## Critères d'acceptation
- [ ] POST documenté (shape JSON stable)
- [ ] Erreurs 4xx explicites
- [ ] Tests d'intégration

## Dépend de
#19 (feed/DB), #21 (auth)
EOF
update 20 "$TMP/20.md"

cat > "$TMP/21.md" <<EOF
## Objectif
**Middleware auth Fastify** protégeant les routes métier selon l'ADR #18.

## Détail succinct
- Routes publiques vs authentifiées explicites.
- Tests d'intégration auth (token/session selon ADR).
- Pas de secrets en dur — variables matrice Dokploy.

## Documentation
- [ADR auth](#18) (à merger avant implémentation)
- [Matrice JWT / session](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md)

## Critères d'acceptation
- [ ] Middleware branché sur routes métier
- [ ] Tests auth passants
- [ ] Doc ADR référencée dans la PR

## Dépend de
#18 (ADR)
EOF
update 21 "$TMP/21.md"

cat > "$TMP/22.md" <<EOF
## Objectif
Logique métier MOC étapes 3–5 : **doublon**, routage **Rubberduck** (stub), publication + tags.

## Détail succinct
- Doublon détecté → signal API pour redirect UI.
- IA « simple » → stub (pas d'\`apps/agent\` en Phase 2).
- Sinon : publication feed + tags mentor/domaine.

## Documentation
- [Parcours utilisateur — flux décision](${BASE}/Docs/moc-parcours-utilisateur.md)
- [Vision Agent — Phase 4](${BASE}/Docs/vision/README.md) (hors scope immédiat)

## Critères d'acceptation
- [ ] Règles heuristiques documentées dans la PR
- [ ] Tests cas doublon / stub IA
- [ ] Pas de dépendance à \`apps/agent\`

## Dépend de
#20 (POST help-requests)
EOF
update 22 "$TMP/22.md"

cat > "$TMP/23.md" <<EOF
## Objectif
Implémenter \`CORS_ALLOWED_ORIGINS\` sur l'API Fastify (documenté mais absent du code).

## Détail succinct
- Nécessaire quand le **navigateur** appellera \`https://api-*.allaboard.fr\` directement.
- Le flux feed **home** reste BFF same-origin — CORS non requis pour ce cas.
- Phase 3 résiduelle ; après parcours core (#27).

## Documentation
- [Matrice CORS](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md)
- [Plan opérationnel — BFF vs public API](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [Instance Dokploy — domaines API](${BASE}/Docs/deploiement-dokploy-instance-allaboard.md)

## Critères d'acceptation
- [ ] CORS configurable par env
- [ ] Test ou smoke documenté
- [ ] Journal plan opérationnel mis à jour si comportement change
EOF
update 23 "$TMP/23.md"

cat > "$TMP/24.md" <<EOF
## Objectif

**Fondation design system monorepo** : \`packages/ui\` + \`apps/storybook\` + branchement minimal \`apps/web\`.

## Checklist

- [ ] \`packages/ui\` (tokens, tailwind, \`components.json\`)
- [ ] \`apps/storybook\` (SB 8.4 Vite, stories colocalisées dans ui)
- [ ] \`turbo.json\` : exclusion stories + \`build:storybook\`
- [ ] \`apps/web\` : workspace dep, transpile, tailwind content ui
- [ ] Button shadcn + story tokens · \`pnpm verify\` vert

## Documentation

- [Doc #24](${BASE}/Docs/tasks/24-design-system-monorepo/README.md)
- [Plan Web/API](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)

## Hors scope

Shell → #25 · migration features complète · ESLint/CI SB → PRs suivantes
EOF
update 24 "$TMP/24.md"

cat > "$TMP/25.md" <<EOF
## Objectif
**Shell** App Router : navigation, header, zones public / authentifié.

## Détail succinct
- S'appuie sur #24 (\`@allaboard/ui\`).
- Structure routes feed, création, détail, mentor.

## Documentation
- [Parcours MOC](${BASE}/Docs/moc-parcours-utilisateur.md)
- [\`apps/web/app/layout.tsx\`](${BASE}/apps/web/app/layout.tsx)

## Critères d'acceptation
- [ ] Nav entre pages stub ou réelles
- [ ] Layout responsive minimal · landmarks / focus
EOF
update 25 "$TMP/25.md"

cat > "$TMP/26.md" <<EOF
## Objectif
Page **feed réelle** : SSR liste \`HelpRequest\` depuis l'API (plus la démo marketing seule).

## Détail succinct
- Conserver \`fetchFeed\` + \`HomeContent\` ; données métier.
- SSR via \`API_URL\` ; refresh client via BFF \`/api/feed\` + TanStack.
- \`revalidate: 60\` conservé sauf ADR contraire.

## Documentation
- [Plan opérationnel — chemins code feed](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [\`apps/web/app/page.tsx\`](${BASE}/apps/web/app/page.tsx)
- [\`apps/web/components/home-content.tsx\`](${BASE}/apps/web/components/home-content.tsx)

## Critères d'acceptation
- [ ] Feed affiche données API réelles (#19)
- [ ] Bouton Rafraîchir / invalidation OK
- [ ] États erreur API gérés

## Dépend de
#19 (feed DB)
EOF
update 26 "$TMP/26.md"

cat > "$TMP/27.md" <<EOF
## Objectif
**Formulaire création** demande d'aide : UI + \`useMutation\` + BFF POST.

## Détail succinct
- Champs alignés MOC ; validation côté client + erreurs API.
- Succès → redirection détail ou feed.
- Auth selon ADR (#21).

## Documentation
- [Parcours — étape création](${BASE}/Docs/moc-parcours-utilisateur.md)
- [Plan Web/API — conventions TanStack](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [Types HelpRequest](${BASE}/packages/types/src/index.ts)

## Critères d'acceptation
- [ ] BFF \`POST /api/help-requests\` (ou équivalent)
- [ ] \`useMutation\` + invalidation feed si pertinent
- [ ] Tests composant ou e2e léger

## Dépend de
#20 (API POST), #21 (auth)
EOF
update 27 "$TMP/27.md"

cat > "$TMP/28.md" <<EOF
## Objectif
Page **détail** d'une demande : thread, réponses en **lecture seule** (MVP).

## Détail succinct
- Route dynamique \`/help-requests/[id]\` (ou équivalent).
- Affichage réponses filtrées (MVP : liste simple).
- Préparer extension POST réponse (hors scope si non priorisé).

## Documentation
- [Parcours MOC — feed demande & réponses](${BASE}/Docs/moc-parcours-utilisateur.md)
- [Types Response](${BASE}/packages/types/src/index.ts)

## Critères d'acceptation
- [ ] Page SSR ou hybride avec données API
- [ ] États vide / erreur / loading (#30)
- [ ] Lien depuis feed et post-création

## Dépend de
#27 (création)
EOF
update 28 "$TMP/28.md"

cat > "$TMP/29.md" <<EOF
## Objectif
**Dashboard mentor** (MVP) : liste des demandes à traiter — parcours Alice.

## Détail succinct
- Read-only acceptable en première itération.
- Aligné notifications / tags MOC.
- Auth rôle mentor (selon ADR #18).

## Documentation
- [Parcours MOC — Alice mentor](${BASE}/Docs/moc-parcours-utilisateur.md)
- [Inspiration \`apps/thp-final\` mentor](${BASE}/apps/thp-final/)

## Critères d'acceptation
- [ ] Route protégée mentor
- [ ] Liste filtrée (tags / statut)
- [ ] Navigation vers détail demande

## Dépend de
#21 (auth)
EOF
update 29 "$TMP/29.md"

cat > "$TMP/30.md" <<EOF
## Objectif
Composants **transverses** : loading, erreur, liste vide.

## Détail succinct
- Primitives (Alert, Skeleton) → \`packages/ui\` si besoin (#24).
- Compositions métier → \`apps/web/components/features/\`.

## Documentation
- [\`feed-client-preview.tsx\`](${BASE}/apps/web/components/feed-client-preview.tsx)

## Critères d'acceptation
- [ ] 3 variantes documentées · utilisées sur 2+ pages
EOF
update 30 "$TMP/30.md"

cat > "$TMP/31.md" <<EOF
## Objectif
Formaliser la **checklist promotion dev → staging** dans la doc et l'équipe.

## Détail succinct
- Compléter [To-do.md](${BASE}/Docs/To-do.md) avec critères mesurables.
- Inclure smoke HTTPS \`staging.allaboard.fr\` / \`api-staging.allaboard.fr\`.
- Aucun déploiement prod sans validation staging complète.

## Documentation
- [To-do — checklist promotion](${BASE}/Docs/To-do.md)
- [Instance Dokploy — env staging](${BASE}/Docs/deploiement-dokploy-instance-allaboard.md)
- [Matrice déploiement](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md)

## Critères d'acceptation
- [ ] Checklist revue et commitée dans \`Docs/To-do.md\`
- [ ] Validée par les 3 dev
- [ ] Liée au Project (champ Vague V4)
EOF
update 31 "$TMP/31.md"

cat > "$TMP/32.md" <<EOF
## Objectif
Préparer l'environnement **staging Dokploy** (variables, domaines, healthchecks) **sans déployer**.

## Détail succinct
- Domaines : \`staging.allaboard.fr\`, \`api-staging.allaboard.fr\`.
- Variables alignées matrice ; branches \`staging\` sur Web/API.
- Documenter les écarts vs dev dans la fiche instance.

## Documentation
- [Instance Dokploy](${BASE}/Docs/deploiement-dokploy-instance-allaboard.md)
- [Matrice variables](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md)
- [To-do](${BASE}/Docs/To-do.md)

## Critères d'acceptation
- [ ] Liste variables staging complète (sans secrets dans le repo)
- [ ] Healthchecks documentés
- [ ] Pas de deploy staging tant que checklist #31 ouverte
EOF
update 32 "$TMP/32.md"

cat > "$TMP/33.md" <<EOF
## Objectif
Brancher l'**API** sur **Postgres dev** Dokploy via \`DATABASE_URL\`.

## Détail succinct
- Hôte interne Postgres même projet Dokploy (port 5432).
- Débloque #19 (feed depuis DB).
- Une ligne dans le *Journal* du plan opérationnel après validation smoke.

## Documentation
- [Instance Dokploy — Postgres](${BASE}/Docs/deploiement-dokploy-instance-allaboard.md)
- [Matrice DATABASE_URL](${BASE}/Docs/matrice-deploiement-dokploy-coolify.md)
- [Journal smoke — plan opérationnel](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)

## Critères d'acceptation
- [ ] API démarre avec \`DATABASE_URL\` en dev Dokploy
- [ ] Migration initiale appliquée
- [ ] Journal mis à jour (date + env)
EOF
update 33 "$TMP/33.md"

cat > "$TMP/34.md" <<EOF
## Objectif
**Script smoke** post-déploiement dev : vérifier Web + API après merge.

## Détail succinct
- Endpoints : \`/health\` web & api, \`GET /feed\`, \`GET /api/feed\` (HTTPS dev).
- Intégrable CI ou cron manuel.
- Aligné sur journal existant du plan opérationnel.

## Documentation
- [Journal smoke dev](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [Domaines dev](${BASE}/Docs/deploiement-dokploy-instance-allaboard.md)

## Critères d'acceptation
- [ ] Script exécutable (bash ou \`pnpm\`)
- [ ] Exit code non-zéro si échec
- [ ] Documenté dans \`.github/PROJECT.md\` ou plan opérationnel
EOF
update 34 "$TMP/34.md"

cat > "$TMP/35.md" <<EOF
## Objectif
Setup **Playwright** e2e : parcours critique home feed + création demande.

## Détail succinct
- Smoke e2e sur \`dev.allaboard.fr\` ou local CI.
- Dépend du parcours minimal #27.
- Vision long terme : [proposition stack](${BASE}/Docs/proposition-stack-technique-monorepo-2026.md).

## Documentation
- [Proposition stack — e2e Playwright](${BASE}/Docs/proposition-stack-technique-monorepo-2026.md)
- [AGENTS.md — verify](${BASE}/AGENTS.md)
- [Plan opérationnel](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)

## Critères d'acceptation
- [ ] \`apps/web/tests-e2e/\` ou équivalent
- [ ] Au moins 1 scénario feed + 1 scénario création
- [ ] Job CI optionnel documenté
EOF
update 35 "$TMP/35.md"

cat > "$TMP/36.md" <<EOF
## Objectif
Étendre **TanStack Query** hors home : \`queryKey\`, mutations, \`credentials\` si cross-origin.

## Détail succinct
- Phase 3 résiduelle ([README](${BASE}/Docs/README.md)).
- Home déjà livrée : \`['feed']\`, BFF, \`invalidateQueries\`.
- ADR requise si fetch client direct vers API HTTPS.

## Documentation
- [README — Phase 3](${BASE}/Docs/README.md)
- [Plan opérationnel — conventions Query](${BASE}/Docs/plan-mise-en-place-web-api-donnees.md)
- [#23 CORS](https://github.com/AllAboard-THP/All-Aboard/issues/23) si cross-origin

## Critères d'acceptation
- [ ] Conventions \`queryKey\` documentées
- [ ] Au moins une mutation hors home
- [ ] Tests client mis à jour

## Dépend de
#27 (parcours core)
EOF
update 36 "$TMP/36.md"

cat > "$TMP/37.md" <<EOF
## Objectif
Epic **Phase 4** : \`apps/agent\` (Rubberduck), \`apps/indexer\`, files d'attente — **backlog**.

## Détail succinct
- Code absent du repo ; services Dokploy **désactivés**.
- Ne pas démarrer sans **ADR** dédiée.
- Stub IA possible en Phase 2 via #22.

## Documentation
- [Vision long terme](${BASE}/Docs/vision/README.md)
- [Dataflow cible](${BASE}/Docs/dataflow-architecture.md)
- [Proposition stack 2026](${BASE}/Docs/proposition-stack-technique-monorepo-2026.md)
- [Instance Dokploy — Agent/Indexer](${BASE}/Docs/deploiement-dokploy-instance-allaboard.md)

## Statut
**Triage** — hors MVP Phase 2.
EOF
update 37 "$TMP/37.md"

echo "All issues updated."
