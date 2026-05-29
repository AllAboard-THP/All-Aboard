# Runbook — Dokploy staging (Phase 2)

Checklist **manuelle** pour aligner **staging** sur le MVP livré sur `Dev` (Phase 2 Postgres/auth, parcours Bob). Ne pas commiter de secrets dans ce dépôt.

Références : [plan opérationnel Web/API](plan-mise-en-place-web-api-donnees.md), [fiche instance Dokploy](deploiement-dokploy-instance-allaboard.md), [checklist promotion](staging-checklist.md), issue [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32).

**URLs** : `https://staging.allaboard.fr`, `https://api-staging.allaboard.fr`.

---

## 0. Promotion code (`staging` Git)

La branche **`staging`** est protégée — merge via PR depuis `Dev` (ex. PR #54).

- [x] PR `Dev` → `staging` mergée (PR #54, 2026-05-26)
- [x] Deploy Dokploy API terminé (PR #54) ; Web : build auto **en erreur** le 2026-05-26 → **deploy manuel réussi** le 2026-05-27 (commit `d9ca975`)

---

## 1. Postgres (env staging)

- [x] Service Postgres **running** (Dokploy env `staging`)
- [ ] Noter hôte interne (`allaboard-monorepo-website-postgres-staging-…`), port `5432`, utilisateur, mot de passe, base (UI Postgres uniquement)
- [ ] Construire `DATABASE_URL` **hors repo** → service **API** staging → **Environment**

```text
postgresql://<USER>:<PASSWORD>@<HOST_INTERNE_POSTGRES_STAGING>:5432/<DATABASE>
```

---

## 2. Variables service **API** (staging)

| Variable | Obligatoire | Note |
|----------|-------------|------|
| `DATABASE_URL` | Oui | Postgres staging interne |
| `JWT_SECRET` | Oui | ≥ 32 caractères (**distinct** de dev) |
| `DEV_SEED_PASSWORD` | Oui (post ADR 0003) | Mot de passe comptes seed — Dokploy uniquement ; lancer `db:seed` une fois |
| `MVP_LOGIN_PASSWORD` | **Non** (retirer) | Remplacé par users hash — [ADR 0003](adr/0003-authentication-users-production.md) |
| `PORT` | Oui | `4000` |
| `NODE_ENV` | Oui | `production` |
| `APP_ENV` | Recommandé | `staging` |

- [x] Vars posées (2026-05-25, MCP Dokploy)
- [x] `MVP_LOGIN_PASSWORD` retiré ; `DEV_SEED_PASSWORD` seul (2026-05-29)
- [x] Redéploy API après merge PR #54 (2026-05-26) ; promotion PR #63 (ADR 0003, 2026-05-28)
- [x] Smoke : `POST /auth/login` (invalides) → **401** ; login `bob@dev.local` / `alice@dev.local` → **200** (seed ADR 0003, 2026-05-29)
- [x] `GET /feed` → UUID Postgres (pas stub Phase 1)

---

## 3. Variables service **Web** (staging)

| Variable | Obligatoire | Note |
|----------|-------------|------|
| `API_URL` | Oui | `http://<NOM_INTERNE_SERVICE_API_STAGING>:4000` |
| `NODE_ENV` | Oui | `production` |
| `APP_ENV` | Recommandé | `staging` |

- [x] `API_URL` interne aligné (`app-back-up-mobile-microchip-nqw5cs:4000` au 2026-05-25)
- [x] Redéploy Web après merge PR #54 (deploy manuel 2026-05-27 — voir §0 si build auto en erreur)

---

## 4. Smoke automatisé

**Base** :

```bash
BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr pnpm smoke:dev
```

**Complet** (auth + création + détail) — après seed users (`bob@dev.local` ou compte équipe) :

```bash
BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr \
SMOKE_LOGIN_EMAIL='bob@dev.local' SMOKE_LOGIN_PASSWORD='<secret-seed>' pnpm smoke:dev
```

**Seed staging** (une fois, shell Dokploy ou job) : `DATABASE_URL` + `DEV_SEED_PASSWORD` → `pnpm --filter api run db:seed`.

Attendu post-promotion : feed Postgres (UUID), pas stub Phase 1 (`id: "1"`).

---

## 5. Smoke navigateur (parcours Bob)

Feed produit sur **`/`** (pas `/feed` — route absente).

- [x] `https://staging.allaboard.fr/` — feed SSR + liens `/requests/[id]` (UUID Postgres)
- [x] `/help/new` — login `bob` + création (feed mis à jour ; redirect détail optionnel)
- [x] Doublon 409 + lien « Voir la demande existante »
- [x] `/mentor` — `alice` (dashboard mentor + feed tagué) ; `bob` (étudiant, accès mentor refusé côté rôle)

---

## 6. Journal et pilotage

- [x] Ligne *Journal* dans [plan opérationnel](plan-mise-en-place-web-api-donnees.md) (2026-05-27)
- [x] Cocher [staging-checklist.md](staging-checklist.md) section infra + smoke + auth ADR 0003 (2026-05-29)
- [x] Clôturer [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32) et [#17](https://github.com/AllAboard-THP/All-Aboard/issues/17) (2026-05-27)

---

## Dépannage rapide

| Symptôme | Action |
|----------|--------|
| `/feed` stub (`id: "1"`) | Code staging obsolète — merger `Dev` → `staging` + redeploy |
| `/auth/login` → 404 | Idem — Phase 2 non déployée |
| `502` API staging | Vars Phase 2 manquantes ou `JWT_SECRET` absent → §2 + redeploy |
| Feed Web KO, API OK | `API_URL` Web (nom interne staging) + redeploy Web |
