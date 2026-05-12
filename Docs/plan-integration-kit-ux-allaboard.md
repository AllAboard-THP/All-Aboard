# Plan d’intégration — kit UX AllAboard

**Version** : 3.0 (simplifié) — 2026-05-12  
**Audit** : [audit-integration-kit-ux-allaboard.md](audit-integration-kit-ux-allaboard.md) — inventaire **§8**, risques **§10**, succès **§11**.  
**Dépôt** : [AGENTS.md](../AGENTS.md) — `pnpm verify` avant commit / push.

**But** : intégrer le kit sur **`apps/thp-final`**, couvrir **§8.0 à §8.10** (ou ticket **WONTFIX** avec raison), puis merger vers **`Dev`** quand la checklist ci-dessous est verte.

---

## 1. Règles All-Aboard

- Monorepo : tout changement UI passe **`pnpm verify`** à la racine.  
- **`thp-final`** = référence produit ; **`apps/web`** : alignement charte / tokens selon décision **D3** (pas de double stack contradictoire).  
- **Tailwind** en build **npm** (objectif : plus de CDN) ; pas Bootstrap ni second framework utilitaire.  
- **Rails** : Hotwire + ERB + îlot **React** (`ChatApp`) — pas de régression cable / montage.  
- **`application.css`** : garder ce qui est spécifique (bulles chat, flash, animations) ; tout nouveau bloc custom = **commentaire « pourquoi »**.  
- Charte existante (tokens `--sl-*`, thème indigo / violet / rose, dark-first, Inter, Font Awesome, highlight.js, badges matière `accent_color`).  
- UI **français** ; accessibilité de base (focus, labels, CGU disabled, contrastes).

---

## 2. C’est fini quand (intégration complète)

- [ ] **Build** : pipeline Tailwind documenté (voir **§7**), CDN retiré, `content` couvre ERB + helpers + JS/JSX.  
- [ ] **Tokens** : une table (token → CSS → Tailwind) + focus / z-index ; motion et thème light selon **D5** (implémenté ou « reporté » daté).  
- [ ] **Couverture** : familles **§8.0–8.10** traitées ou **WONTFIX** tracé.  
- [ ] **Décisions** **D1–D5** : remplies ou report daté dans le tableau **§4**.  
- [ ] **Doc** : primitives réutilisables listées (README kit ou `Docs/`, même minimal).  
- [ ] **Recette** **R1–R6** (§3) après le dernier lot UI.  
- [ ] **Audit §11** relu une dernière fois.  
- [ ] **`pnpm verify`** vert sur la branche au merge vers `Dev`.

---

## 3. Recette manuelle (à refaire quand l’UI touche le parcours)

| # | Parcours | Vérifier |
|---|----------|----------|
| R1 | Visiteur | Landing → login / inscription, pas d’erreur console |
| R2 | Devise | Erreurs formulaire + login OK → feed |
| R3 | CGU | Modale → case → submit → feed |
| R4 | Feed | Liste, sidebar, FAB, ouverture post |
| R5 | Messages | Liste, conversation, chat React |
| R6 | Mentor / admin | Menu + dashboard sans 500 (si compte test) |

*(Automatique : `pnpm verify`. Le reste est manuel ou selon **D4**.)*

---

## 4. Décisions à noter (atelier)

| ID | Sujet | À décider |
|----|--------|-----------|
| D1 | Vitrine primitives (`/ui`, Storybook, Markdown…) | |
| D2 | Package `packages/ui-tokens` ? | |
| D3 | Quand / comment aligner **Next** (`apps/web`) ? | |
| D4 | Tests visuels (Playwright, autre, manuel seul) ? | |
| D5 | Thème **light** : scope ou report ? | |

---

## 5. Ordre de travail (4 phases)

**Principe** : petites PR, une story = une primitive ou un lot cohérent ; chaque PR cite une ligne **§8.x** de l’audit ; **`pnpm verify` vert** ; recette **R1–R6** sur les parcours touchés.

| Phase | Contenu principal | Réf. audit |
|-------|-------------------|-------------|
| **0 — Fondations** | Choisir pipeline (`cssbundling-rails` + Tailwind **ou** script npm déjà en place) ; `tailwind.config` + entrée CSS + build ; retirer le CDN **après** branchement de la feuille compilée ; table tokens amorcée. | §8.0 |
| **1 — Shell** | Partials boutons / champs ; home + **tout** Devise + nav / footer / mobile / CGU / flash / toasts ; compte utilisateur ; a11y de base. | §8.1, §8.3–8.5, §8.7, §8.4 |
| **2 — Contenu** | Navigation page (breadcrumbs, tabs, headings) ; cartes, listes, badges, tags, empty (+ skeleton si retenu) ; modales métier ; messages (split view). | §8.2, §8.6, §8.7 |
| **3 — Dense & spécifique** | Chat + blocs code + hljs ; tables admin / mentor ; mails Devise ; pages légales ; polish profil / carte post riche. | §8.8–8.10, §8.9 |

**Lots de PR (indicatif)** — une ligne peut être découpée en plusieurs PR :

1. Config Tailwind + `content` + entrée CSS + doc build (P0).  
2. Retrait CDN + `stylesheet_link_tag` (P0).  
3. Table tokens + mapping (P0).  
4. Partials boutons puis champs (P1).  
5. Home + vues Devise + erreurs / liens (P1).  
6. Nav, footer, bannières, modale CGU, flash (P1).  
7. Breadcrumbs, tabs, cartes feed / explore / ressources / événements (P2).  
8. Badges, tags, empty, list rows, modales création / confirmation (P2).  
9. Split messages + polish (P2).  
10. Chat CSS + React ; code commentaires + hljs (P3).  
11. Tables admin / mentor ; mails ; pages légales (P3).  
12. Alignement **`apps/web`** selon **D3** (quand tranché).

Le détail fichier par fichier (T0.x, T1.x…) reste dérivable de l’**inventaire §8** de l’audit ; pas besoin de dupliquer ici.

---

## 6. Avant / après chaque PR (checklist courte)

**Avant de coder** : référence §8.x ; référence visuelle (planche audit §2.3 ou écran existant) ; pas de conflit gros layout en parallèle ; Phase 0 terminée si on touche aux vues en masse.

**Avant merge** : `pnpm verify` ; critères de la story OK ; **R1–R6** sur les parcours impactés ; nouvelle primitive = une ligne dans la doc kit.

**Phase 0 — garde-fous** : décision build écrite (§7) ; `content` inclut bien ERB + helpers + JSX ; thème (`theme.extend`) vivant dans la config, pas seulement inline disparu.

---

## 7. Décision build (à remplir une fois le spike fait)

| Option | Coché | Notes |
|--------|-------|-------|
| A — `cssbundling-rails` + `tailwindcss` npm | | |
| B — Pipeline / script npm dans `thp-final` | | |
| C — Autre | | |

**Décision** : … — **Date** : …

---

## 8. Liens

- [Audit kit UX](audit-integration-kit-ux-allaboard.md)  
- [Parcours utilisateur](moc-parcours-utilisateur.md)  
- [Carte de la doc](map-of-content.md)
