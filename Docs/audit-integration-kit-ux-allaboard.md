<!-- markdownlint-disable MD033 MD041 -->
<div align="center">

# Audit — kit UX AllAboard

**Inventaire §8 · ADN · risques · critères §11**

[![Audit](https://img.shields.io/badge/audit-1.5-6366f1?style=flat-square)](./audit-integration-kit-ux-allaboard.md)
[![Plan](https://img.shields.io/badge/plan-5.1-8b5cf6?style=flat-square)](./plan-integration-kit-ux-allaboard.md)
[![CI](https://img.shields.io/badge/CI-pnpm%20verify-22c55e?style=flat-square)](../AGENTS.md)

</div>

> [!TIP]
> **Audit** = *quoi* : **§8** inventaire, **§9** phasage stratégique, **§11** succès. **Plan v5.1** = *comment / quand* : phases **P0–P4**, **V/R/M/S/P**, **R1–R6**, [Décision build](plan-integration-kit-ux-allaboard.md#13-décision-build). Chaque PR kit cite **§8.x** et suit les gates du plan.

**Version** : 1.5 · **Date** : 2026-05-13  
**Périmètre** : monorepo All-Aboard (`apps/thp-final` principal, `apps/web`, `apps/api`)

**Décisions déjà posées** : **Tailwind** seule stack utilitaire ; cible **build npm** sur `thp-final` (fin du **CDN**) ; charte **AllAboard** (`--sl-*`, `application.css`) — pas de kit tiers imposé ; pas de fidélité à un gabarit externe type « Grenoble Roller ».

---

## Sommaire

1. [Résumé exécutif](#1-résumé-exécutif)  
2. [Visualisations](#2-visualisations)  
3. [Contexte technique](#3-contexte-technique)  
4. [ADN visuel et tokens](#4-adn-visuel-et-tokens)  
5. [Parcours et surfaces](#5-parcours-et-surfaces)  
6. [Écarts (gaps)](#6-écarts-gaps)  
7. [Définition du kit cible](#7-définition-du-kit-cible)  
8. [Inventaire canonique](#8-inventaire-canonique)  
9. [Phasage et plan](#9-phasage-et-plan)  
10. [Risques](#10-risques)  
11. [Critères de succès §11](#11-critères-de-succès)  
12. [Liens](#12-liens)  
13. [Annexes chemins](#13-annexes-chemins)  

---

## 1. Résumé exécutif

> [!NOTE]
> AllAboard a déjà une **direction visuelle cohérente** (dark UI, Inter, indigo / violet / rose, glass, feed / auth / chat). Le kit ne remplace pas un thème externe : il **formalise** tokens, primitives, doc et règles — compatible **Tailwind**, **Hotwire**, îlots **React** (`ChatApp`).

**Livrables audit** : cadre **kit de base**, **trois** figures (§2), inventaire **§8**, phasage **§9**, risques **§10**, critères **§11**. L’**exécution** (cases `- [ ]`, `pnpm verify`, `bin/rails test`, **R1–R6**) : [plan d’intégration v5.1](plan-integration-kit-ux-allaboard.md).

---

## 2. Visualisations

<details open>
<summary><strong>§2.1 Couches</strong> — apps → kit → fondations</summary>

Illustration des **couches** : applications, socle kit, dépendances transverses.

![Couches architecture kit UX](audit-integration-kit-ux/assets/audit-kit-architecture-couches.png)

</details>

<details open>
<summary><strong>§2.2 Roadmap phases</strong> (détail textuel §9 + plan)</summary>

Vue synthétique des **phases** (alignée [§9](#9-phasage-et-plan)).

![Phases roadmap kit UX](audit-integration-kit-ux/assets/audit-kit-phases-roadmap.png)

</details>

### §2.3 Planche kit complet (familles 0 → 10)

<p align="center">
  <img src="audit-integration-kit-ux/assets/audit-kit-complet-showcase.png" alt="AllAboard — kit de base, aperçu complet (familles 0 à 10 : fondations, chrome, navigation, formulaires, auth, boutons, contenu, overlays, admin, produit, légal)" width="720">
</p>

> [!IMPORTANT]
> La **liste canonique** détaillée est en [**§8**](#8-inventaire-canonique) ; l’image et le texte doivent rester **alignés** à chaque évolution. Les figures §2 sont **indicatives** ; les décisions normatives sont les sections textuelles et l’annexe **§13**.

---

## 3. Contexte technique

> État **au moment de l’audit** (à réviser après migration CDN → build).

| Surface | Rôle UX | Stack UI actuelle |
|---------|---------|-------------------|
| **`apps/thp-final`** | Produit complet (auth, feed, explore, ressources, messages, admin, mentor) | **Tailwind CDN** + config inline dans `application.html.erb` ; **`application.css`** (`:root`, `.glass`, chat, flash, auth) ; **ERB** + **Stimulus** ; **React** (chat) |
| **`apps/web`** | Vitrine Next, BFF feed | **Tailwind** npm ; React ; React Query sur parties du feed |
| **`apps/api`** | Pas d’UI | N/A |

**Constat** : la vérité visuelle **produit** vit surtout dans **Rails** ; Next doit **converger** (tokens partagés, **D3** dans le plan).

**Fichiers de référence** :

- `apps/thp-final/app/views/layouts/application.html.erb`  
- `apps/thp-final/app/assets/stylesheets/application.css`  
- `apps/thp-final/config/routes.rb`  
- `apps/web/app/`  

---

## 4. ADN visuel et tokens

### 4.1 Palette et surfaces

| Rôle | Valeur / pattern | Source |
|------|------------------|--------|
| Primary | `#6366f1` | `--sl-primary`, Tailwind `primary` |
| Secondary | `#8b5cf6` | `--sl-secondary` |
| Accent | `#ec4899` | `--sl-accent` |
| Fonds | `#020617`, `#0f172a` | `--sl-darker`, `--sl-dark` |
| Surface cartes | `#1e293b`, overlays | `--sl-surface`, `.glass` |
| Texte | hiérarchie slate / blanc | Tailwind + ERB |

### 4.2 Typographie et icônes

- **Inter** (Google Fonts), 300–800.  
- **Font Awesome 6**.  
- **highlight.js** (atom-one-dark).

### 4.3 Motion

- Animations : `fade-in`, `slide-up`, `pulse-slow`.  
- Hover cartes : `.post-card`, `.glass-hover`.  
- Toasts flash.

### 4.4 Contrainte dynamique

- **Matière** : `subject.accent_color` en inline — le kit expose un **slot sémantique** (variable CSS ou utilitaire), pas une couleur figée.

---

## 5. Parcours et surfaces

Aligné sur [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) et les routes.

| Zone | Besoins kit |
|------|-------------|
| **Pré-auth** | Formulaires, flash, liens, layout auth / grille |
| **Devise** | Mêmes **primitives** que home |
| **Gate CGU** | Modal, checkbox + CTA disabled / actif |
| **Shell connecté** | Nav glass, menu compte, badges, mobile, footer |
| **Feed** | Cartes, listes, sidebars, CTA, scroll |
| **Messages** | Master-detail + React ; bulles CSS |
| **Rôles** | Mentor (emerald), admin (jaune), destructif (rouge) |
| **Mails** | Hors runtime ; option tableau tokens → HTML email |

---

## 6. Écarts (gaps)

| Gap | Description | Impact |
|-----|-------------|--------|
| **Tokens dispersés** | `:root`, Tailwind inline, hex ERB / Next | Thème clair et maintenance difficiles |
| **Tailwind CDN** | Pas de purge build | Gap jusqu’à **build npm** ([plan](plan-integration-kit-ux-allaboard.md)) |
| **Formulaires dupliqués** | Home vs Devise | Dette UX / a11y |
| **Pas d’inventaire doc** | Pas « composant → partial » | Onboarding coûteux |
| **Next vs Rails** | Deux pipelines | Dérive marque sans tokens partagés |
| **Tests UI** | Pas `test/system` / Playwright `thp-final` | [Plan](plan-integration-kit-ux-allaboard.md) : **V/R/M/S/P** + **R+** Rails par phase ; **D4** |

---

## 7. Définition du kit cible

Ensemble **contractuel** (pas une lib npm obligatoire jour 1) :

1. **Tokens** — sémantique stable → `theme.extend` et/ou `application.css`.  
2. **Primitives** — `Button`, `Input`, `Card`, `Modal`, `Badge`, `NavLink`, `Toast`, `SubjectChip`… en **ERB + Tailwind** (+ CSS ciblé bulles chat).  
3. **Règles** — `glass` vs `bg-surface`, typo, **WCAG** sur glass.  
4. **Vitrine** (optionnel) — Storybook ou page showcase (`thp-final`).  
5. **Package** (optionnel) — `packages/ui-tokens` pour `web` + doc Rails.

---

## 8. Inventaire canonique

Checklist **fonctionnelle** : une ligne **§8.x** ≈ une **primitive documentée** (partial, utilitaire, React). **Suivi PR** : [plan v5.1](plan-integration-kit-ux-allaboard.md).

### Alignement audit ↔ plan (référence)

| Famille **§8** | Phase **plan** (principale) |
|----------------|----------------------------|
| **§8.0** | P0 Fondations |
| **§8.1**, **§8.3–8.5**, **§8.7** (partie shell) | P1 Shell et auth |
| **§8.2**, **§8.6**, **§8.7** (contenu) | P2 Contenu et messages |
| **§8.8–8.10**, **§8.9** | P3 Dense et spécifique |
| Couverture **§8.0–8.10** ou **WONTFIX** | P4 Clôture |

<details>
<summary><strong>Développer l’inventaire §8.0 à §8.11</strong> (tables complètes)</summary>

### 8.0 Fondations

| Élément | Contenu attendu |
|---------|-----------------|
| **Tokens** | Couleurs, rayons, ombres, espacements, `z-index`, **focus ring** |
| **Typographie** | display, h1–h3, body, small, overline ; graisses ; `line-height` |
| **Grille** | `max-w-7xl`, gutters, `main` / sidebar, **safe areas** |
| **Thème** | **Dark** prioritaire ; **light** optionnel (même token set) |
| **Motion** | Durées / easing (carte, modale, toast) |

### 8.1 Chrome global

| Élément | Rôle |
|---------|------|
| **App shell** | `nav` + `main` + `footer` + marges |
| **Header** | Glass, logo, liens |
| **Footer** | Légal, secondaires, version |
| **Nav** | État actif feed / explore / ressources / événements / messages |
| **Nav mobile** | Barre ou drawer, icônes + labels |
| **Menu user** | Avatar, dropdown profil / posts / bookmarks / mentor / admin / déconnexion |
| **Badges** | Messages non lus, pending mentor |
| **Bandeau** | CGU, alertes, maintenance |
| **Scroll to top** | FAB feed |

### 8.2 Navigation de page

| Élément | Usage |
|---------|--------|
| **Breadcrumbs** | explore → matière → post, admin |
| **Onglets** | Segmentation écran |
| **Pills** | Filtres statut, matière |
| **Page heading** | Titre + actions |
| **Split view** | Liste conversations + détail |

### 8.3 Formulaires

| Élément | Variantes |
|---------|-----------|
| **Label** | `required`, hint |
| **Input** | default, focus, erreur, disabled, read-only |
| **Textarea** | resize, compteur (optionnel) |
| **Select** | Dark cohérent |
| **Checkbox / radio** | CGU, groupes |
| **Switch** | Notifications |
| **File** | Avatar, PJ |
| **Champ code** | + **highlight.js** |
| **Search** | Messages, explore |
| **Grille champs** | ex. inscription 2 col |
| **Actions** | Primaire, secondaire, annuler |
| **Erreurs** | Équivalent `devise/shared/_error_messages` |

### 8.4 Auth et compte

| Écran | Fichier |
|-------|---------|
| Connexion | `devise/sessions/new.html.erb` |
| Inscription | `devise/registrations/new.html.erb` |
| Édition compte | `devise/registrations/edit.html.erb` |
| MDP oublié | `devise/passwords/new.html.erb` |
| Reset MDP | `devise/passwords/edit.html.erb` |
| Confirmation | `devise/confirmations/new.html.erb` |
| Déblocage | `devise/unlocks/new.html.erb` |
| Liens | `devise/shared/_links.html.erb` |
| Landing | `home/index.html.erb` |
| **Mails** | `devise/mailer/*.html.erb` |

### 8.5 Boutons

| Élément | Détail |
|---------|--------|
| **Button** | primary, secondary, ghost, danger, link |
| **Tailles** | sm, md, lg, icon-only |
| **États** | default, hover, active, disabled, **loading** |
| **Button group** | Annuler / Enregistrer |
| **Icon button** | Fermer, menu, retour mobile |

### 8.6 Contenu et listes

| Élément | Usage |
|---------|--------|
| **Card** | Post, ressource, événement, sidebar |
| **Card interactive** | Hover, lien |
| **List row** | Conversation, modération |
| **Media object** | Avatar + meta |
| **Badge** | Statut, urgence, compteur |
| **Badge matière** | **`accent_color`** |
| **Tag / chip** | Sujets, filtres |
| **Empty** | Liste vide + CTA |
| **Skeleton** | Feed (optionnel) |

### 8.7 Overlays

| Élément | Note |
|---------|------|
| **Alert inline** | Succès / erreur |
| **Flash / toast** | Pile, variants |
| **Modal** | CGU, post, matière, confirmations |
| **Drawer** | Mobile (optionnel) |
| **Tooltip** | Optionnel, a11y |
| **Progress** | Upload |
| **Spinner** | Rare, Turbo |

### 8.8 Admin et données denses

| Élément | Usage |
|---------|--------|
| **Table** | Modération, users, ressources |
| **Table** | Tri, pagination, actions ligne |
| **KPI** | Dashboard admin / mentor |
| **Filtres** | Barre recherche + dropdowns |

### 8.9 Spécifique produit

| Élément | Note |
|---------|------|
| **Bulles chat** | own / other — `application.css` |
| **Bloc code** | Commentaires + hljs |
| **Carte post** | Likes, bookmarks, meta, urgence |
| **Profil** | Bannière, avatar, mentor |

### 8.10 Légal

| Élément | Usage |
|---------|--------|
| **Page texte** | CGU, confidentialité, mentions |
| **Link** | Interne, externe, mailto |

### 8.11 Priorité MVP

Livrer d’abord : **tokens** + **grille** ; **boutons** + **champs** + **erreurs** ; **carte** + **badge matière** ; **shell** ; **modal CGU** + **toast** ; **nav actif**. Puis **§8.0–8.10** par extensions.

**Documentation** : ce fichier + [plan](plan-integration-kit-ux-allaboard.md) + **README kit** (futur).

</details>

---

## 9. Phasage et plan

> [!NOTE]
> **§9** = vue **stratégique** (tableau ci‑dessous). **Plan v5.1** = livrables numérotés, **V/R/M/S/P**, **R1–R6**, **Mermaid**, **Décision build**, **P4** clôture.

| Phase | Contenu | Critère de fin |
|-------|---------|----------------|
| **0** | Tokens + **build Tailwind npm** + retrait CDN + `:root` / `tailwind.config` | CI reproductible ; `pnpm verify` vert |
| **1** | Nav, footer, menu, **CGU**, auth unifié | Visiteur → connecté ; contrastes modales |
| **2** | Cartes, listes, explore, ressources, événements | Primitives ; moins de hex en ERB |
| **3** | Chat ERB + React, admin/mentor, mails | Bulles + layouts ; mails cartographiés |
| **4** *(plan)* | **D1**, **D3**, **WONTFIX §8**, **§11** | Merge `Dev` |

Les figures **§2** couvrent surtout les phases **0–3** ; la **phase 4** est détaillée dans le [plan](plan-integration-kit-ux-allaboard.md) (schéma Mermaid inclus).

---

## 10. Risques

| Risque | Mitigation |
|--------|------------|
| Turbo / Stimulus | PR petites ; plan : **R1–R6** + **R** ; `test/system` ou **P** (**D4**) |
| Tailwind vs CSS custom | Primitives = Tailwind ; **exceptions** documentées dans `application.css` (« pourquoi ») |
| Double stack | Pas Bootstrap / second framework |
| Next vs Rails | Tokens partagés + PR alignement **D3** |

---

## 11. Critères de succès

> Le [plan](plan-integration-kit-ux-allaboard.md) opérationnalise ces points (tâches + **R1–R6**).

- [ ] Document **tokens** validé et reflété dans le code.  
- [ ] **Aucune** dépendance UI majeure non validée (Tailwind + CSS actuel).  
- [ ] **Trois** parcours sans régression majeure : landing + login, CGU, feed + post.  
- [ ] **Accessibilité** : focus, labels, CGU disabled, contrastes `glass`.  
- [ ] `pnpm verify` vert — [AGENTS.md](../AGENTS.md), [CI](../../.github/workflows/ci.yml).

---

## 12. Liens

| Ressource | Lien |
|-----------|------|
| **Plan d’intégration v5.1** (P0–P4, tâches, tests, Mermaid) | [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md) |
| Parcours produit | [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) |
| Protocole agent / PR | [AGENTS.md](../AGENTS.md) |
| Carte de la doc | [map-of-content.md](map-of-content.md) |
| Workflow CI | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) |

---

## 13. Annexes chemins

Tokens `:root` — `apps/thp-final/app/assets/stylesheets/application.css` (début de fichier : `--sl-primary`, …).  
Thème Tailwind inline — `apps/thp-final/app/views/layouts/application.html.erb` (bloc `tailwind.config` ~l.38–69).  
Layout connecté — même fichier, `body` et `main` (~l.89–96).

*Fin du document d’audit.*
