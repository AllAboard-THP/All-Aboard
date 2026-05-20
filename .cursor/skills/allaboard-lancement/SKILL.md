---
name: allaboard-lancement
description: >-
  Démarre le MVP All-Aboard en local (Postgres Docker, Next web, Fastify api).
  Use when the user says "lancement", "lance le dev", "dev local", or asks to
  start the local Phase 2 stack. Do not use for thp-final/Rails-only dev.
---

# All-Aboard — lancement local (MVP)

## Déclencheur

Appliquer ce skill quand l'utilisateur demande un **lancement** (mot-clé **lancement**) ou veut démarrer web + api + Postgres en local.

## Prérequis (vérifier si échec)

1. **Docker** : moteur démarré.
2. **`/.env.local.dev`** à la racine du monorepo (gitignored), avec au minimum :
   - `export DATABASE_URL=postgresql://allaboard:allaboard@127.0.0.1:5432/allaboard`
   - `export JWT_SECRET=...` (≥ 32 caractères en prod ; valeur dev OK en local)
   - `export MVP_LOGIN_PASSWORD=...`
3. **`apps/web/.env.local`** : `API_URL=http://127.0.0.1:4000` (voir `.env.example`).

Si `.env.local.dev` manque : expliquer comment le créer depuis `.env.example` ; ne pas commiter ce fichier.

## Action

Depuis la racine du dépôt (`/home/dim/AllAboard` ou racine workspace) :

```bash
pnpm dev:local
```

- Lance `docker compose up -d`, charge `.env.local.dev`, puis `turbo run dev --filter=web --filter=api`.
- **Ne pas** lancer `pnpm dev` sans filtre (évite `thp-final` et le conflit port 3000).
- Process **persistent** : lancer en arrière-plan (`block_until_ms: 0`) ou indiquer à l'utilisateur que le terminal reste occupé.

## Vérification rapide (autre terminal ou après quelques secondes)

```bash
curl -s http://127.0.0.1:4000/health
curl -s http://127.0.0.1:4000/feed
```

Attendu : `{"status":"ok"}` et `{"items":[...]}` (pas `database_unavailable`).

Navigateur : http://localhost:3000 , http://localhost:3000/help/new (mot de passe = `MVP_LOGIN_PASSWORD`).

## Pièges

- `DATABASE_URL unset` dans les logs → `.env.local.dev` absent ou `pnpm dev` lancé sans `dev:local` / sans `source`.
- Port 3000 occupé → arrêter un ancien `pnpm dev` ou Rails thp-final.

## Références

- [README.md](../../../README.md) — `pnpm dev:local`
- [.env.example](../../../.env.example)
- [Docs/adr/0001-authentication-strategy.md](../../../Docs/adr/0001-authentication-strategy.md)
