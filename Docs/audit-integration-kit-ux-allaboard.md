# Audit — intégration d’un kit UX personnalisé (AllAboard)

**Version** : 1.3 — 2026-05-12  
**Périmètre** : monorepo All-Aboard (`apps/thp-final` produit principal, `apps/web`, `apps/api`).  
**Décisions déjà posées** (contexte projet) : **Tailwind comme seule stack utilitaire** (pas de Bootstrap ni second framework) ; **cible technique** : faire converger `thp-final` vers un **build Tailwind npm** (PostCSS / pipeline d’assets) au lieu du **CDN** actuel — alignement avec `apps/web` et meilleure base pour tokens + plugins. Charte **AllAboard** (variables `--sl-*`, `application.css`, thème étendu) ; **pas de fidélité** à un kit tiers type « Grenoble Roller » — le kit cible est **interne** et aligné sur le CSS existant.

---

## 1. Résumé exécutif

AllAboard dispose déjà d’une **direction visuelle cohérente** (dark UI, Inter, indigo / violet / rose, surfaces glass, patterns feed / auth / chat). L’intégration d’un **kit UX personnalisé** ne consiste pas à importer un thème externe tel quel, mais à **formaliser une couche de design** : tokens sémantiques, primitives UI réutilisables, documentation et règles d’usage — tout en **restant compatible** avec Tailwind, Hotwire, et les îlots React (`ChatApp`).

**Livrable de cet audit** : cadre pour un **kit de base** (fondations + inventaire de composants + phasage), **trois** illustrations (architecture, roadmap, **planche kit complet**), critères de succès et risques.

---

## 2. Visualisations

### 2.1 Couches cibles (apps → kit → fondations)

Illustration conceptuelle des **couches** : applications, socle « kit de base », dépendances transverses.

![Couches architecture kit UX — apps, kit de base, fondations](audit-integration-kit-ux/assets/audit-kit-architecture-couches.png)

### 2.2 Phasage recommandé

Vue synthétique des **phases** de mise en place du kit (détail textuel en section 9).

![Phases roadmap kit UX AllAboard](audit-integration-kit-ux/assets/audit-kit-phases-roadmap.png)

### 2.3 Planche visuelle — kit complet (tous les blocs)

Vue **synthétique unique** regroupant les familles **0 à 10** (fondations → légal) : utile en réunion, onboarding, ou couverture d’une page « kit ». La **liste canonique** détaillée (checklist implémentation) est en **section 8** ; l’image et le texte doivent rester **alignés** lors des évolutions du kit.

![Planche kit complet AllAboard — aperçu des familles 0–10](audit-integration-kit-ux/assets/audit-kit-complet-showcase.png)

> Les images §2 sont **indicatives** (schémas de documentation). Les décisions normatives restent les sections textuelles et les chemins de code cités en annexe.

---

## 3. Contexte technique (état au moment de l’audit)

| Surface | Rôle UX | Stack UI actuelle |
|---------|---------|-------------------|
| **`apps/thp-final`** | Produit complet (auth, feed, explore, ressources, messages, admin, mentor) | **Tailwind CDN** + config inline (`primary`, `darker`, animations) dans `application.html.erb` ; **`application.css`** (variables `:root`, utilitaires `.glass`, chat, flash, auth) ; vues **ERB** + **Stimulus** ; **React** monté pour le chat |
| **`apps/web`** | Vitrine / home Next, BFF feed | **Tailwind** (dépendances npm) ; composants React ; styles locaux + React Query sur parties du feed |
| **`apps/api`** | Pas d’UI | N/A |

**Constat** : la vérité visuelle **produit** vit surtout dans **Rails** ; le web Next doit **converger** via tokens partagés si la marque doit rester unifiée.

**Fichiers de référence** (non exhaustif) :

- `apps/thp-final/app/views/layouts/application.html.erb` — Tailwind CDN, thème étendu, polices, FA, highlight.js  
- `apps/thp-final/app/assets/stylesheets/application.css` — tokens `--sl-*`, patterns métier  
- `apps/thp-final/config/routes.rb` — surface des parcours  
- `apps/web/app/` — pages et composants Next  

---

## 4. ADN visuel & tokens (à pérenniser dans le kit)

### 4.1 Palette et surfaces (déjà en code)

| Rôle | Valeur / pattern typique | Source |
|------|--------------------------|--------|
| Primary | `#6366f1` | `--sl-primary`, Tailwind `primary` |
| Secondary | `#8b5cf6` | `--sl-secondary` |
| Accent | `#ec4899` | `--sl-accent` |
| Fonds | `#020617`, `#0f172a` | `--sl-darker`, `--sl-dark` |
| Surface cartes | `#1e293b`, overlays | `--sl-surface`, `.glass` |
| Texte | hiérarchie slate / blanc | utilitaires Tailwind + ERB |

