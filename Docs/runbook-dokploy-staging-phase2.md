# Runbook — Dokploy staging (Phase 2)

Checklist **manuelle** pour aligner **staging** sur le MVP livré sur `Dev` (Phase 2 Postgres/auth, parcours Bob). Ne pas commiter de secrets dans ce dépôt.

Références : [plan opérationnel Web/API](plan-mise-en-place-web-api-donnees.md), [fiche instance Dokploy](deploiement-dokploy-instance-allaboard.md), [checklist promotion](staging-checklist.md), issue [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32).

**URLs** : `https://staging.allaboard.fr`, `https://api-staging.allaboard.fr`.

---

## 0. Promotion code (`staging` Git)

La branche **`staging`** est protégée — merge via PR depuis `Dev` (ex. PR #54).

- [ ] PR `Dev` → `staging` mergée
- [ ] Auto-deploy Dokploy Web + API (branche `staging`) terminé

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
| `MVP_LOGIN_PASSWORD` | Oui (MVP interne) | Mot de passe partagé équipe — Dokploy uniquement |
| `PORT` | Oui | `4000` |
| `NODE_ENV` | Oui | `production` |
| `APP_ENV` | Recommandé | `staging` |

- [x] Vars posées (2026-05-25, MCP Dokploy)
- [ ] Redéploy API après merge code MVP si build antérieur
- [ ] Logs : migrations OK, `GET /auth/login` → 401 (pas 404)

---

## 3. Variables service **Web** (staging)

| Variable | Obligatoire | Note |
|----------|-------------|------|
| `API_URL` | Oui | `http://<NOM_INTERNE_SERVICE_API_STAGING>:4000` |
| `NODE_ENV` | Oui | `production` |
| `APP_ENV` | Recommandé | `staging` |

- [x] `API_URL` interne aligné (`app-back-up-mobile-microchip-nqw5cs:4000` au 2026-05-25)
- [ ] Redéploy Web après merge PR promotion

---

## 4. Smoke automatisé

**Base** :

```bash
BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr pnpm smoke:dev
```

**Complet** (auth + création + détail) — `MVP_LOGIN_PASSWORD` = variable API Dokploy staging :

```bash
BASE_WEB=https://staging.allaboard.fr BASE_API=https://api-staging.allaboard.fr MVP_LOGIN_PASSWORD='<secret-dokploy>' pnpm smoke:dev
```

Attendu post-promotion : feed Postgres (UUID), pas stub Phase 1 (`id: "1"`).

---

## 5. Smoke navigateur (parcours Bob)

- [ ] `https://staging.allaboard.fr` — feed produit, liens `/requests/[id]`
- [ ] `/help/new` — login + création → détail
- [ ] Doublon 409 + lien demande existante
- [ ] `/mentor` — `alice` / `bob`

---

## 6. Journal et pilotage

- [ ] Ligne *Journal* dans [plan opérationnel](plan-mise-en-place-web-api-donnees.md)
- [ ] Cocher [staging-checklist.md](staging-checklist.md) section infra + smoke
- [ ] Clôturer ou commenter [#32](https://github.com/AllAboard-THP/All-Aboard/issues/32) après validation équipe

---

## Dépannage rapide

| Symptôme | Action |
|----------|--------|
| `/feed` stub (`id: "1"`) | Code staging obsolète — merger `Dev` → `staging` + redeploy |
| `/auth/login` → 404 | Idem — Phase 2 non déployée |
| `502` API staging | Vars Phase 2 manquantes ou `JWT_SECRET` absent → §2 + redeploy |
| Feed Web KO, API OK | `API_URL` Web (nom interne staging) + redeploy Web |
