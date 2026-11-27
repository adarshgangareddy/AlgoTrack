# AlgoTrack

**AlgoTrack** is a full-stack algorithmic practice tracker, interactive coding workspace, and AI-powered code review platform built for structured technical interview preparation.

> Practice smarter by organizing 2,900+ coding problems by algorithmic pattern, persisting your personal approaches and Big-O analyses, and getting instant static code reviews from an AI tutor.

---

## Key Features

- **Curated Problem Library**: Browse and filter 2,900+ algorithmic problems by difficulty (`Easy`, `Medium`, `Hard`), topic/pattern (Sliding Window, Two Pointers, Dynamic Programming, Graphs, Trees, etc.), and completion status.
- **Interactive Coding Workspace**: Built-in **Monaco Editor** supporting **Python, JavaScript, TypeScript, Java, and C++** alongside persistent personal notes, approach summaries, edge cases, and time/space complexity logs.
- **AI Coding Tutor (Groq)**: Server-side integration with **Groq (`llama-3.3-70b-versatile`)** offering 7 one-click review actions (*Analyze*, *Explain*, *Find Logical Errors*, *Review Edge Cases*, *Time & Space Complexity*, *Give Me a Hint*, *Optimize*) plus conversational Q&A and Bring-Your-Own-Key (BYOK) support.
- **Analytics & Progress Dashboard**: Visualizes solved counts by difficulty, topic mastery breakdown, current/longest streaks, cumulative progress, and a 365-day activity heatmap.
- **Authentication & Security**: Powered by **Supabase Auth** with Email/Username + Password login, password recovery, **Google OAuth**, and PostgreSQL Row-Level Security (RLS).

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router v7, Monaco Editor, CodeMirror, KaTeX, Lucide React |
| **Backend** | Node.js, Express, TypeScript, Zod, Groq SDK |
| **Database & Auth** | Supabase (PostgreSQL, Row-Level Security, Supabase Auth + Google OAuth) |
| **Deployment** | Vercel (Frontend), Render (Backend), Supabase (Database & Auth) |

---

## Architecture

```text
AlgoTrack/
├── frontend/          # React 19 + TypeScript + Vite SPA
├── backend/           # Express + TypeScript REST API (/api/ai, /api/problems, /api/workspace, /api/health)
├── supabase/          # PostgreSQL schema & incremental migrations
│   ├── full_schema.sql
│   └── migrations/
├── docs/              # Technical documentation
│   ├── ARCHITECTURE.md
│   └── API.md
└── DEPLOYMENT.md      # Production deployment, OAuth & 24/7 uptime guide
```

For a deeper dive into the system design and API contracts, see:
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Production Deployment Guide](DEPLOYMENT.md)

---

## Local Development Setup

### Prerequisites
- **Node.js** >= 18
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **Groq** API key ([console.groq.com](https://console.groq.com))

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/adarshgangareddy/AlgoTrack.git
cd AlgoTrack

# Install root, frontend, and backend dependencies
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 2. Configure Database (Supabase)

1. Open your **Supabase Dashboard → SQL Editor**.
2. Run [`supabase/full_schema.sql`](supabase/full_schema.sql) to create tables, RLS policies, and auth triggers.

### 3. Configure Environment Variables

**Frontend** (`frontend/.env.local`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
```

### 4. Run Locally

```bash
# Starts both frontend (http://localhost:5173) and backend (http://localhost:5000)
npm run dev
```

---

## Building for Production

```bash
npm run build
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions on deploying to Vercel + Render, configuring Google OAuth, and keeping the backend awake 24/7.
