# Graph Report - .  (2026-05-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1292 nodes · 1536 edges · 108 communities (98 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d192bcb6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 27 edges
2. `compilerOptions` - 18 edges
3. `getApiBaseUrl()` - 17 edges
4. `helpRequest` - 14 edges
5. `helpRequest` - 14 edges
6. `Plan opérationnel — Web, API, données (SSR, env, TanStack Query)` - 14 edges
7. `compilerOptions` - 13 edges
8. `mentor` - 12 edges
9. `mentor` - 12 edges
10. `Button()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `fetchFeed()` --calls--> `HomePage()`  [EXTRACTED]
  lib/api-server.ts → app/[locale]/(app)/page.tsx
- `fetchHelpRequest()` --calls--> `HelpRequestDetailPage()`  [EXTRACTED]
  lib/api-server.ts → app/[locale]/(app)/requests/[id]/page.tsx
- `formatDateTime()` --calls--> `FeedItemCard()`  [EXTRACTED]
  lib/format-datetime.ts → components/features/home-content.tsx
- `usePathname` --calls--> `AppShellNav()`  [INFERRED]
  tests/app-shell-nav.test.tsx → components/features/app-shell-nav.tsx
- `usePathname` --calls--> `LocaleSwitcher()`  [INFERRED]
  tests/app-shell-nav.test.tsx → components/features/locale-switcher.tsx

## Communities (108 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (49): GET(), GET(), HomePage(), HelpRequestDetailClient(), Props, HelpRequestDetailContent(), Props, CreateResult (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (48): authenticateWithDatabase(), authenticateWithMvpFallback(), isMvpPasswordFallbackEnabled(), LEGACY_USER_EMAIL, LoginBody, loginBodySchema, LoginSuccess, resolveLoginEmail() (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (28): Providers(), AppShell(), AppShellProps, APP_SHELL_NAV, AppShellNav(), FeedClientPreview(), LocaleSwitcher(), { Link, redirect, usePathname, useRouter, getPathname } (+20 more)

### Community 3 - "Community 3"
Cohesion: 0.04
Nodes (44): dependencies, class-variance-authority, clsx, lucide-react, next-themes, radix-ui, @radix-ui/react-slot, sonner (+36 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (38): dependencies, @allaboard/types, argon2, drizzle-orm, fastify, @fastify/cookie, @fastify/cors, @fastify/jwt (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): dependencies, @allaboard/types, @allaboard/ui, next, next-intl, react, react-dom, @tanstack/react-query (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (30): Architecture minimale, ARCHIVE — Plan d'initialisation Turborepo (MVP All-Aboard), Checklist de suivi d'avancement, CI MVP, CI MVP, code:text (all-aboard/), Etape A - Initialiser le workspace, Etape A - Initialiser le workspace (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (25): Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectTrigger(), SelectValue(), Default (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (26): Alignement `.env.example`, Avant PR (garde-fous), BFF Next (`apps/web` — same-origin), Checklist Dokploy (feed / Web–API), Chemins code, code:json ({ "items": [{ "id": "uuid", "title": "…", "authorId": "bob",), code:bash (# Dev HTTPS (Dokploy)), Codes d’erreur communs (corps JSON) (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (22): Alert(), AlertDescription(), AlertTitle(), alertVariants, AllVariants, ConnexionRequise, Default, Destructive (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (20): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), Default (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (16): Label(), Default, Disabled, Invalid, Story, WithLabel, textarea, Textarea() (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.09
Nodes (21): Agent IA et pipeline asynchrone, Architecture monorepo recommandee (complete), Backend et data, Bonnes pratiques de structuration (2026++), Choix de stack recommandes (2026), code:text (all-aboard/), code:json ({), Contexte (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (19): devDependencies, @allaboard/config-eslint, @allaboard/config-typescript, eslint, typescript, exports, import, main (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.10
Nodes (19): compilerOptions, composite, declaration, declarationMap, esModuleInterop, isolatedModules, lib, module (+11 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (14): Button(), buttonVariants, button, Separator(), separator, FeedEmpty, MentorFeedEmpty, NotFound (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (14): Skeleton(), Default, FeedItemPlaceholder, Story, Default, HoverFocus, Story, WithoutTags (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (17): dependencies, eslint-config-next, @eslint/eslintrc, @eslint/js, typescript-eslint, exports, ./base, ./design-system-boundaries (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (16): Checklist de readiness avant deploiement, Configuration Coolify (par service), Configuration Dokploy (par service), Convention globale, Healthchecks recommandes, Instance Dokploy de référence (All-Aboard), Mapping des tags images, Matrice de deploiement - Dokploy / Coolify (+8 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (15): 1. Rôle de `apps/agent` (Rubberduck), 2. Intuition — indexer réseau + bridge All-Aboard, 3. Files d’attente et communication inter-services, 4. Frontière avec l’API Fastify, 5. Déploiement Dokploy, 6. Découpage backlog (issues enfants #37), ADR 0004 — Architecture Agent Rubberduck & Intuition (Phase 4), Alternatives non retenues (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (14): code:bash (# Terminal 1 — API), code:bash (pnpm --filter api test), Critères de clôture #49, Doc canonique (lecture), Décision (spike), Implémentation livrée, Objectif, Options comparées (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (14): compilerOptions, esModuleInterop, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (11): Input(), Default, Disabled, Invalid, InvalidWithLabel, Story, WithLabel, input (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (13): Agent et Indexer (preparation), API (service Fastify), Appel Web vers API (`API_URL` — reseau interne), Branches Git par environnement (etat observe), Build Docker (commun a tous les services Node), code:text (http://<nom-interne-du-service-api>:4000), Deploiement Dokploy — instance All-Aboard (reference), Domaines publics (Traefik / Dokploy) (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.14
Nodes (13): 1. Postgres (env dev), 2. Variables service **API** (dev), 3. Variables service **Web** (dev), 4. Smoke automatisé, 5. Smoke navigateur (parcours Bob), 6. Journal et pilotage, code:text (postgresql://<USER>:<PASSWORD>@<HOST_INTERNE>:5432/<DATABASE), code:bash (pnpm smoke:dev) (+5 more)

### Community 27 - "Community 27"
Cohesion: 0.14
Nodes (14): helpRequest, description, duplicateMessage, emailLabel, eyebrow, passwordLabel, rubberduckHint, submit (+6 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (14): helpRequest, description, duplicateMessage, emailLabel, eyebrow, passwordLabel, rubberduckHint, submit (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (12): 0. Promotion code (`staging` Git), 1. Postgres (env staging), 2. Variables service **API** (staging), 3. Variables service **Web** (staging), 4. Smoke automatisé, 5. Smoke navigateur (parcours Bob), 6. Journal et pilotage, code:text (postgresql://<USER>:<PASSWORD>@<HOST_INTERNE_POSTGRES_STAGIN) (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.15
Nodes (12): AuthMeResponse, CreateHelpRequestBody, CreateHelpRequestResponse, FeedResponse, HelpRequest, HelpRequestDetailResponse, LoginBody, LoginResponse (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (12): AllVariants, Default, Destructive, Disabled, Ghost, Large, Link, Loading (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (11): Anti-patterns documentés, AppShell (#25), Architecture — design system monorepo, code:mermaid (flowchart TB), code:mermaid (flowchart TD), Responsabilités par couche, Règle de placement (arbre de décision), Storybook 10.4 (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.17
Nodes (11): 1. Ajouter une primitive shadcn, 2. Écrire une story Storybook, 3. Consommer un composant dans `apps/web`, 4. Modifier les tokens, 5. Scripts utiles (racine), 6. Avant une PR touchant UI / SB, 7. Skills agents (`.agents/skills/`), code:bash (cd apps/web) (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (11): Arborescence code (rappel), code:text (packages/ui/          @allaboard/ui — tokens, primitives, st), code:bash (# Racine monorepo — Node 22+), code:bash (git remote set-url origin git@github.com:AllAboard-THP/All-A), Design system — documentation canonique, Démarrage rapide (nouveau contributeur), Liens externes, Navigation (Diátaxis) (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.17
Nodes (11): CI GitHub Actions (`.github/workflows/ci.yml`), code:bash (pnpm setup:hooks   # une fois), code:bash (uv tool install graphifyy    # une fois — binaire graphify), code:bash (docker build -f infra/docker/Dockerfile.storybook -t allaboa), Dépannage, ESLint — frontières (`@allaboard/config-eslint`), Gates par type de changement, Graphify (carte codebase) (+3 more)

### Community 36 - "Community 36"
Cohesion: 0.21
Nodes (9): Badge(), badgeVariants, AllVariants, Default, Destructive, Outline, Secondary, Story (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.17
Nodes (12): mentor, connectedAs, emptyDescription, emptyTitle, eyebrow, forbiddenDescription, forbiddenTitle, loadErrorTitle (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (11): localeSwitcher, en, fr, label, metadata, description, title, notFound (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.17
Nodes (12): mentor, connectedAs, emptyDescription, emptyTitle, eyebrow, forbiddenDescription, forbiddenTitle, loadErrorTitle (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (11): localeSwitcher, en, fr, label, metadata, description, title, notFound (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, incremental, jsx, noEmit, paths, plugins, exclude (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (9): Concepts et architecture (Getting Started + Concepts), Démarrage rapide (Quick Start), Index — documentation Intuition, Notes pour le monorepo All-Aboard, Outils développeur (SDK, GraphQL, contrats, protocole), Racine et méta, Ressources et optionnel, Réseau et infrastructure (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (9): compilerOptions, composite, declaration, declarationMap, outDir, rootDir, exclude, extends (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (10): home, description, emptyDescription, emptyTitle, eyebrow, feedSectionAriaLabel, loadErrorTitle, newRequestCta (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.20
Nodes (10): home, description, emptyDescription, emptyTitle, eyebrow, feedSectionAriaLabel, loadErrorTitle, newRequestCta (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (8): Critères de clôture cadrage (#37 — partial), Doc canonique (lecture), Décision architecture (2026-05-27), Livrables (cadrage), Objectif, Sous-tâches, Tâche #37 — Phase 4 Agent Rubberduck & Intuition, État actuel (Phase 2)

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (8): ADR 0002 — Design system monorepo (`packages/ui` + `apps/storybook`), Alternatives non retenues, Conséquences, Contexte, Documentation canonique, Décision, Liens, Statut

### Community 48 - "Community 48"
Cohesion: 0.22
Nodes (8): ADR 0005 — i18n web (next-intl), Conséquences, Contexte, Décision, Fichiers clés, Négatives / contraintes, Positives, Références

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (8): Accessibilité, AppShell — navigation applicative (#25), code:text (apps/web/app/), Composants, Hors scope #25 (fait plus tard), Rôle, Structure routes, Étendre le shell

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (8): compilerOptions, incremental, jsx, lib, noEmit, plugins, extends, $schema

### Community 51 - "Community 51"
Cohesion: 0.22
Nodes (8): exports, ./base.json, ./next.json, ./node.json, files, name, private, version

### Community 52 - "Community 52"
Cohesion: 0.28
Nodes (6): AllVariants, Error, Info, Story, Success, Toaster()

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (9): detail, eyebrow, loadErrorTitle, notFoundDescription, notFoundTitle, responsesEmptyDescription, responsesEmptyTitle, responsesSectionAriaLabel (+1 more)

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (9): detail, eyebrow, loadErrorTitle, notFoundDescription, notFoundTitle, responsesEmptyDescription, responsesEmptyTitle, responsesSectionAriaLabel (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.25
Nodes (7): Doc canonique (lire en priorité), Done (#24 + suites livrées sur la branche DS), Hors scope initial #24 (traité ailleurs), Liens, Objectif, Skills agents (`.agents/skills/`), Tâche #24 — Design system monorepo (`packages/ui` + Storybook)

### Community 56 - "Community 56"
Cohesion: 0.25
Nodes (7): Critères d’acceptation (#25), Doc canonique, Fichiers, Livré, Objectif, Suite, Tâche #25 — Shell navigation & layout

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (7): ADR 0001 — Authentification MVP (Phase 2), Alternatives non retenues, Conséquences, Contexte, Décision, Liens, Statut

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (7): ADR 0003 — Authentification produit (users réels), Alternatives non retenues (pour l’instant), Conséquences, Contexte, Décision, Liens, Statut

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (7): code:mermaid (flowchart TB), Diagramme Mermaid (dataflow), Hypotheses MOC, Lecture rapide des flux, MOC - Dataflow et architecture All-Aboard, Objectif, Perimetre

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (7): Acteurs, code:mermaid (flowchart TD), Diagramme Mermaid, MOC - Parcours utilisateur All-Aboard, Notes de cadrage MOC, Objectif, Parcours utilisateur (version MOC)

### Community 61 - "Community 61"
Cohesion: 0.25
Nodes (7): code:text (Docs/tasks/<NN>-<slug-court>/), Convention de nommage, Documentation par tâche (`Docs/tasks/`), Index des dossiers tâche, Liens, Où écrire quoi, Workflow collaborateur

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (3): storybookNoProductAppImports, uiNoAppImports, webNoStorybookImports

### Community 63 - "Community 63"
Cohesion: 0.25
Nodes (7): compilerOptions, module, moduleResolution, noEmit, types, extends, $schema

### Community 64 - "Community 64"
Cohesion: 0.25
Nodes (7): compilerOptions, jsx, lib, noEmit, exclude, extends, include

### Community 65 - "Community 65"
Cohesion: 0.25
Nodes (8): errors, database_unavailable, duplicate, generic, invalid_credentials, not_found, unauthorized, unknown

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (8): errors, database_unavailable, duplicate, generic, invalid_credentials, not_found, unauthorized, unknown

### Community 67 - "Community 67"
Cohesion: 0.29
Nodes (6): Branche, Doc canonique, Fichiers, Notes de travail, Objectif, Tâche #75 — i18n web FR/EN

### Community 68 - "Community 68"
Cohesion: 0.29
Nodes (6): Critères de merge recommandés (récap), Epic #24 — Fondations design system, Issue #25 — AppShell, Journal de livraison — design system & shell, Post-24f — CI Storybook (T21–T22), Suite produit (backlog doc)

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (6): Documentation All-Aboard — point d'entrée canonique, Hiérarchie des documents, Principes pour limiter le rework, Règles contributeurs, Timeline (phases), État technique du dépôt

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (7): common, author, backHome, backToFeed, brand, refetching, tags

### Community 71 - "Community 71"
Cohesion: 0.29
Nodes (7): common, author, backHome, backToFeed, brand, refetching, tags

### Community 72 - "Community 72"
Cohesion: 0.29
Nodes (6): extends, $schema, tasks, typecheck, dependsOn, outputs

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (5): 1. Inventaire `Docs/`, 2. Sujet → source canonique, 3. Règles de maintenance, Liens rapides, Map of content (MoC) — documentation All-Aboard

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (5): Auth (bloquant staging public), Checklist promotion dev → staging, Infra Dokploy staging, Parcours produit (dev), Qualité

### Community 75 - "Community 75"
Cohesion: 0.33
Nodes (5): Doc canonique (lecture), Fichiers, Notes de travail, Objectif, Tâche #NN — Titre court

### Community 76 - "Community 76"
Cohesion: 0.33
Nodes (5): All-Aboard Design System, code:bash (pnpm storybook          # http://localhost:6006), Commandes, Navigation, Stack

### Community 77 - "Community 77"
Cohesion: 0.33
Nodes (6): feed, clientError, loading, refresh, refreshAriaLabel, useQuerySummary

### Community 78 - "Community 78"
Cohesion: 0.33
Nodes (6): feed, clientError, loading, refresh, refreshAriaLabel, useQuerySummary

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (4): Doc canonique, Notes de travail, Objectif, Tâche #18 — ADR stratégie d'authentification

### Community 81 - "Community 81"
Cohesion: 0.40
Nodes (5): nav, feed, mainAriaLabel, mentor, newRequest

### Community 82 - "Community 82"
Cohesion: 0.40
Nodes (5): nav, feed, mainAriaLabel, mentor, newRequest

### Community 83 - "Community 83"
Cohesion: 0.40
Nodes (4): __dirname, monorepoRoot, nextConfig, withNextIntl

### Community 84 - "Community 84"
Cohesion: 0.50
Nodes (3): Liens, Plan d'initialisation Turborepo — MVP All-Aboard, Structure actuelle (référence)

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (3): dialect, entries, version

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (3): durations, Story, Transitions

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (3): radii, RadiusScale, Story

## Knowledge Gaps
- **871 isolated node(s):** `withNextIntl`, `__dirname`, `monorepoRoot`, `nextConfig`, `__dirname` (+866 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `detail` connect `Community 53` to `Community 38`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `common` connect `Community 71` to `Community 40`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 10` to `Community 36`, `Community 7`, `Community 9`, `Community 11`, `Community 15`, `Community 16`, `Community 24`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `cn()` (e.g. with `PatternDemoCardShell()` and `Badge()`) actually correct?**
  _`cn()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **What connects `withNextIntl`, `__dirname`, `monorepoRoot` to the rest of the system?**
  _871 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05478750640040963 - nodes in this community are weakly interconnected._