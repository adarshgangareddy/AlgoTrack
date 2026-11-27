# AlgoTrack — Production Deployment Guide

This guide outlines the production deployment for AlgoTrack.

---

## 1. Architecture Overview

- **Frontend**: React 19 + TypeScript + Vite + Monaco Editor → Deployed on **Vercel**
- **Backend**: Node.js + Express + TypeScript REST API → Deployed on **Render** (Web Service)
- **Database & Auth**: PostgreSQL + Supabase Auth + RLS → Hosted on **Supabase**
- **AI Coding Tutor**: Groq Cloud SDK (`llama-3.3-70b-versatile`)

---

## 2. Required Environment Variables

### A. Backend (Add in Render Dashboard → Environment Variables)
| Variable | Value / Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (Render will inject this automatically, fallback is 5000) |
| `FRONTEND_URL` | Your live frontend URL, e.g. `https://algotrack.vercel.app` (no trailing slash) |
| `SUPABASE_URL` | Your Supabase Project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase secret `service_role` key (**Project Settings → API**) |
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com/keys](https://console.groq.com/keys) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |

### B. Frontend (Add in Vercel Project Settings → Environment Variables)
| Variable | Value / Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public `anon` publishable key (**Project Settings → API**) |
| `VITE_API_BASE_URL` | Your Render backend URL + `/api` (e.g. `https://algotrack-backend.onrender.com/api`) |

---

## 3. Step-by-Step Deployment

### Step 1: Supabase Setup
1. In your **Supabase Dashboard**, open the **SQL Editor**.
2. Run the script in `supabase/full_schema.sql`.
3. In **Authentication → URL Configuration**:
   - Set **Site URL** to your Vercel URL (e.g. `https://algotrack.vercel.app`).
   - Add to **Redirect URLs**:
     - `https://algotrack.vercel.app/**`
     - `https://algotrack.vercel.app/auth/callback`
     - `http://localhost:5173/**`

### Step 2: Backend on Render
1. Go to [Render.com](https://render.com) → **New + → Web Service**.
2. Connect your GitHub repository: `https://github.com/adarshgangareddy/AlgoTrack`.
3. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm start`
4. Add all **Backend Environment Variables** listed above.
5. Click **Deploy Web Service**.
6. Verify deployment by visiting `https://your-service.onrender.com/api/health`.

### Step 3: Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) → **Add New → Project**.
2. Import the `AlgoTrack` repository.
3. Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add all **Frontend Environment Variables** listed above.
5. Click **Deploy**.

### Step 4: Connect Backend & Frontend
1. Copy your live Vercel domain (e.g. `https://algotrack.vercel.app`).
2. In **Render**, update `FRONTEND_URL` to match your Vercel domain.
3. In **Vercel**, ensure `VITE_API_BASE_URL` matches your Render URL + `/api`.

---

## 4. Google OAuth Sign-In Setup

To enable **Continue with Google** in production and local development:

1. **Database Trigger**: Ensure [`supabase/migrations/20261127_fix_oauth_profile_trigger.sql`](supabase/migrations/20261127_fix_oauth_profile_trigger.sql) (or the latest `supabase/full_schema.sql`) has been executed in **Supabase → SQL Editor** so OAuth signups never fail on username collisions.
2. **Google Cloud Console**:
   - Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID** (Web application).
   - **Authorized JavaScript origins**:
     - `https://algotrack.vercel.app` (your live Vercel URL)
     - `http://localhost:5173` (local dev)
   - **Authorized redirect URIs**:
     - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
3. **Supabase Dashboard → Authentication → Providers → Google**:
   - Enable **Google** and paste your **Client ID** and **Client Secret**.
4. **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL**: `https://algotrack.vercel.app`
   - **Redirect URLs**:
     - `https://algotrack.vercel.app/auth/callback`
     - `https://algotrack.vercel.app/**`
     - `http://localhost:5173/auth/callback`
     - `http://localhost:5173/**`

---

## 5. Keeping the Application Online 24/7

- **Frontend (Vercel)**: Static SPA served from Vercel's global edge CDN — always online with zero cold starts.
- **Backend (Render Free Tier) & Database (Supabase Free Tier)**: Render sleeps after 15 minutes of inactivity, and Supabase pauses free projects after 7 days of zero DB activity. `/api/health` includes a lightweight `HEAD` query to Supabase, so a single free uptime monitor keeps **both** Render and Supabase awake 24/7:
  1. Sign up for a free account at [UptimeRobot](https://uptimerobot.com) (or [cron-job.org](https://cron-job.org)).
  2. Click **Add New Monitor** → **HTTP(s)**.
  3. Set **URL** to `https://<your-render-service>.onrender.com/api/health`.
  4. Set **Monitoring Interval** to **5 minutes** (UptimeRobot free plan) or **10 minutes** (anything under 14 minutes prevents Render from sleeping).
  5. Save — your backend and Supabase database will now stay active 24/7.


