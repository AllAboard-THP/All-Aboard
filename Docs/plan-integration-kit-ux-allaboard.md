<!-- markdownlint-disable MD033 MD041 -->
<div align="center">

# Plan d’intégration — kit UX AllAboard

**Exécution · gates · phases · merge `Dev`**

[![Version](https://img.shields.io/badge/version-2.3-6366f1?style=flat-square)](./plan-integration-kit-ux-allaboard.md)
[![Scope](https://img.shields.io/badge/scope-apps--web-0f172a?style=flat-square)](../../apps/web)
[![Vérif](https://img.shields.io/badge/CI-pnpm%20verify-22c55e?style=flat-square)](../AGENTS.md)

</div>

**Version** : **2.3** · **Date** : 2026-05-19  
**v2.3** : doc allégée — hub [kit-ux-index](kit-ux-index.md) ; sections dataflow / Mermaid / planche retirées du plan (renvois audit + plan Web/API).  
**v2.2** : gate **L** ([§2.8](#validation-locale-avant-pr)), `prepare-standalone`, distinction livrable / jalon / CI.

**Objectif** : livrer le kit sur **`apps/web`** (Next 15, React 19) avec **Tailwind**, **shadcn/ui** (Radix + **`cn`**), **Storybook** et **preuve parcours automatisée** (**Playwright**, **D4** actif). **Données, auth métier, BFF, `/feed`** : [plan Web/API](plan-mise-en-place-web-api-donnees.md) — le kit ne les remplace pas. **Inventaire familles §8.x** : [audit](audit-integration-kit-ux-allaboard.md) (**v1.7**). **Qualité** : [AGENTS.md](../AGENTS.md) — après chaque lot pertinent : `pnpm verify` à la racine.

---

## Sommaire

0. [Chemin d’exécution autonome (ordre strict)](#0-chemin-dexécution-autonome-ordre-strict)  
1. [Rôle et périmètre](#1-rôle-et-périmètre)  
2. [Règles d’exécution (agent)](#procédure-dexécution-agent) · [Motion in-app](#motion-in-app) · [Validation locale (gate L)](#validation-locale-avant-pr)  
3. [Jalons V / T / M / S / P](#jalons-de-test-v--t--m--s--p)  
4. [G0 — Décommission `thp-final`](#decom-thp-final)  
5. [Décisions MVP (D1–D7)](#décisions-mvp-d1d6)  
6. [G1 — Spike technique](#gate-g1--spike-technique)  
7. [Phase 0 — Fondations](#phase-0--fondations)  
8. [Phase 1 — Shell et auth](#phase-1--shell-et-auth)  
9. [Phase 2 — Contenu et messages](#phase-2--contenu-et-messages)  
10. [Phase 3 — Dense et spécifique](#phase-3--dense-et-spécifique)  
11. [Phase 4 — Clôture](#phase-4--clôture)  
12. [Recette R1–R6](#recette-manuelle-r1--r6)  
13. [Merge vers `Dev`](#merge-vers-dev)  
14. [Décision build et pipeline](#13-décision-build)  
15. [Liens](#liens)

---

<a id="0-chemin-dexécution-autonome-ordre-strict"></a>

## 0. Chemin d’exécution autonome (ordre strict)

> Un agent **ne démarre pas** l’étape **N+1** tant que les **critères de sortie** de **N** ne sont pas remplis **ou** explicitement **WONTFIX** (voir [§2 — WONTFIX](#wontfix)).

### 0.1 Séquence globale (une ligne = une étape logique)

| Ordre | ID | Contenu | Bloque |
|:-----:|----|----------|--------|
| 1 | **Lire** | [AGENTS.md](../AGENTS.md) ; [audit §8 + §11](audit-integration-kit-ux-allaboard.md) ; si pages feed/API : [plan Web/API](plan-mise-en-place-web-api-donnees.md) | Tout travail incohérent |
| 2 | **G0** | [§4](#decom-thp-final) — uniquement si `apps/thp-final` existe ; sinon **N/A** (documenter date) | Extension kit **en production** ; merge `Dev` « propre » monorepo |
| 3 | **G1** | [§6](#gate-g1--spike-technique) — spike Tailwind, shadcn, Storybook, décision §14 | **Phase 0** |
| 4 | **P0** | [§7](#phase-0--fondations) | **Phase 1** |
| 5 | **P1** | [§8](#phase-1--shell-et-auth) | **Phase 2** |
| 6 | **P2** | [§9](#phase-2--contenu-et-messages) | **Phase 3** |
| 7 | **P3** | [§10](#phase-3--dense-et-spécifique) | **Phase 4** |
| 8 | **P4** | [§11](#phase-4--clôture) | **L** (gate locale) |
| 9 | **L** | [§2.8](#validation-locale-avant-pr) — **V** + **T** + **P** en local | **PR** kit vers `Dev` |
| 10 | **PR / merge** | PR ouverte + [§13](#merge-vers-dev) après **L** et CI verte | — |

### 0.2 Arbre de décision (agent)

```
apps/thp-final existe ?
├─ OUI → Exécuter G0 EN PREMIER (ou issue REPORT-G0-YYYY-MM-DD + ne pas merger kit prod sans résolution)
└─ NON → G0 = N/A ; noter la date dans §4

Storybook (.storybook/) déjà présent avant G1-a/b ?
├─ OUI → G1-e/f peuvent être considérés partiellement faits ; OBLIGATION après G1-a+b : réaligner preview/CSS (sans relancer storybook init) jusqu'à build-storybook OK
└─ NON → Ordre par défaut G1-a → … → G1-f

Page consomme le feed ?
└─ OUI → Contrat uniquement via packages/types + plan Web/API (D3) ; pas de types parallèles
```

### 0.3 Commandes de vérification standard (référence)

| Jalon | Commande (racine monorepo sauf mention) |
|:-----:|----------------------------------------|
| **L** (pré-PR) | Séquence complète [§2.8](#validation-locale-avant-pr) |
| **V** | `pnpm verify` |
| **T** | `pnpm --filter web build-storybook` |
| **P** | `pnpm --filter web run build` puis `CI=true pnpm --filter web run test:e2e` (voir [`apps/web/README.md`](../../apps/web/README.md), [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md)) |
| **Install E2E** | `pnpm --filter web run test:e2e:install` (une fois par machine ; CI : `test:e2e:install:ci`) |

---

## 1. Rôle et périmètre

| Zone | Rôle |
|------|------|
| **`apps/web`** | Seule cible du kit : App Router, composants, Storybook, BFF feed côté Next si prévu. |
| **`apps/api`** | Pas d’UI ; contrat JSON (ex. `GET /feed`) aligné avec [plan Web/API](plan-mise-en-place-web-api-donnees.md). |
| **`apps/thp-final` (Rails)** | **Obsolète** — n’est plus une option de travail. Retrait monorepo + CI : [G0](#decom-thp-final). |

**Règle d’or** : une **phase à la fois** ; pas de phase **N+1** tant que les jalons de **N** ne sont pas cochés ou **WONTFIX** (issue + trace dans l’audit ou ce plan).

---

<a id="procédure-dexécution-agent"></a>

## 2. Règles d’exécution (agent)

### 2.1 Avant la première PR « kit » (après gate **L**)

1. Lire [AGENTS.md](../AGENTS.md) (hooks, `pnpm verify`).  
2. Lire audit **§8** (inventaire) et **§11** (succès).  
3. Si une page touche API ou BFF : [plan Web/API](plan-mise-en-place-web-api-donnees.md).  
4. Si `apps/thp-final/` est encore présent : exécuter [G0](#decom-thp-final) **en premier** **ou** créer une issue **REPORT-G0-AAAA-MM-JJ** (report daté) ; ne pas étendre le kit **en production** tant que G0 n’est pas **N/A** ou **terminé**.  
5. Exécuter la **gate L** ([§2.8](#validation-locale-avant-pr)) sur la branche qui portera la PR — **V**, **T** et **P** en exit **0** en local.  
6. Ensuite seulement : ouvrir la PR et remplir le gabarit [§2.6](#execution-agent-autonome).

> **Cases du plan** : `[x]` sur un **livrable** = implémentation présente sur la branche (revue code). `[x]` sur un **jalon** = commande exécutée avec succès **par la personne qui signe** (date optionnelle en commentaire PR). **Ne pas** cocher un jalon sans terminal vert.

### 2.2 Règles de travail

| Règle | Détail |
|-------|--------|
| **Racine** | Commandes `pnpm …` depuis la racine du dépôt, sauf mention contraire. |
| **Vérification** | Après chaque lot : `pnpm verify`. |
| **Storybook** | Après toute modif de `.storybook/` ou `*.stories.*` sous `apps/web` : `pnpm --filter web build-storybook` (**T**). |
| **`thp-final`** | Interdit : correctif fonctionnel, nouvelle dépendance, PR « sauvetage » — uniquement [G0](#decom-thp-final) ou issue. |
| **Secrets** | Ne pas committer `.env` ; noms d’env documentés dans le plan Web/API. |
| **Blocage** | Wizard bloquant, arbitrage produit absent, CI non trivial → **issue** + pause de la phase ; pas de `git commit --no-verify` sans accord humain ([AGENTS.md](../AGENTS.md)). |

<a id="wontfix"></a>

### 2.3 WONTFIX (obligatoire si livrable sauté)

Pour toute case de livrable ou jalon non fait : **issue** avec titre du type `WONTFIX kit UX — <phase> — <id>` ; corps : raison, périmètre, date, responsable ; **lien** dans la PR et, si utile, une ligne dans l’audit ou ce plan. Sans cela, la phase n’est **pas** considérée comme complète.

Pour le MVP kit, un ID déjà listé dans [wontfix-kit-ux.md](wontfix-kit-ux.md) avec entrée dans [kit-ux-index.md](kit-ux-index.md) **complète** une issue GitHub dédiée. Une **issue** reste **obligatoire** pour tout écart **non** documenté dans ces fichiers.

<a id="wizards-kit"></a>

### 2.4 Wizards (shadcn, Storybook)

Effectuer **`shadcn init`** et **`storybook init`** dans une **session dédiée** (idéalement humain en local), commit des fichiers générés, puis documenter dans [`apps/web/README.md`](../../apps/web/README.md) les choix (Next, `app/`, framework Storybook). Les PR suivantes **ne relancent pas** les wizards : uniquement `shadcn add …` ou édition de config.

> **Storybook avant Tailwind/shadcn** : si `storybook init` est fait **en premier**, les PR suivantes **ajustent** uniquement la config (preview, PostCSS / Tailwind, alias, globals) quand G1‑a/b sont verts — **sans** relancer le wizard. Tracer la passe de réalignement dans la PR ou une issue courte.

**Node / Storybook** : la CLI **Storybook 10+** exige Node **20.19+**. En **20.18.x**, pin **Storybook 8.4.x** et `pnpm dlx storybook@8.4.x init` — détail [D1](#décisions-mvp-d1d6) et [`apps/web/README.md`](../../apps/web/README.md).

<a id="execution-agent-autonome"></a>

### 2.5 Exécution agent autonome (**D4** actif)

> Objectif : un agent (ou la CI) peut prouver les parcours **R1–R6** **sans** recette manuelle obligatoire, via **Playwright** sur `apps/web`.

| Élément | Attendu |
|--------|---------|
| **D4** | Suite **E2E** sous `apps/web` (`e2e/`) ; `pnpm --filter web run test:e2e` — détail [`apps/web/README.md`](../../apps/web/README.md), [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md). |
| **Couverture** | Une spec (ou groupe) par **R1–R6** lorsque la route existe ; **skip** ou **WONTFIX** + issue si parcours non livré. |
| **Données** | **Mocks** (`page.route` / `route.fulfill`), **MSW**, ou **API + seed** — documenter la source ; aligner sur **`packages/types`** pour le feed. |
| **Auth en test** | Mécanisme **non produit** uniquement ; jamais en déploiement utilisateur ; décrit dans [plan Web/API](plan-mise-en-place-web-api-donnees.md) ou ADR. |
| **CI** | Dès que la suite est stable : **`playwright test`** dans [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). Déclenchée sur **`pull_request`** et `push` vers `main` / `staging` / `Dev` / `init/**` — un **`push` seul** sur `feature/*` **ne lance pas** la CI. |
| **M / S** | **Optionnelles** ; ne **remplacent** pas **P** pour merge `Dev` tant que D4 reste actif. |

### 2.6 Gabarit de fin de PR (copier dans la description)

```text
[ ] Gate L locale : pnpm gate:l:kit (ou V + T + P manuels — date / machine)
[ ] Livrables : cases phase cochées ou WONTFIX + lien issue
[ ] pnpm verify (racine)
[ ] pnpm --filter web build-storybook (si .storybook/ ou *.stories.* modifiés)
[ ] Playwright : pnpm --filter web run test:e2e (si specs e2e / parcours R* touchés)
[ ] Décommission G0 : terminée ou N/A (dossier absent + CI sans Ruby/Rails)
```

<a id="motion-in-app"></a>

### 2.7 Motion in-app (reco stack)

**Cible** : motion **in-app** (feed, shell, messages, modales, listes, états chargement) — pas une stratégie scroll storytelling landing. Aligné audit **§4.3** / **§8.0** (durées, easing). Croiser [D7](#décisions-mvp-d1d6) et **D6** (`prefers-reduced-motion`).

#### À installer (reco réaliste)

| Élément | Détail |
|--------|--------|
| **`motion`** *ou* **`framer-motion`** | **Une seule** des deux (pas les deux). Sert pour : listes (**stagger**, reorder léger), **master–detail** (panneaux, `layout`), **modales / drawers** (`AnimatePresence`), **états** (loading → contenu), **micro-transitions** sur cartes. |
| **Rien d’autre d’obligatoire** | Pour un in-app **sérieux**, ce socle React + CSS / Tailwind suffit comme **défaut** du kit. |
| **`tailwindcss-animate`** | **Complément** utile si stack **shadcn** classique (petites entrées / sorties) ; **ne porte pas** seul un motion-first sur **layouts** complexes. |

#### À ne pas prioriser pour l’in-app

| Outil | Raison |
|--------|--------|
| **GSAP + ScrollTrigger** | Surtout **scroll storytelling** (landing) ; peu rentable sur feed / messages sans gros récit au scroll. |
| **Lenis** (smooth scroll global) | Souvent **contre-productif** in-app (accessibilité, sensation « lourd »). |
| **Lottie / Rive** | Uniquement si **illustrations animées** produit ; pas pour le **squelette** motion de l’app. |

#### Hors paquets (indispensable)

- **Tokens CSS** (durées, easing) + classes Tailwind pour le défaut (**opacity** / **transform**) — lien [D2](#décisions-mvp-d1d6), livrables phase 0.  
- **`prefers-reduced-motion`** : parcours in-app **sans** motion décorative ; conserver des transitions **courtes** pour **focus** / ouverture **modale** si besoin — cohérent [D6](#décisions-mvp-d1d6).

<a id="validation-locale-avant-pr"></a>

### 2.8 Validation locale avant PR (gate **L**)

> **Obligatoire** avant toute PR kit vers `Dev`. Les cases `[x]` des **livrables** ne remplacent **pas** cette gate.

| Étape | Commande / action |
|-------|-------------------|
| **Install** | `pnpm install` · `pnpm --filter web run test:e2e:install` |
| **WSL** | Si Chromium échoue (`libnspr4.so`) : `sudo pnpm --filter web exec playwright install-deps` — voir [`apps/web/e2e/README.md`](../../apps/web/e2e/README.md) |
| **V** | `pnpm verify` |
| **T** | `pnpm --filter web build-storybook` |
| **P** | `pnpm --filter web run build` + `pnpm --filter web run prepare-standalone` puis `CI=true pnpm --filter web run test:e2e` — ou `pnpm gate:l:kit` (racine) |
| **M** *(optionnel)* | `pnpm --filter web dev` — [§12](#recette-manuelle-r1--r6) |

**Sortie gate L** : **V**, **T** et **P** en exit **0** sur la machine de la personne qui ouvre la PR.

> **Journal gate L** (2026-05-19, branche `feature/ui-tailwind-foundation`) : **V** ✓ · **T** ✓ · **P** ✓ (`CI=true pnpm --filter web run test:e2e` — **9 passed** ; `prepare-standalone` après `next build` pour assets `/_next/static`).

> [!NOTE]
> Un **`push`** sur une branche `feature/*` **ne déclenche pas** la CI GitHub ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)). La **PR** sert à rejouer la même preuve sur Actions.

---

<a id="jalons-de-test-v--t--m--s--p"></a>

## 3. Jalons de test (V / T / M / S / P)

| Marque | Signification | Quand | Action |
|:------:|---------------|-------|--------|
| **L** | Validation locale **pré-PR** | Avant d’ouvrir une PR kit | [§2.8](#validation-locale-avant-pr) (**V** + **T** + **P**) |
| **V** | *Verify* monorepo | Chaque lot / PR | `pnpm verify` — [CI](../../.github/workflows/ci.yml) sur **pull_request** |
| **T** | Storybook compile | Si stories ou `.storybook/` touchés | `pnpm --filter web build-storybook` ; en **CI** dès [§14](#13-décision-build) cochée |
| **M** | Recette **locale** humaine | **Optionnel** | `pnpm --filter web dev` — angles non couverts par **P** |
| **S** | **Staging** | **Optionnel** | Ne remplace pas **P** pour merge `Dev` |
| **P** | E2E automatisé | **D4 actif** | build + `prepare-standalone` + `CI=true pnpm --filter web run test:e2e` — voir [§2.8](#validation-locale-avant-pr) |
| **CI** | GitHub Actions | Sur **`pull_request`** | Mêmes commandes ; `push` sur `feature/*` seul **ne déclenche pas** la CI |

**Mémo PR** : `L (local) | V | T si stories | P (Playwright R*) | M/S si besoin exploratoire`.

> [!NOTE]
> Merge `Dev` : preuve parcours = **P** (D4), validée en **L** avant PR puis confirmée en **CI**. **T** = catalogue Storybook. **M/S** = complément.

---

<a id="decom-thp-final"></a>

## 4. G0 — Décommission `apps/thp-final` (Rails)

> L’app Rails est **abandonnée** ; elle ne doit plus figurer dans le monorepo, la CI ni la doc comme option de travail.

> [!CAUTION]
> Sauvegarder si besoin (tag, export). À la fin : **`pnpm verify` vert**.

### Agent — prérequis

- Exécuter depuis la racine : `test -d apps/thp-final` (ou équivalent). **Vrai** → G0 **applicable**. **Faux** → cocher **N/A**, renseigner **Date** en fin de §4, passer à G1.

### Checklist G0

- [x] **Trace** : [ADR 001 — abandon `thp-final`](adr-001-abandon-thp-final.md).  
- [x] **Turbo / scripts racine** : aucune tâche obligatoire liée à `thp-final`, `bundle` ou `rails`.  
- [x] **CI** : [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) — Ruby / Rails retirés ; Storybook + Playwright ajoutés.  
- [x] **Docker / infra** : image Rails retirée du README racine ; Dockerfiles Node inchangés.  
- [x] **Code** : répertoire **`apps/thp-final/`** supprimé.  
- [x] **Lockfile** : `pnpm install` racine ; `pnpm-lock.yaml` à jour.  
- [x] **Documentation** : README racine et plans mis à jour.

### Agent — sortie

- `pnpm verify` → exit **0**.  
- Absence du dossier **`apps/thp-final/`** + CI sans Ruby/Rails.

**État G0** : ☑ terminée — **Date** : 2026-05-19

---

<a id="décisions-mvp-d1d6"></a>

## 5. Décisions MVP (D1–D7)

> Valeurs **de démarrage**. Les modifier = **issue** + mise à jour de ce tableau + date.

| ID | Sujet | Décision MVP |
|:---:|--------|--------------------------|
| **D1** | Storybook dans `apps/web` + couverture ↔ §8 (phase 4) | Storybook **obligatoire** ; tableau primitif → story en phase 4. **`build-storybook` en CI** dès G1 vert (étape workflow). Si CI Storybook **avant** [décision Tailwind §14](#13-décision-build) finale, **revoir** l’étape après choix A/B. **Node** : CLI **Storybook 10+** → Node **20.19+** ; en **20.18.x** → pin **8.4.x** + `pnpm dlx storybook@8.4.x init` — [`apps/web/README.md`](../../apps/web/README.md). |
| **D2** | Tokens | **Phase 0** : variables CSS + table token → classe dans `apps/web` (ou doc) ; y inclure **durées / easing** motion ([§2.7](#motion-in-app), audit §8.0). `packages/ui-tokens` = **option post-MVP** (issue). |
| **D3** | Types / BFF / SSR | Toute page feed : **`packages/types`** + BFF/SSR selon [plan Web/API](plan-mise-en-place-web-api-donnees.md) — pas de contrat parallèle. |
| **D4** | E2E Playwright | **Actif** ; merge `Dev` exige **P** sur **R1–R6** applicables. **M/S** = optionnel. |
| **D5** | Thème light | **MVP dark uniquement** ; light = issue datée post-merge si besoin. |
| **D6** | Accessibilité MVP | **Focus visible**, **tabulation** shell + auth, **labels** + CGU non contournable ; **P** couvre au minimum **navigation clavier** sur les parcours testés. **`prefers-reduced-motion`** : voir [§2.7](#motion-in-app). |
| **D7** | Motion in-app (libs) | **`motion`** *ou* **`framer-motion`** exclusif (pas les deux). **`tailwindcss-animate`** = complément shadcn si besoin. **Pas** par défaut sur le socle : GSAP + ScrollTrigger, Lenis, Lottie / Rive — détail [§2.7](#motion-in-app). |

---

<a id="gate-g1--spike-technique"></a>

## 6. G1 — Spike technique

> **Gate** : aucune [Phase 0](#phase-0--fondations) tant que **toutes** les tâches G1 ci‑dessous et la [Décision build](#13-décision-build) (options + **Décision** + **Date**) ne sont pas à jour. **G0** doit être **N/A** ou **terminée** avant livraison kit **en production**.

### Agent — prérequis

- G0 : **N/A** ou checklist §4 complète (pour travail « prod-ready »).  
- `node -v` : noter la version ; choisir chaîne Storybook conformément [D1](#décisions-mvp-d1d6).

### Ordre des tâches G1

- **Défaut** : **G1‑a** → **G1‑b** → **G1‑c** / **G1‑d** → **G1‑e** → **G1‑f**.  
- **Alternatif** : **G1‑e** / **G1‑f** avant **G1‑a/b** autorisé ; après **G1‑a** et **G1‑b**, **réalignement obligatoire** `.storybook/` + stories jusqu’à `build-storybook` **exit 0** ([§2.4](#wizards-kit)).

### Tâches G1

- [x] **G1‑a** — Sous `apps/web` : **Tailwind** opérationnel ; **une page pilote** avec classes compilées (smoke `pnpm --filter web dev`).  
- [x] **G1‑b** — **shadcn/ui** : `components.json`, **`cn`** (`clsx` + `tailwind-merge`) ; README `apps/web` mis à jour.  
- [x] **G1‑c** — README `apps/web` : `dev`, `build`, chaîne CSS → renvoi [§14](#13-décision-build).  
- [x] **G1‑d** — [§14](#13-décision-build) : options A/B/C/D cochées, **Décision** + **Date**.  
- [x] **G1‑e** — **Storybook** : scripts `storybook` et `build-storybook` ; `.storybook/` versionné ; emplacement des stories documenté.  
- [x] **G1‑f** — Au moins **une story pilote** ; `pnpm --filter web build-storybook` **exit 0**.

### Jalons G1

> **Preuve** : cocher **V** / **T** / **P** uniquement après exécution locale réussie ([§2.8](#validation-locale-avant-pr)), pas après lecture du plan.

- [x] **V** — `pnpm verify`- [x] **T** — `pnpm --filter web build-storybook`
### Agent — sortie

- Toutes les cases **G1‑a** … **G1‑f** cochées **ou** WONTFIX + issue.  
- **V** + **T** verts.

---

<a id="phase-0--fondations"></a>

<a id="phase-0-fondations"></a>

## 7. Phase 0 — Fondations

> Réf. audit **§8.0**. **Gate phase 1** : **V** + **T** + **P** (**R1** dès que la landing est livrée). **M/S** = optionnel.

**Objectif** : tokens, focus, z-index ; build Tailwind reproductible ; **pas de CDN Tailwind** sur les routes Next livrées ; Storybook prêt.

### Agent — prérequis

- [G1](#gate-g1--spike-technique) entièrement **vert** (ou WONTFIX documenté pour tâche équivalente validée par humain — éviter sauf exception).

### Livrables

- [x] **0.1** — Config Tailwind + `content` (`app/`, `components/`, `packages/*` si importés).  
- [x] **0.2** — CSS global : variables **§8.0**, `@layer` si utilisé.  
- [x] **0.3** — Pipeline aligné [§14](#13-décision-build) ; CI Storybook / Playwright si étapes existent dans le workflow.  
- [x] **0.4** — Table token → CSS → classe (amorce) ; lien **D2**.  
- [x] **0.5** — Focus ring + **z-index** (modales, nav, toasts).  
- [x] **0.6** — Aucune URL **`cdn.tailwindcss.com`** sur les routes Next livrées (grep ou test).  
- [x] **0.7** — Pas de second framework utilitaire (Bootstrap, MUI parallèle, etc.).  
- [x] **0.8** — Preview Storybook : globals / thème ; ≥ 1 story par famille **amorcée** pour phase 1. Si Storybook était **avant** G1‑a/b : valider ici que preview = chaîne Tailwind/tokens **réelle**.  
- [x] **0.9** — Motion in-app : paquet unique **`motion`** *ou* **`framer-motion`** installé et documenté dans [`apps/web/README.md`](../../apps/web/README.md) ; **`tailwindcss-animate`** si la stack shadcn le prévoit ; tokens durée / easing ([D2](#décisions-mvp-d1d6)) ; comportement **`prefers-reduced-motion`** ([§2.7](#motion-in-app), **D6** / **D7**).

### Jalons fin phase 0

> **Preuve** : cocher **V** / **T** / **P** uniquement après exécution locale réussie ([§2.8](#validation-locale-avant-pr)), pas après lecture du plan.

- [x] **V** — `pnpm verify`- [x] **T** — `pnpm --filter web build-storybook`- [x] **R+** *(recommandé)* — `pnpm --filter web build` OK ; page pilote **200** sans CDN Tailwind.- [x] **P** — Playwright **R1** vert ([§12](#recette-manuelle-r1--r6)).- [ ] **M** — *Optionnel* : **R1** manuel.  
- [ ] **S** — *Optionnel* : **R1** staging.

### Agent — sortie

- Tous les jalons phase 0 requis (**V**, **T**, **P** pour **R1**) cochés ou WONTFIX + issue ; **R+** fortement recommandé avant phase 1.

---

<a id="phase-1--shell-et-auth"></a>

## 8. Phase 1 — Shell et auth

> Réf. audit **§8.1**, **§8.3**, **§8.4**, **§8.7**. **Gate phase 2** : **P** (**R1–R3**) ou **WONTFIX** + issue.

**Objectif** : shell, auth, CGU sur **App Router** ; primitives shadcn + stories ; auth alignée [plan Web/API](plan-mise-en-place-web-api-donnees.md).

### Agent — prérequis

- [Phase 0](#phase-0--fondations) : sortie validée (section **Agent — sortie** du [§7](#phase-0--fondations)).

### Livrables

- [x] **1.1** — Boutons, champs, labels, erreurs (§8.3, §8.5) + stories.  
- [x] **1.2** — Layout shell + pages auth (§8.4) — pas de stack auth hors plan Web/API / ADR.  
- [x] **1.3** — Nav desktop & mobile, footer, menu utilisateur, badges.  
- [x] **1.4** — Modale CGU, toasts / bannières.  
- [x] **1.5** — Écarts **D4 / D5 / D6 / D7** : uniquement via **issue** + [§5](#décisions-mvp-d1d6).

### Jalons

> **Preuve** : cocher **V** / **T** / **P** uniquement après exécution locale réussie ([§2.8](#validation-locale-avant-pr)), pas après lecture du plan.

- [x] **V** — `pnpm verify`- [x] **T** — si stories §8.1 / §8.3–8.5 modifiées.- [x] **P** — **R1**, **R2**, **R3** (skip documenté si route absente).- [ ] **M** — *Optionnel*.

### Agent — sortie

- **P** pour R1–R3 (ou WONTFIX par ID) ; **V** vert.

---

<a id="phase-2--contenu-et-messages"></a>

## 9. Phase 2 — Contenu et messages

> Réf. audit **§8.2**, **§8.6**, **§8.7**. **Gate phase 3** : **P** (**R4–R5** applicables) ou **WONTFIX** + issue.

**Objectif** : navigation de page, cartes, listes, messages ; données via [plan Web/API](plan-mise-en-place-web-api-donnees.md).

### Agent — prérequis

- [Phase 1](#phase-1--shell-et-auth) : sortie validée.

### Livrables

- [x] **2.1** — Breadcrumbs, tabs, page heading (§8.2) + stories.  
- [x] **2.2** — Cartes feed / explore / ressources / événements ; list rows ; empty states.  
- [x] **2.3** — Badges, tags, modales métier.  
- [x] **2.4** — Split view messages + responsive.

### Jalons

> **Preuve** : cocher **V** / **T** / **P** uniquement après exécution locale réussie ([§2.8](#validation-locale-avant-pr)), pas après lecture du plan.

- [x] **V** — `pnpm verify`- [x] **T** — si stories §8.2 / §8.6 touchées.- [x] **R+** — `GET` feed ou **`/api/feed`** : **200** (mock documenté si besoin).- [x] **P** — **R4**, **R5** (selon routes).- [ ] **M** — *Optionnel*  
- [ ] **S** — *Optionnel* : **R4** déploiement.

### Agent — sortie

- **P** R4–R5 applicables ou WONTFIX ; **V** vert ; **R+** si feed livré.

---

<a id="phase-3--dense-et-spécifique"></a>

## 10. Phase 3 — Dense et spécifique

> Réf. audit **§8.8** à **§8.10**, **§8.9**. **Gate phase 4** : **P** (**R5–R6** applicables) ou **WONTFIX** + issue.

**Objectif** : chat React, tables denses, mails, légal — **sans** Turbo / Action Cable. Temps réel : **ADR** ou [plan Web/API](plan-mise-en-place-web-api-donnees.md) ; sinon UI **sans** promesse temps réel (issue).

### Agent — prérequis

- [Phase 2](#phase-2--contenu-et-messages) : sortie validée.

### Livrables

- [x] **3.1** — Chat React + styles kit ; clavier / focus.  
- [x] **3.2** — Blocs code + **highlight.js** (ou équivalent).  
- [x] **3.3** — Tables admin / mentor (+ filtres si prévus).  
- [x] **3.4** — Mails (preview Storybook, react-email, ou capture) + pages légales §8.10.

### Jalons

> **Preuve** : cocher **V** / **T** / **P** uniquement après exécution locale réussie ([§2.8](#validation-locale-avant-pr)), pas après lecture du plan.

- [x] **V** — `pnpm verify`- [x] **T** — si stories §8.8–8.10 modifiées.- [x] **R+** — Routes mentor / admin → **200** si existantes (fixture documentée).- [x] **P** — **R5**, **R6** (selon routes).- [ ] **M** — *Optionnel*  
- [ ] **S** — *Optionnel*.

### Agent — sortie

- **P** R5–R6 applicables ou WONTFIX ; **V** vert.

---

<a id="phase-4--clôture"></a>

## 11. Phase 4 — Clôture

### Agent — prérequis

- [Phase 3](#phase-3--dense-et-spécifique) : sortie validée.

### Livrables

- [x] **4.1** — Tableau **D1** (+ **D7** / motion documenté) : primitive / §8 → story → statut (fait / WONTFIX + issue).  
- [x] **4.2** — **D3** : revue imports `packages/types` et appels BFF/API des pages livrées.  
- [x] **4.3** — §8.0–8.10 : couverture ou **WONTFIX** (audit ou issue par famille).  
- [x] **4.4** — README kit ou index primitives (`Docs/` ou `apps/web`).  
- [x] **4.5** — Relecture [audit §11](audit-integration-kit-ux-allaboard.md#11-critères-de-succès).  
- [x] **4.6** — **P** : **R1–R6** complets (ou **skip** / **WONTFIX** par ID) ; **M/S** optionnels.  
- [x] **4.7** — `pnpm verify` sur la branche qui merge vers **`Dev`**.
### Jalons

> **Preuve** : cocher **V** / **T** / **P** uniquement après exécution locale réussie ([§2.8](#validation-locale-avant-pr)), pas après lecture du plan.

- [x] **V** / **T** / **P** — selon [§3](#jalons-de-test-v--t--m--s--p) ; **M/S** optionnels.

### Agent — sortie

- Gate **L** ([§2.8](#validation-locale-avant-pr)) complète, puis [§13 Merge `Dev`](#merge-vers-dev) : toutes les cases applicables satisfaites (après PR + CI).

---

<a id="recette-manuelle-r1--r6"></a>

## 12. Recette manuelle (R1–R6)

> Grille **humaine** ; avec **D4**, reproduire en **Playwright** ([§2.5](#execution-agent-autonome)).

> `pnpm --filter web dev` ou URL déployée ; adapter aux routes App Router.

| ID | Parcours | À vérifier |
|:---:|----------|------------|
| **R1** | Visiteur | Landing ; liens auth ; pas d’erreur console bloquante |
| **R2** | Auth | Erreurs formulaire ; session ou état connecté |
| **R3** | CGU | Modale → case → validation → suite |
| **R4** | Feed | Liste, sidebar, CTA, ouverture post / détail |
| **R5** | Messages | Liste + conversation + chat React *(si route livrée)* |
| **R6** | Mentor / admin | Menus, dashboard sans **500** *(si routes livrées)* |

---

<a id="merge-vers-dev"></a>

## 13. Merge vers `Dev`

> Prérequis : gate **L** ([§2.8](#validation-locale-avant-pr)) complète **avant** d’ouvrir la PR ; cocher les cases ci‑dessous après **L**, relecture et **CI** verte sur la PR.

- [x] Gates des phases touchées : cochées ou **WONTFIX** + issue.  
- [x] §8.0–8.10 : couverture ou **WONTFIX** ([kit-ux-index](kit-ux-index.md), [wontfix-kit-ux](wontfix-kit-ux.md)).  
- [x] **D1–D7** : alignés [§5](#décisions-mvp-d1d6) ou décision documentée.  
- [x] [Décision build](#13-décision-build) à jour.  
- [x] **G0** : terminée ou **N/A**.  
- [x] Audit **§11** relu (**4.5**).  
- [ ] `pnpm verify` vert en **CI** sur la PR (local : gate **L** ✓).  
- [ ] **T** vert en **CI** sur la PR (local : gate **L** ✓).  
- [x] **P** vert en local (gate **L** ✓) ; confirmer en **CI** sur la PR.

---

<a id="13-décision-build"></a>

## 14. Décision build et pipeline

> Décision **figée** (options **A + C**, dates ci‑dessous). Toute montée **Tailwind v4** ou changement de pipeline = **nouvelle issue** + mise à jour de cette section.

**Storybook / Node** : aligner **Storybook** sur **Node** dev/CI. Node **20.18.x** (sans 20.19+) → ne pas viser CLI **10+** sans upgrade Node ; **8.4.x** — [`apps/web/README.md`](../../apps/web/README.md). Après **Node 20.19+** : réévaluer montée (issue + D1 + lockfile).

| Option | Coché | Notes |
|--------|:-----:|-------|
| **A** — Tailwind (PostCSS classique) + Next | [x] | Défaut MVP — `tailwind.config.ts`, `postcss.config.mjs`. |
| **B** — Tailwind **v4** + pipeline doc Next | [ ] | Non retenu. |
| **C** — **shadcn/ui** + CLI `add` | [x] | `components.json`, `components/ui/*`. |
| **D** — Autre (décrire) | [ ] | |

**Décision** : **A + C** — **Date** : 2026-05-19

**Storybook en CI** : ☑ — **Date** : 2026-05-19

Si l’étape CI a été ajoutée **avant** options **A/B** et **Décision** figées, **revérifier** après choix final (preview, deps, cache) — [D1](#décisions-mvp-d1d6), [G1](#gate-g1--spike-technique).

**Playwright en CI** : ☑ — **Date** : 2026-05-19

**D2 (rappel)** : chemins fichiers des tokens consommés par `apps/web` (y compris **motion** : durées / easing). Procédure opérationnelle Tailwind : [procedure-tailwind-apps-web.md](procedure-tailwind-apps-web.md).

**Motion (rappel)** : choix libs et exclusions — [§2.7](#motion-in-app), **D7**.

---

<a id="liens"></a>

## 15. Liens

Hub kit : [kit-ux-index.md](kit-ux-index.md). Figures et inventaire **§8** : [audit](audit-integration-kit-ux-allaboard.md) (§2 planche, §9 phasage). Feed / API : [plan Web/API](plan-mise-en-place-web-api-donnees.md). Dataflow cible long terme : [dataflow-architecture.md](dataflow-architecture.md).