### 4.2 Typographie & icônes

- **Inter** (Google Fonts), graisses 300–800.  
- **Font Awesome 6** (nav, actions).  
- **highlight.js** (atom-one-dark) pour blocs de code.

### 4.3 Comportements & motion

- Animations Tailwind : `fade-in`, `slide-up`, `pulse-slow`.  
- Transitions hover sur cartes (`.post-card`, `.glass-hover`).  
- Toasts flash avec cycle d’animation dédié.

### 4.4 Données dynamiques (contrainte kit)

- **Couleur par matière** : `subject.accent_color` injectée en inline sur badges / bordures — le kit doit exposer un **slot sémantique** (variable CSS ou utilitaire) sans figer une seule couleur de marque.

---

## 5. Parcours utilisateur & surfaces à couvrir par le kit

Aligné sur [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md) et le routage réel :

| Zone parcours | Besoins kit de base |
|-----------------|---------------------|
| **Pré-auth** (landing, connexion inline home) | Formulaires, alertes flash, liens, layout `auth-shell` / grille |
| **Devise** (inscription, sessions, reset…) | Mêmes **primitives** que home pour cohérence |
| **Gate CGU** | Modal plein écran, checkbox + CTA états disabled / actif |
| **Shell connecté** | Nav fixe glass, menu compte, badges (messages, mentor), nav mobile, footer |
| **Feed & contenu** | Cartes, listes, sidebars sticky, CTA, scroll |
| **Messages** | Master-detail responsive + zone React ; styles bulles déjà en CSS |
| **Rôles** | Variantes mentor (emerald), admin (jaune), actions destructives (rouge) |
| **Mails** | Hors runtime app ; option : **tableau d’équivalence** tokens → HTML email (phase ultérieure) |

---

## 6. Écarts (gaps) entre l’existant et un « kit de base » mature

| Gap | Description | Impact |
|-----|-------------|--------|
| **Dispersion des tokens** | Couleurs en `:root`, config Tailwind inline, classes utilitaires, parfois hex en inline ERB / Next | Maintenance et thème futur (clair) difficiles |
| **Tailwind CDN** (état actuel `thp-final`) | Pas de purge au sens build, config surtout inline | **Décision** : migration vers **build npm** (voir en-tête §) ; jusqu’à migration, le gap reste opérationnel |
| **Duplication de formulaires** | Home vs Devise : patterns proches, classes non strictement identiques | Dette UX et accessibilité |
| **Absence d’inventaire canonique** | Pas de doc « composant X = partial Y + classes Z » | Onboarding et PR UI coûteux |
| **Next vs Rails** | Deux pipelines possibles pour la même marque | Risque de dérive visuelle si pas de package tokens partagé |
| **Tests visuels** | Pas mentionné dans le dépôt pour l’UI | Régressions détectées tardivement |

---

## 7. Définition du « kit UX personnalisé » AllAboard (cible)

Le kit n’est **pas** une librairie npm obligatoire au jour 1. C’est un **ensemble contractuel** :

1. **Tokens** — noms sémantiques stables (`--color-bg`, `--color-primary`, rayons, ombres, espacements) mappés sur Tailwind `theme.extend` et/ou variables consommées par `application.css`.  
2. **Primitives** — blocs récurrents documentés : `Button`, `Input`, `Card`, `Modal`, `Badge`, `NavLink`, `Toast`, `SubjectChip` (avec accent dynamique), etc. — implémentés en **partials ERB + classes Tailwind** et/ou **petits modules CSS** pour ce qui est intraduisible (bulles chat).  
3. **Règles** — quand utiliser `glass` vs `bg-surface`, hiérarchie typo, contrastes (WCAG sur fonds glass).  
4. **Storybook ou page showcase** (optionnel phase 2+) — vitrine des primitives dans `thp-final` ou statique.  
5. **Package partagé** (optionnel) — `packages/ui-tokens` (JSON ou CSS) consommé par `web` et documenté pour Rails.

---

## 8. Inventaire canonique du kit de base (complet)

Checklist **fonctionnelle** : chaque ligne devrait correspondre à une **primitive documentée** (partial, classe utilitaire + règle, ou îlot React) une fois le kit implémenté. La **planche visuelle** associée est la **§2.3**.

### 8.0 Fondations (sans composant « bloc » métier)

