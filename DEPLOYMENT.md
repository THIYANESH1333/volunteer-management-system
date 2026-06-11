Deployment instructions for Volunteer Management System

Overview

This repository contains a React (Vite) frontend in `client/` and an Express + MongoDB backend in `server/`. The project can be deployed to Vercel (frontend + serverless API) or Render (separate frontend and backend services).

Required environment variables (set these in Vercel or Render):

- MONGODB_URI: MongoDB connection string (e.g., mongodb+srv://<user>:<pass>@cluster0.mongodb.net/<db>?retryWrites=true&w=majority)
- JWT_SECRET: Secret used to sign JWT tokens
- PORT: (optional) backend port for local testing (default 5002)
- VITE_API_BASE_URL: (optional) If frontend is hosted separately from backend, set this to the backend base URL including `/api` (e.g., `https://<backend-host>/api`). If frontend + backend are deployed together on Vercel, leave unset.

Vercel (single project hosting both frontend and serverless API)

1. Ensure `vercel.json` exists at the repository root (already present).
2. In Vercel dashboard, set the Root Directory to the repo root (leave it empty), not `client/`.
3. Ensure there is no nested `client/vercel.json` or `client/api/[...slug].js` in the deployed project. Vercel must use the root `vercel.json`.
4. In Vercel dashboard, set the Environment Variables (Production & Preview): `MONGODB_URI`, `JWT_SECRET`. Optionally set `VITE_API_BASE_URL` to `${VERCEL_URL}/api` if you need it.
5. Connect the GitHub repo and deploy. Vercel will build `client` as a static build and expose the Express app under `/api` via `api/[...slug].js`.

Render (separate services)

Option A — Deploy backend on Render, frontend on Vercel/static host:
- Create a Web Service on Render pointing at `server/` with `start` command: `node server.js`.
- Set environment variables in Render: `MONGODB_URI`, `JWT_SECRET` (and `PORT` if needed).
- Deploy frontend on Vercel or Render static site. If frontend is separate, set `VITE_API_BASE_URL` in the frontend hosting settings to `https://<your-backend>.onrender.com/api`.

Local testing

1. Install root + client + server dependencies (from repo root):

```powershell
npm install
cd client
npm install
cd ../server
npm install
```

2. Start the backend (in `server/`):

```powershell
cd server
node server.js
```

3. Start the frontend dev server (in `client/`):

```powershell
cd client
npm run dev
```

4. Test the register endpoint locally with PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:5002/api/auth/register' -ContentType 'application/json' -Body (ConvertTo-Json @{name='Test User'; email='test@example.com'; password='TestPass123'; phone='1234567890'})
```

Notes

- The server `app.js` no longer exits when env vars are missing to avoid build-time failures on serverless platforms — make sure to set the env vars in the hosting platform.
- The client now respects `VITE_API_BASE_URL` for cross-origin deployments. If empty, it will call the same origin plus `/api`.
