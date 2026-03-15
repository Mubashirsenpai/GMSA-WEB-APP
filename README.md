# GMSA UDS NYC – Web Application

Web application for **Ghana Muslim Students' Association (GMSA)** at University for Development Studies, Nyankpala Campus.

## Features

- **Public**: Executive board (by academic year), announcements, events, gallery, downloads (prayer timetables, Khutbah, learning materials), blog (like, comment, reshare), donate (Paystack), suggestion box
- **Members**: Register (username/email + password), event registration, madrasa registration, alumni registration
- **Roles**: Admin (full access, users, executives, donations, SMS), PRO (content upload, bulk SMS), Secretary (approvals), Executive (virtual meetings, live discussions)

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS (green/white theme)
- **Backend**: Express.js, Socket.io
- **Database**: PostgreSQL + Prisma
- **Media**: Cloudinary
- **Payments**: Paystack (Ghana)
- **SMS**: Configurable API (Hubtel, mNotify, etc.)

---

## Setup (local)

### 1. PostgreSQL

Create a database, e.g. `gmsa_db` or `gmsa_uds`.

### 2. Server

```bash
cd server
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, CLOUDINARY_*, SMS_*, FRONTEND_URL, PAYSTACK_SECRET_KEY
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Server runs at `http://localhost:4000`.

### 3. Client

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:3000`. API calls are proxied to the server via Next.js rewrites.

### 4. Seed users (recommended)

Creates Admin, PRO, Secretary, and sample members with a known password:

```bash
cd server
npx prisma db seed
```

Default password for all seeded users: **`Password123!`** (or set `SEED_PASSWORD` in `server/.env`).

| Role      | Username  | Email                 |
|-----------|-----------|------------------------|
| Admin     | admin     | admin@gmsa.edu.gh     |
| PRO       | pro       | pro@gmsa.edu.gh       |
| Secretary | secretary | secretary@gmsa.edu.gh |
| Member    | member1   | member1@gmsa.edu.gh   |
| ...       | member2–5 | member2@gmsa.edu.gh … |

Log in with **username or email** and the seed password.

---

## Environment

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| PORT | Server port (default 4000) |
| NODE_ENV | development / production |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret for JWT tokens |
| JWT_EXPIRES_IN | e.g. 7d |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Cloudinary |
| SMS_API_URL, SMS_API_KEY | Your SMS provider |
| FRONTEND_URL | Frontend origin (CORS, callbacks) e.g. http://localhost:3000 |
| PAYSTACK_SECRET_KEY | Paystack **secret** key (sk_test_ or sk_live_) |
| DONATION_EMAIL | Email used for Paystack when donor doesn’t provide one |
| ADMIN_EMAIL, ADMIN_USERNAME | Override seed admin email/username |
| SEED_PASSWORD | Override seed password for all seeded users |

### Client (production)

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Full API base URL, e.g. https://your-api.com/api |

If not set, the client uses relative `/api` (works when same host or rewrites point to API).

---

## Pushing to GitHub

1. **Create a repo** on GitHub (e.g. `gmsa-uds-nyc`).

2. **Don’t commit secrets.** Ensure `.env` and `.env.local` are in `.gitignore` (they are in the root `.gitignore`). Never commit `PAYSTACK_SECRET_KEY`, `JWT_SECRET`, `DATABASE_URL`, or other secrets.

3. **Initialize git and push** (from project root):

```bash
git init
git add .
git commit -m "Initial commit: GMSA UDS NYC web app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

4. **Optional**: Add a root `package.json` with workspace scripts so you can run from the root:

```json
{
  "name": "gmsa-uds-nyc",
  "private": true,
  "scripts": {
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build:server": "cd server && npm run build",
    "build:client": "cd client && npm run build",
    "db:push": "cd server && npx prisma db push",
    "db:seed": "cd server && npx prisma db seed"
  }
}
```

---

## Deployment

### Overview

- **Frontend**: Deploy to **Vercel** (or Netlify). Connect the GitHub repo and set build command to `cd client && npm run build`, output directory `client/.next` (or use root as client if you use a monorepo setup).
- **Backend**: Deploy to **Railway**, **Render**, **Fly.io**, or a VPS. Must run Node, have a **PostgreSQL** database, and env vars set.
- **Database**: Use **Railway Postgres**, **Render Postgres**, **Supabase**, or **Neon** and set `DATABASE_URL` on the server.

### 1. Database (production)

Create a PostgreSQL database (e.g. on Railway or Render) and copy the connection string.

### 2. Backend (e.g. Railway / Render)

- Connect the same GitHub repo.
- Set **root directory** to `server` (if the repo is monorepo) or deploy only the server folder.
- **Build**: `npm install && npx prisma generate`
- **Start**: `npx prisma db push && npm start` (or run migrations then `node dist/index.js`).
- **Env vars**: Set all `server/.env` variables, especially:
  - `DATABASE_URL` (production Postgres URL)
  - `JWT_SECRET` (strong random string)
  - `FRONTEND_URL` (e.g. `https://your-app.vercel.app`)
  - `CLOUDINARY_*`, `PAYSTACK_SECRET_KEY`, `DONATION_EMAIL`, etc.

### 3. Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import your GitHub repo (`GMSA-WEB-APP`).
2. **Root Directory**: Click **Edit** next to the repo name and set **Root Directory** to `client`. (Only the Next.js app is deployed; the backend stays on Render.)
3. **Build & development**: Leave as auto-detected (**Build Command**: `npm run build`, **Output Directory**: `.next`).
4. **Environment variables**: Add one variable:
   - **Name**: `NEXT_PUBLIC_API_URL`  
   - **Value**: `https://gmsaudsnyc.onrender.com/api`  
   (Use your real Render backend URL if different.)
5. Click **Deploy**. When it finishes, you get a URL like `https://gmsa-web-app-xxx.vercel.app`.
6. **CORS**: In your **Render** backend service → **Environment**, set **FRONTEND_URL** to your Vercel URL (e.g. `https://gmsa-web-app-xxx.vercel.app`). If you already have a value, add the Vercel URL comma-separated, e.g. `https://your-app.vercel.app,http://localhost:3000`. Save and redeploy the backend so API and Socket.io accept requests from the frontend.

### 4. Next.js rewrites (production)

If the API is on a different domain, update `client/next.config.js` so that in production, `/api` is proxied to your backend:

```js
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    const base = apiUrl.replace(/\/api\/?$/, "");
    return [
      { source: "/api/:path*", destination: `${apiUrl}/:path*` },
      { source: "/socket.io/:path*", destination: `${base}/socket.io/:path*` },
    ];
  },
};
```

Then set `NEXT_PUBLIC_API_URL=https://your-backend.com/api` in Vercel.

### 5. Post-deploy

- Run migrations (if you use Prisma Migrate): on the server or CI, `npx prisma migrate deploy`.
- Seed production (optional, only if you want default users): set `SEED_PASSWORD` and run `npx prisma db seed` once, then change passwords.

---

## Donations (Paystack)

Use the **secret** key (`sk_test_` or `sk_live_`) in `PAYSTACK_SECRET_KEY`. Set `FRONTEND_URL` and `DONATION_EMAIL` so redirects and receipts work.

## SMS

Configure your SMS provider in `server/.env` and implement the HTTP call in `server/src/services/sms.ts` (or the relevant SMS module) to match the provider’s API.