| Élément | Contenu attendu |
|---------|-------------------|
| **Tokens** | Couleurs sémantiques, rayons, ombres, espacements, `z-index`, **focus ring** |
| **Typographie** | Échelles display, h1–h3, body, small, overline ; graisses ; `line-height` |
| **Grille & layout** | `max-w-7xl`, gutters, zones `main` / sidebar, **safe areas** mobile |
| **Thème** | **Dark** (prioritaire) ; stratégie **light** (optionnel, même token set) |
| **Motion** | Durées / easing communs (hover carte, modale, toast) |

### 8.1 Mise en page & chrome global

| Élément | Rôle |
|---------|------|
| **App shell** | `nav` + `main` + `footer` + marges (`pt-20`, etc.) |
| **Header / top bar** | Barre fixe type glass, logo, liens principaux |
| **Footer** | Liens légaux, secondaires, version |
| **Nav principale** | Liens avec **état actif** (feed, explore, ressources, événements, messages) |
| **Nav mobile** | Barre ou drawer bas, icônes + labels |
| **Menu utilisateur** | Avatar, dropdown : profil, mes posts, sauvegardes, mentor, admin, déconnexion |
| **Badges compteurs** | Messages non lus, pending mentor, etc. |
| **Bannière / bandeau** | CGU, alertes globales, maintenance |
| **Scroll to top** | FAB (ex. feed) |

### 8.2 Navigation & structure de page

| Élément | Usage |
|---------|--------|
| **Breadcrumbs** | explore → matière → post, admin |
| **Onglets** | Segmentation d’un même écran |
| **Sous-nav / pills** | Filtres statut, matière |
| **Page heading** | Titre + actions primaires (ex. « Créer ») |
| **Split view** | Liste conversations + panneau détail messages |

### 8.3 Formulaires & champs

| Élément | Variantes / états |
|---------|-------------------|
| **Label** | Optionnel `required`, hint dessous |
| **Input** text / email / password | default, focus, erreur, disabled, read-only |
| **Textarea** | resize, compteur caractères (optionnel) |
| **Select / listbox** | Style dark cohérent |
| **Checkbox / radio** | Dont case **CGU** + groupes |
| **Switch** | Notifications, options |
| **File upload** | Avatar, pièces jointes |
| **Champ code** | Conteneur + **highlight.js** |
| **Autocomplete / search** | Messages, explore |
| **Groupe de champs** | Grille 2 colonnes (inscription) |
| **Actions formulaire** | Primaire + secondaire + lien annuler |
| **Résumé d’erreurs** | Équivalent `devise/shared/_error_messages` |

### 8.4 Auth & compte (écrans Devise + home)

| Écran | Référence fichier |
|-------|-------------------|
| Connexion (page) | `devise/sessions/new.html.erb` |
| Inscription | `devise/registrations/new.html.erb` |
| Édition compte | `devise/registrations/edit.html.erb` |
| Mot de passe oublié | `devise/passwords/new.html.erb` |
| Réinitialisation MDP | `devise/passwords/edit.html.erb` |
| Confirmation (renvoi) | `devise/confirmations/new.html.erb` |
| Déblocage compte | `devise/unlocks/new.html.erb` |
| Liens transverses | `devise/shared/_links.html.erb` |
| Landing + co inline | `home/index.html.erb` |
| **Mails Devise** | `devise/mailer/*.html.erb` — variante **email** (tables + styles inline), hors runtime app mais dans le **périmètre charte** |

### 8.5 Actions & boutons

| Élément | Détail |
|---------|--------|
| **Button** | primary, secondary, ghost, danger, link |
| **Tailles** | sm, md, lg, icon-only |
| **États** | default, hover, active, disabled, **loading** (spinner) |
| **Button group** | Annuler / Enregistrer |
| **Icon button** | Fermer modale, menu, retour mobile |

### 8.6 Contenu & listes

| Élément | Usage AllAboard |
|---------|-----------------|
| **Card** | Post, ressource, événement, sidebar « sans réponse » |
| **Card interactive** | Hover lift, lien cliquable |
| **List row** | Conversation, modération |
| **Media object** | Avatar + texte + meta |
| **Badge** | Statut, urgence, compteur |
| **Badge matière** | Couleur **`accent_color`** dynamique |
| **Tag / chip** | Sujets, filtres |
| **Empty state** | Liste vide + CTA |
| **Skeleton** | Chargement feed (optionnel) |

### 8.7 Retour utilisateur & overlays

