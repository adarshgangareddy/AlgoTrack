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

