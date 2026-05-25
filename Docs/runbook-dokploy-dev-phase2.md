# Runbook — Dokploy dev (Phase 2)

Checklist **manuelle** après merge du code Phase 2 sur la branche **`Dev`**. Ne pas commiter de secrets dans ce dépôt.

Références : [plan opérationnel Web/API](plan-mise-en-place-web-api-donnees.md), [fiche instance Dokploy](deploiement-dokploy-instance-allaboard.md), [ADR auth](adr/0001-authentication-strategy.md).

---

## 1. Postgres (env dev)

- [ ] Service Postgres **running** dans le projet Dokploy dev
- [ ] Noter hôte interne, port `5432`, utilisateur, mot de passe, base (UI uniquement — fiche **Postgres**, onglet **General**)
- [ ] Construire `DATABASE_URL` **hors Dokploy** (bloc-notes, gestionnaire MDP) — **pas de champ `DATABASE_URL` sur la fiche Postgres** ; la chaîne se **colle à l’étape 2** sur le service **API** → **Environment**

```text
postgresql://<USER>:<PASSWORD>@<HOST_INTERNE>:5432/<DATABASE>
```

---

## 2. Variables service **API** (dev)

| Variable | Obligatoire | Note |
|----------|-------------|------|
| `DATABASE_URL` | Oui | Chaîne Postgres interne |
| `JWT_SECRET` | Oui | ≥ 32 caractères |
| `MVP_LOGIN_PASSWORD` | Oui | Mot de passe partagé équipe pour `/help/new` |
| `PORT` | Oui | `4000` |
| `NODE_ENV` | Oui | `production` (image Docker) |
| `APP_ENV` | Recommandé | `dev` |

- [ ] Sauvegarder → **redéployer l’API**
- [ ] Logs : migrations OK, pas d’erreur connexion DB

---

## 3. Variables service **Web** (dev)

| Variable | Obligatoire | Note |
|----------|-------------|------|
| `API_URL` | Oui | `http://<NOM_INTERNE_SERVICE_API>:4000` (HTTP interne, pas `https://api-dev…`) |
| `PORT` | Oui | `3000` |

- [ ] Sauvegarder → **redéployer le Web**

---

## 4. Smoke automatisé

**Base** (sans secret local) :

```bash
pnpm smoke:dev
```

Attendu : exit code `0` — `GET /health`, `GET /feed` (API), `GET /api/feed` (BFF).

**Complet** (auth + création + détail) — mot de passe **identique** à la variable `MVP_LOGIN_PASSWORD` du service API Dokploy dev :

```bash
MVP_LOGIN_PASSWORD='<secret-dokploy>' pnpm smoke:dev
```

Attendu : en plus login, `POST /help-requests`, `GET /help-requests/:id`.

Local :

```bash
BASE_WEB=http://127.0.0.1:3000 BASE_API=http://127.0.0.1:4000 MVP_LOGIN_PASSWORD=... pnpm smoke:dev
```

---

## 5. Smoke navigateur (parcours Bob)

- [ ] `https://dev.allaboard.fr` — feed produit (« Feed communautaire »), liens `/requests/[id]`
- [ ] `https://dev.allaboard.fr/help/new` — login + création → redirect détail
- [ ] Même titre deux fois → message doublon + lien demande existante
- [ ] `https://dev.allaboard.fr/mentor` — login `alice` → liste tags ; `bob` → refus non-mentor
- [ ] Rafraîchir feed (TanStack) après création

---

## 6. Journal et pilotage

- [ ] Ajouter une ligne dans le *Journal* de [plan-mise-en-place-web-api-donnees.md](plan-mise-en-place-web-api-donnees.md) (date, URLs, résultat)
- [ ] **ADR #18** : validation équipe (commentaire PR ou issue GitHub — pas de secret dans le repo)
- [ ] Mettre à jour le board GitHub (#33, epic Backend) si utilisé

Template journal :

```text
| YYYY-MM-DD | Dokploy dev (Phase 2) | smoke: pnpm smoke:dev OK ; /help/new ; vars DATABASE_URL/JWT/MVP_LOGIN OK |
```

---

## Dépannage rapide

| Symptôme | Action |
|----------|--------|
| **`502` / `error code: 502`** sur `https://api-dev.allaboard.fr/*` (Cloudflare) | Conteneur API **down** ou crash au boot — logs **runtime** API (pas build). Cause fréquente post-Phase 2 : **`JWT_SECRET` absent** (`NODE_ENV=production` dans l’image) → poser toutes les vars §2 → **Save** → **Redeploy** |
| `database_unavailable` sur `/feed` | Vérifier `DATABASE_URL` + Postgres + redéploy API |
| Feed site `fetch failed`, API publique OK | Corriger `API_URL` Web (nom interne) + redéploy Web |
| Login échoue | `MVP_LOGIN_PASSWORD` sur **API** uniquement |
| Vars modifiées mais comportement inchangé | **Redeploy** obligatoire après Save Environment |
| Code ancien (pas d’auth) | Vérifier branche `Dev` + dernier deploy |
