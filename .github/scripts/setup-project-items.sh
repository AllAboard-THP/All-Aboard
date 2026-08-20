#!/usr/bin/env bash
# Bootstrap GitHub Project items with custom fields (All-Aboard MVP).
# Requires: gh CLI, active account with `project` scope, org AllAboard-THP.
set -eu

OWNER="AllAboard-THP"
REPO="All-Aboard"
PROJECT_NUM=3
PROJECT_ID="PVT_kwDOEMpxOM4BXlc_"

FIELD_PILIER="PVTSSF_lADOEMpxOM4BXlc_zhSxU94"
FIELD_PHASE="PVTSSF_lADOEMpxOM4BXlc_zhSxU-Y"
FIELD_PRIO="PVTSSF_lADOEMpxOM4BXlc_zhSxU_Q"
FIELD_TAILLE="PVTSSF_lADOEMpxOM4BXlc_zhSxU_U"

# Pilier options
P_FRONTEND="df612fcc"
P_BACKEND="f97d403a"
P_PLATFORM="3066bde5"
P_TRANSVERSE="b4d8bed6"

# Phase options
PH_0="0f737392"
PH_1="1870ea2d"
PH_2="6c1ca402"
PH_3="51b29896"
PH_4="6c0f4db6"
PH_OPS="782d4626"

# Priority options
PR_P0="a31f53e8"
PR_P1="a651224e"
PR_P2="e33f9d26"
PR_P3="f544a0ab"

# Taille options
SZ_XS="84f7f715"
SZ_S="56afa3b6"
SZ_M="72ae29cf"
SZ_L="d3963764"
SZ_XL="0fa0e3ee"

add_to_project() {
  local url="$1"
  gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$url" --format json
}

set_select() {
  local item_id="$1"
  local field_id="$2"
  local option_id="$3"
  gh project item-edit \
    --id "$item_id" \
    --project-id "$PROJECT_ID" \
    --field-id "$field_id" \
    --single-select-option-id "$option_id" >/dev/null
}

create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  local url number
  url=$(gh issue create -R "$OWNER/$REPO" --title "$title" --body "$body" --label "$labels")
  number=${url##*/}
  printf '{"number":%s,"url":"%s"}\n' "$number" "$url"
}

process_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"
  local pilier="$4"
  local phase="$5"
  local prio="$6"
  local taille="$7"

  local issue_json item_json item_id
  issue_json=$(create_issue "$title" "$body" "$labels")
  local url
  url=$(echo "$issue_json" | jq -r .url)
  item_json=$(add_to_project "$url")
  item_id=$(echo "$item_json" | jq -r .id)
  set_select "$item_id" "$FIELD_PILIER" "$pilier"
  set_select "$item_id" "$FIELD_PHASE" "$phase"
  set_select "$item_id" "$FIELD_PRIO" "$prio"
  set_select "$item_id" "$FIELD_TAILLE" "$taille"
  echo "OK #$(echo "$issue_json" | jq -r .number) — $title"
}

# --- Epics ---
# Epic Phase 2 déjà créée (#13) — voir setup initial 2026-05-13

process_issue \
  "[Epic] Frontend — UI/UX & apps/web" \
  "Design system, pages produit, BFF Next, TanStack Query côté client.

Réf. : Docs/plan-mise-en-place-web-api-donnees.md, apps/thp-final (inspiration UX uniquement)." \
  "type:epic,phase:2,priority:p1,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P1" "$SZ_XL"

process_issue \
  "[Epic] Backend — API, données & auth" \
  "apps/api : auth, Postgres, endpoints métier, tests contrat.

Réf. : packages/types, Docs/README Phase 2." \
  "type:epic,phase:2,priority:p1,pilier:backend" \
  "$P_BACKEND" "$PH_2" "$PR_P1" "$SZ_XL"

process_issue \
  "[Epic] Platform — Staging, CI/CD & intégration" \
  "Promotion dev→staging, Postgres branché, smoke, e2e.

Réf. : Docs/To-do.md, deploiement-dokploy-instance-allaboard.md." \
  "type:epic,phase:ops,priority:p1,pilier:platform" \
  "$P_PLATFORM" "$PH_OPS" "$PR_P1" "$SZ_L"

# --- Phase 2 — Transverse / ADR ---
process_issue \
  "ADR — Stratégie d'authentification (session vs JWT)" \
  "Rédiger un ADR dans le dépôt avant implémentation auth.

**À trancher** : cookies httpOnly vs Bearer, intégration web BFF, CORS futur, variables matrice Dokploy (JWT_SECRET, SESSION_SECRET).

**Bloque** : login web + middleware API." \
  "type:adr,phase:2,priority:p0,pilier:transverse" \
  "$P_TRANSVERSE" "$PH_2" "$PR_P0" "$SZ_M"

# --- Backend tasks ---
process_issue \
  "API — Brancher Postgres et remplacer le mock /feed" \
  "Remplacer mockFeed par données persistées.

- Schéma initial (HelpRequest minimum)
- GET /feed depuis DB
- Aligner packages/types + tests

Réf. plan opérationnel : contrat GET /feed." \
  "type:task,phase:2,priority:p0,pilier:backend" \
  "$P_BACKEND" "$PH_2" "$PR_P0" "$SZ_L"

process_issue \
  "API — POST /help-requests (création demande)" \
  "Endpoint création + validation + types partagés.

Inclure champs minimum pour le MOC (titre, auteur, tags)." \
  "type:task,phase:2,priority:p1,pilier:backend" \
  "$P_BACKEND" "$PH_2" "$PR_P1" "$SZ_M"

