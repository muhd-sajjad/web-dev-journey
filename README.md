# Trackly

A personal expense tracker with user accounts, filtering/sorting, and spending reports.

- **Frontend:** React 19, TypeScript, Vite, React Router, Recharts
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT auth (bcrypt password hashing)

**Live demo:** _add your Vercel URL here_

<!-- Add a screenshot: ![Dashboard](docs/dashboard.png) -->

## Features

- Register / log in (JWT, passwords hashed with bcrypt)
- Add, edit and delete expenses; each user only sees their own
- Search, filter by category, sort
- Reports with category pie chart and spending bar chart
- Failed-login rate limiting, input validation on every endpoint

## Project layout

```
backend/   FastAPI app (main.py, auth.py, models.py, schemas.py, tests/)
frontend/  React app (src, public, package.json, vite.config.js)
```

## Run locally

You need Node 20+, Python 3.12+ and a PostgreSQL database.

**1. Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env             # then edit DATABASE_URL and SECRET_KEY
uvicorn main:app --reload
```

API runs on http://127.0.0.1:8000 (docs at `/docs`).

**2. Frontend** (new terminal)

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_URL
npm run dev
```

App runs on http://localhost:5173.

## Environment variables

| Where | Name | Purpose |
| --- | --- | --- |
| backend | `DATABASE_URL` | Postgres connection string |
| backend | `SECRET_KEY` | JWT signing key, generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| backend | `ALGORITHM` | JWT algorithm (default `HS256`) |
| backend | `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default `60`) |
| backend | `CORS_ORIGINS` | Comma-separated frontend URLs allowed in production |
| backend | `CORS_ORIGIN_REGEX` | Optional, e.g. to allow Vercel preview URLs |
| frontend | `VITE_API_URL` | URL of the deployed API |

Never commit a real `.env`. Only the `.env.example` files belong in git.

## Tests and checks

```bash
cd backend && pytest             # API tests (uses a throwaway SQLite DB)
cd ../frontend
npm run lint
npm run typecheck
npm run build
```

CI runs lint, build and the backend tests on every push (`.github/workflows/ci.yml`).

## Deploy

**Database:** create a free Postgres on Neon, Supabase or Render and copy the connection string.

**API (Render):**
1. New → Blueprint, pick this repo (it reads `render.yaml`), or create a Web Service manually with root directory `backend`.
2. Build: `pip install -r requirements.txt`. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
3. Set `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS` (your frontend URL).
4. Check `https://<your-api>/health`.

**Frontend (Vercel):**
1. Import the repo. Set the Framework Preset to Vite and Root Directory to `frontend`.
2. Set `VITE_API_URL` to the API URL. `vercel.json` already handles React Router refreshes.
3. Put the final Vercel URL into the API's `CORS_ORIGINS` and redeploy the API.

On Netlify, `public/_redirects` does the same job as `vercel.json`.

Free Render services sleep when idle, so the first request after a break can take about 30 seconds.

## Changing the database schema

Tables are created automatically on startup but never altered. If you already
have an older local database, convert it once:

```sql
ALTER TABLE expenses ALTER COLUMN amount TYPE NUMERIC(10,2);
ALTER TABLE expenses ALTER COLUMN date TYPE DATE USING date::date;
```

For further schema changes, add Alembic migrations.

## Known limitations / ideas

- The JWT is stored in `localStorage` (readable by XSS). Httponly cookies are safer.
- No refresh tokens: users sign in again when the token expires.
- Login rate limiting is in-memory (per process). Use Redis if you run several instances.
- Ideas: pagination in the UI, CSV export, monthly budgets, frontend tests with Vitest.
