# Runbook — Dokploy dev (Phase 2)

**Manual checklist** after Phase 2 code merge on branch **`Dev`**. Do not commit secrets in this repository.

References: [Web/API integration guide](../../guides/web-api-integration.md), [Dokploy instance sheet](../dokploy-instance.md), [auth ADR](../../adr/0001-authentication-strategy.md).

---

## 1. Postgres (dev env)

- [ ] Postgres service **running** in Dokploy dev project
- [ ] Note internal host, port `5432`, user, password, database (UI only — **Postgres** sheet, **General** tab)
- [ ] Build `DATABASE_URL` **outside Dokploy** (notes app, password manager) — **no `DATABASE_URL` field on Postgres sheet**; paste the string at **step 2** on **API** service → **Environment**

```text
postgresql://<USER>:<PASSWORD>@<INTERNAL_HOST>:5432/<DATABASE>
```

---

## 2. **API** service variables (dev)

| Variable | Required | Note |
|----------|----------|------|
| `DATABASE_URL` | Yes | Internal Postgres connection string |
| `JWT_SECRET` | Yes | ≥ 32 characters |
| `MVP_LOGIN_PASSWORD` | Yes | Shared team password for `/help/new` |
| `PORT` | Yes | `4000` |
| `NODE_ENV` | Yes | `production` (Docker image) |
| `APP_ENV` | Recommended | `dev` |

- [ ] Save → **redeploy API**
- [ ] Logs: migrations OK, no DB connection error

---

## 3. **Web** service variables (dev)

| Variable | Required | Note |
|----------|----------|------|
| `API_URL` | Yes | `http://<INTERNAL_API_SERVICE_NAME>:4000` (internal HTTP, not `https://api-dev…`) |
| `PORT` | Yes | `3000` |

- [ ] Save → **redeploy Web**

---

## 4. Automated smoke

**Base** (no local secret):

```bash
pnpm smoke:dev
```

Expected: exit code `0` — `GET /health`, `GET /feed` (API), `GET /api/feed` (BFF).

**Full** (auth + create + detail) — password **identical** to API service `MVP_LOGIN_PASSWORD` in Dokploy dev:

```bash
MVP_LOGIN_PASSWORD='<dokploy-secret>' pnpm smoke:dev
```

Expected: additionally login, `POST /help-requests`, `GET /help-requests/:id`.

Local:

```bash
BASE_WEB=http://127.0.0.1:3000 BASE_API=http://127.0.0.1:4000 MVP_LOGIN_PASSWORD=... pnpm smoke:dev
```

---

## 5. Browser smoke (Bob journey)

- [ ] `https://dev.allaboard.fr` — product feed ("Feed communautaire"), `/requests/[id]` links
- [ ] `https://dev.allaboard.fr/help/new` — login + create → detail redirect
- [ ] Same title twice → duplicate message + link to existing request
- [ ] `https://dev.allaboard.fr/mentor` — login `alice` → tag list; `bob` → non-mentor denied
- [ ] Refresh feed (TanStack) after create

---

## 6. Journal and tracking

- [ ] Add a line to the *Journal* in [guides/web-api-integration.md](../../guides/web-api-integration.md) (date, URLs, result)
- [ ] **ADR #18**: team validation (PR comment or GitHub issue — no secrets in repo)
- [ ] Update GitHub board (#33, Backend epic) if used

Journal template:

```text
| YYYY-MM-DD | Dokploy dev (Phase 2) | smoke: pnpm smoke:dev OK; /help/new; vars DATABASE_URL/JWT/MVP_LOGIN OK |
```

---

## Quick troubleshooting

| Symptom | Action |
|---------|--------|
| **`502` / `error code: 502`** on `https://api-dev.allaboard.fr/*` (Cloudflare) | API container **down** or boot crash — **runtime** API logs (not build). Frequent post-Phase 2 cause: **missing `JWT_SECRET`** (`NODE_ENV=production` in image) → set all §2 vars → **Save** → **Redeploy** |
| `database_unavailable` on `/feed` | Check `DATABASE_URL` + Postgres + redeploy API |
| Site feed `fetch failed`, public API OK | Fix Web `API_URL` (internal name) + redeploy Web |
| Login fails | `MVP_LOGIN_PASSWORD` on **API** only |
| Vars changed but behavior unchanged | **Redeploy** required after Save Environment |
| Old code (no auth) | Check `Dev` branch + latest deploy |