| Élément | Note |
|---------|------|
| **Alert inline** | Succès / erreur dans la page |
| **Flash / toast** | Pile fixe, variants (CSS existant) |
| **Modal** | CGU, création post, demande matière, confirmations destructives |
| **Drawer** | Optionnel mobile (filtres) |
| **Tooltip** | Optionnel — accessibilité à prévoir |
| **Progress** | Upload, longue action |
| **Spinner global** | Rare, Turbo |

### 8.8 Données denses & admin

| Élément | Usage |
|---------|--------|
| **Table** | Modération, users admin, ressources |
| **Table** | Tri, pagination, ligne actions |
| **Stat pill / KPI** | Dashboard admin / mentor |
| **Filtres bar** | Recherche + dropdowns |

### 8.9 Spécifique produit

| Élément | Note |
|---------|------|
| **Bulles chat + ligne** | own / other — `application.css` |
| **Bloc code** | Commentaires + highlight.js |
| **Carte post** | Likes, bookmarks, meta, urgence |
| **Profil utilisateur** | Bannière, avatar, compétences mentor |

### 8.10 Légal & texte long

| Élément | Usage |
|---------|--------|
| **Page texte** | CGU, confidentialité, mentions |
| **Link** | Interne, externe, mailto |

### 8.11 Priorité de livraison (MVP — sous-ensemble)

Pour ne pas bloquer les itérations, livrer d’abord : **table des tokens** + **grille** ; **boutons** + **champs** + **erreurs** ; **carte** + **badge matière** ; **shell** (header, nav, footer, menu user) ; **modal CGU** + **toast** ; **nav item actif**. Puis étendre section par section selon les **§8.0–8.10**.

**Documentation** : ce fichier + **README kit** (futur) listant chaque primitive avec lien vers partial ou capture.

---

## 9. Phasage recommandé

| Phase | Contenu | Critère de fin |
|-------|---------|----------------|
| **0 — Fondations** | Table tokens + **mise en place build Tailwind npm** sur `thp-final` (retrait CDN) + alignement `:root` / `tailwind.config` | Build reproductible en CI ; couleurs de marque depuis une seule source ; `pnpm verify` vert |
| **1 — Shell** | Nav, footer, menu compte, CGU modal, formulaires auth unifiés | Parcours visiteur → connecté sans régression ; contrastes vérifiés sur modales |
| **2 — Contenu** | Cartes feed, listes, explore, ressources, événements | Partials réutilisent les primitives ; moins de hex dupliqués dans ERB |
| **3 — Spécifique** | Chat (ERB + React), admin/mentor, mail templates | Bulles et layouts alignés tokens ; mails au moins cartographiés |

Les illustrations §2 reprennent cette logique en schéma.

---

## 10. Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| Régression Turbo / Stimulus en refactorant les partials | PR petites ; tests système / manuel checklist par parcours |
| Conflit Tailwind vs CSS custom | Règle : primitives = Tailwind ; **seulement** bulles / tricks CSS complexes restent en `application.css` avec commentaire « pourquoi » |
| Poids bundle si double stack | Ne pas introduire Bootstrap ou second framework |
| Dérive Next vs Rails | Package tokens ou fichier CSS partagé + 1 PR « alignement home Next » |

---

## 11. Critères de succès (kit de base « acceptable »)

- [ ] Document **tokens** validé par l’équipe et reflété dans le code.  
- [ ] **Aucune** nouvelle dépendance UI majeure non validée (reste Tailwind + CSS actuel).  
- [ ] **Trois** parcours sans régression visuelle majeure : landing + login, acceptation CGU, feed + ouverture d’un post.  
- [ ] **Accessibilité** : focus visible, labels formulaires, état disabled CGU, contrastes sur `glass`.  
- [ ] `pnpm verify` vert sur la branche de travail (ex. `feature/ui-tailwind-foundation`).

---

## 12. Liens internes

- **Plan d’intégration & backlog opérationnel** : [plan-integration-kit-ux-allaboard.md](plan-integration-kit-ux-allaboard.md)  
- Parcours produit : [moc-parcours-utilisateur.md](moc-parcours-utilisateur.md)  
- Protocole PR / vérifications : [AGENTS.md](../AGENTS.md)  
- Cartographie doc : [map-of-content.md](map-of-content.md)  

---

## 13. Annexes — extraits de référence (chemins)

Tokens `:root` — `apps/thp-final/app/assets/stylesheets/application.css` (lignes 1–7 du fichier : `--sl-primary`, etc.).  
Thème Tailwind inline — `apps/thp-final/app/views/layouts/application.html.erb` (bloc `tailwind.config` ~l.38–69).  
Layout connecté — même fichier, `body` et `main` (~l.89–96).  

*Fin du document d’audit.*
