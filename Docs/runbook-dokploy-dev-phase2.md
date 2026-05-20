# Runbook — Dokploy dev (Phase 2)

Checklist **manuelle** après merge du code Phase 2 sur la branche **`Dev`**. Ne pas commiter de secrets dans ce dépôt.

Références : [plan opérationnel Web/API](plan-mise-en-place-web-api-donnees.md), [fiche instance Dokploy](deploiement-dokploy-instance-allaboard.md), [ADR auth](adr/0001-authentication-strategy.md).

---

## 1. Postgres (env dev)

- [ ] Service Postgres **running** dans le projet Dokploy dev
- [ ] Noter hôte interne, port `5432`, utilisateur, mot de passe, base (UI uniquement)
- [ ] Construire `DATABASE_URL` pour l’**API** :

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

```bash
MVP_LOGIN_PASSWORD='<secret-dokploy>' pnpm smoke:dev
```

Attendu : exit code `0`.

Checks : `GET /health`, `GET /feed` (API), `GET /api/feed` (Web) ; si mot de passe fourni : login + création help-request sur l’API.

Local :

```bash
BASE_WEB=http://127.0.0.1:3000 BASE_API=http://127.0.0.1:4000 MVP_LOGIN_PASSWORD=... pnpm smoke:dev
```

---

## 5. Smoke navigateur

- [ ] `https://dev.allaboard.fr` — feed SSR
- [ ] `https://dev.allaboard.fr/help/new` — login + création demande
- [ ] Retour accueil — nouvelle ligne visible
- [ ] (Optionnel) même titre deux fois → message doublon

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
| `database_unavailable` sur `/feed` | Vérifier `DATABASE_URL` + Postgres + redéploy API |
| Feed site en erreur, API publique OK | Corriger `API_URL` Web (nom interne) + redéploy Web |
| Login échoue | `MVP_LOGIN_PASSWORD` sur **API** uniquement |
| Code ancien (pas d’auth) | Vérifier branche `Dev` + dernier deploy |