process_issue \
  "API — Middleware auth Fastify" \
  "Protéger les routes métier selon l'ADR auth.

Inclure tests d'intégration auth." \
  "type:task,phase:2,priority:p0,pilier:backend" \
  "$P_BACKEND" "$PH_2" "$PR_P0" "$SZ_M"

process_issue \
  "API — Détection doublon & routage IA (stub Rubberduck)" \
  "Logique MOC étapes 3–5 : doublon → redirect ; IA simple → stub ; sinon publication + tags.

Peut commencer par règles heuristiques simples." \
  "type:task,phase:2,priority:p2,pilier:backend" \
  "$P_BACKEND" "$PH_2" "$PR_P2" "$SZ_L"

process_issue \
  "API — Implémenter CORS_ALLOWED_ORIGINS" \
  "Documenté dans matrice déploiement mais absent du code.

Nécessaire quand le navigateur appellera l'API HTTPS directement (Phase 3 résiduelle)." \
  "type:task,phase:3,priority:p2,pilier:backend" \
  "$P_BACKEND" "$PH_3" "$PR_P2" "$SZ_S"

# --- Frontend tasks ---
process_issue \
  "Web — Design system Tailwind (foundation)" \
  "Tokens, composants de base, layout réutilisable.

Branche de référence : feature/ui-tailwind-foundation (si applicable)." \
  "type:task,phase:2,priority:p1,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P1" "$SZ_L"

process_issue \
  "Web — Shell navigation & layout App Router" \
  "Structure pages, header/nav, zones authentifié vs public." \
  "type:task,phase:2,priority:p1,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P1" "$SZ_M"

process_issue \
  "Web — Page feed réelle (SSR + liste)" \
  "Remplacer la démo par feed métier ; conserver pattern fetchFeed + HomeContent.

Réf. apps/web/app/page.tsx, lib/api-server.ts." \
  "type:task,phase:2,priority:p1,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P1" "$SZ_M"

process_issue \
  "Web — Formulaire création demande d'aide" \
  "UI création + useMutation + BFF POST proxy.

États : validation, erreur API, succès → détail ou feed." \
  "type:task,phase:2,priority:p1,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P1" "$SZ_M"

process_issue \
  "Web — Page détail demande & réponses" \
  "Affichage thread, consommation réponses (lecture seule MVP)." \
  "type:task,phase:2,priority:p2,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P2" "$SZ_M"

process_issue \
  "Web — Dashboard mentor (MVP)" \
  "Liste demandes notifiées / à traiter — aligné MOC Alice.

Peut être read-only au début." \
  "type:task,phase:2,priority:p2,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P2" "$SZ_L"

process_issue \
  "Web — États UX (loading, erreur, vide)" \
  "Composants transverses pour listes et formulaires." \
  "type:task,phase:2,priority:p2,pilier:frontend" \
  "$P_FRONTEND" "$PH_2" "$PR_P2" "$SZ_S"

# --- Platform tasks ---
process_issue \
  "Ops — Formaliser checklist promotion dev → staging" \
  "Compléter Docs/To-do.md et valider avec l'équipe.

Inclure smoke HTTPS staging.allaboard.fr." \
  "type:task,phase:ops,priority:p1,pilier:platform" \
  "$P_PLATFORM" "$PH_OPS" "$PR_P1" "$SZ_M"

process_issue \
  "Ops — Préparer env staging Dokploy (sans déployer)" \
  "Variables, domaines, healthchecks — voir deploiement-dokploy-instance-allaboard.md." \
  "type:task,phase:ops,priority:p1,pilier:platform" \
  "$P_PLATFORM" "$PH_OPS" "$PR_P1" "$SZ_M"

process_issue \
  "Ops — DATABASE_URL API sur Postgres dev Dokploy" \
  "Brancher l'API sur la base managée ; documenter dans journal plan opérationnel." \
  "type:task,phase:ops,priority:p0,pilier:platform" \
  "$P_PLATFORM" "$PH_2" "$PR_P0" "$SZ_M"

process_issue \
  "Ops — Script smoke post-déploiement (dev)" \
  "Vérifier /health web+api, /feed, /api/feed après merge." \
  "type:task,phase:ops,priority:p2,pilier:platform" \
  "$P_PLATFORM" "$PH_OPS" "$PR_P2" "$SZ_S"

process_issue \
  "Ops — Setup Playwright e2e (parcours critique)" \
  "Smoke e2e : home feed + création demande (quand dispo).

Réf. vision stack proposition-stack-technique-monorepo-2026.md." \
  "type:task,phase:ops,priority:p2,pilier:platform" \
  "$P_PLATFORM" "$PH_OPS" "$PR_P2" "$SZ_L"

# --- Phase 3 / 4 backlog ---
process_issue \
  "Web — Étendre TanStack Query hors home (mutations)" \
  "Conventions queryKey, invalidation, credentials si auth cross-origin.

Réf. README Phase 3 résiduelle." \
  "type:task,phase:3,priority:p2,pilier:frontend" \
  "$P_FRONTEND" "$PH_3" "$PR_P2" "$SZ_M"

process_issue \
  "[Epic] Phase 4 — Agent Rubberduck & Indexer" \
  "apps/agent, apps/indexer absents du repo ; Dokploy désactivé.

Voir Docs/vision/README.md — ne pas démarrer sans ADR." \
  "type:epic,phase:4,priority:p3,pilier:platform" \
  "$P_PLATFORM" "$PH_4" "$PR_P3" "$SZ_XL"

echo ""
echo "Done. Project: https://github.com/orgs/AllAboard-THP/projects/$PROJECT_NUM"
