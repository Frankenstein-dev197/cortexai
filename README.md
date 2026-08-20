<p align="center">
  <img src="brand/big.svg" alt="CORTEX AI" width="280" />
</p>

# CORTEX AI

**Build with intelligence.**

Cortex AI is an AI-native platform unifying chat, knowledge (RAG) and an
agentic engineering workbench — built on top of the open-source
[AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) foundation
(MIT). Attribution is preserved in [NOTICE.md](./NOTICE.md).

---

## Table of contents

1. [Overview](#overview)
2. [Feature status — real inventory](#feature-status--real-inventory)
3. [Architecture](#architecture)
4. [Tech stack](#tech-stack)
5. [Repository layout](#repository-layout)
6. [Installation](#installation)
7. [Environment variables](#environment-variables)
8. [Development](#development)
9. [Tests](#tests)
10. [Production](#production)
11. [Security](#security)
12. [Roadmap](#roadmap)
13. [License](#license)

---

## Overview

Cortex AI is the product built on the AnythingLLM technical foundation, with a
complete rebrand ("CORTEX Black" design system), a new premium landing page,
and a documented target architecture for SaaS (Supabase), agentic building
and sandboxed previews.

What the product does **today**:

- Chat with any of 30+ LLM providers (OpenAI, Anthropic, Azure, Ollama,
  Gemini, Groq, local models, and more), with streaming and multi-workspace
  organization.
- Knowledge / RAG: upload documents (PDF, DOCX, TXT, CSV, JSON, Markdown),
  scrape URLs, chunk, embed, vector-search, answer with citations.
- Agents: the foundation's agent framework (Aibitat) with tool plugins,
  MCP (Model Context Protocol) server support and agent flows.
- Multi-user mode with roles and workspace-level permissions.
- A rebranded "CORTEX Black" UI (dark-first, `#050505`-based palette) and a
  standalone premium landing page (`web/`, Next.js).

## Feature status — real inventory

Cortex AI ships nothing fake. Features are either **live** or explicitly
marked **not wired yet**.

### Live and verified

| Area | What works | How it was verified |
|---|---|---|
| AI Chat | Streaming chat across 30+ providers, per-workspace model selection, RAG over workspace docs | App runs at `:3000`, chat UI verified in browser |
| Knowledge / RAG | Upload → parse (collector) → chunk → embed → LanceDB vector store → cited answers | Collector + server + frontend run together |
| Agents | Aibitat agents, MCP servers, agent flows, tool plugins | Settings pages live in UI |
| Multi-user | Users, roles, workspace membership, API keys | Foundation features, server online |
| CORTEX Black design system | Full rebrand: name, logos, favicon, meta, dark-first theme, external links repointed to this repo | Frontend prod build ✓, dark theme verified in browser |
| Landing page | `web/` — Next.js 15 + Tailwind, statically prerendered (4 pages, 87.4 kB First Load JS) | `npm run build` ✓, rendered in browser |
| Server health | `/api/ping` online, branded modules load cleanly | Smoke checks on rebranded modules |

### Drafted but NOT wired yet

These exist as **schema/design artifacts only** — nothing in the UI pretends
they work:

| Area | Artifact | Status |
|---|---|---|
| Supabase SaaS schema | `supabase/migrations/00001_cortex_schema.sql` — 23 tables (profiles, workspaces, projects, agent_runs, credits, billing, deployments, audit_logs…) | **Draft — not applied** |
| Row Level Security | `supabase/migrations/00002_cortex_rls.sql` — workspace-scoped policies | **Draft — not applied** |
| Supabase Auth (Email/Google/GitHub/Microsoft) | Documented target in `docs/ARCHITECTURE.md` | **Not implemented** — app uses its built-in auth |
| Stripe billing / credits / quotas | Schema tables exist (`subscriptions`, `credit_balances`, `usage_events`) | **Not implemented** |
| Cortex Orchestrator / agent modes UI | Design in `docs/ARCHITECTURE.md`; model routing exists via `CortexModelRouter` | **Partial — routing only** |
| Monaco workbench, terminal, sandbox, live preview, browser agent | Design targets | **Not implemented** |
| Admin Center SaaS | Foundation's admin settings exist (users, models, logs) | **Partial — foundation admin only** |

## Architecture

```
USER
  │
  ▼
Landing (web/) ────────────────┐
                                │
App (frontend/) ──► Server (server/) ──► Collector (collector/)
       │                 │                     │
       │                 ├─ Prisma + SQLite (default store)
       │                 ├─ LLM providers (30+)
       │                 ├─ RAG: chunk → embed → vector search → cite
       │                 ├─ Agents (Aibitat, MCP tools)
       │                 └─ Multi-user + workspaces + API keys
       │
       └─ (draft) Supabase: Auth + Postgres + Storage + Realtime
       └─ (draft) Cortex Orchestrator → Sandbox runtime → Live preview
```

Details and target-state diagrams: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Tech stack

| Layer | Technology |
|---|---|
| App UI | React 18, Vite, Tailwind CSS (Cortex Black tokens), React Router |
| Landing | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js 18+/22, Express, Prisma ORM, SQLite (default) |
| Document processing | Node collector service (Puppeteer for URL scraping) |
| Vector store | LanceDB (default; PGVector/Pinecone/Qdrant/Chroma supported) |
| Agents | Aibitat framework + MCP (Model Context Protocol) |
| Auth | Built-in user system today; Supabase Auth (target, not wired) |
| Target SaaS DB | Supabase/Postgres + RLS (migrations drafted in `supabase/`) |

## Repository layout

```
cortexai/
├── frontend/        # Main application (React SPA, Cortex Black theme)
├── server/          # Backend API (Express + Prisma)
├── collector/       # Document parsing/chunking service
├── web/             # Premium landing page (Next.js + Tailwind)
├── supabase/        # Draft SaaS schema + RLS policies (not applied)
├── brand/           # Generated CORTEX logo assets (SVG/PNG)
├── scripts/         # Repo scripts (incl. brand asset generator)
├── docker/          # Docker deployment config
├── docs/            # ARCHITECTURE.md + upstream README archive
├── LICENSE          # MIT (from AnythingLLM foundation)
└── NOTICE.md        # Attribution notice
```

## Installation

Prerequisites: **Node.js ≥ 18** (22 recommended), npm or yarn.

```bash
git clone https://github.com/Frankenstein-dev197/cortexai.git
cd cortexai

# 1) Server
cd server
cp .env.example .env.development
npm install --legacy-peer-deps
npx prisma migrate dev
cd ..

# 2) Collector
cd collector
cp .env.example .env
npm install --legacy-peer-deps
cd ..

# 3) Frontend
cd frontend
cp .env.example .env
npm install --legacy-peer-deps
cd ..

# 4) Landing page (optional)
cd web
npm install
cd ..
```

## Environment variables

Key variables (see `server/.env.example` for the full list):

| Variable | Purpose | Default |
|---|---|---|
| `SERVER_PORT` | API port | `3001` |
| `JWT_SECRET` | Session signing secret | (set it!) |
| `SIG_KEY` / `SIG_SALT` | Encryption key/salt for stored credentials | auto-generated on first run |
| `LLM_PROVIDER` | Default provider (`generic-openai`, `ollama`, `openai`, …) | `generic-openai` |
| `VECTOR_DB` | Vector database (`lancedb`, `pgvector`, …) | `lancedb` |
| `EMBEDDING_ENGINE` | Embedding provider | built-in |
| `STORAGE_DIR` | Data directory | `server/storage` |
| `DISABLE_TELEMETRY` | Disable anonymous telemetry | unset |

Frontend (`frontend/.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_BASE` | API base URL, e.g. `http://localhost:3001/api` |

Collector (`collector/.env`):

| Variable | Purpose |
|---|---|
| `COLLECTOR_PORT` | Collector port (default `8888`) |

> Naming note: some upstream env vars keep the `ANYTHING_LLM_*` prefix for
> compatibility with the foundation. They are invisible in the product UI.

## Development

Run the three services in separate terminals:

```bash
# API
cd server && npm run dev          # http://localhost:3001

# Document collector
cd collector && npm run dev       # http://localhost:8888

# Frontend (hot reload)
cd frontend && npm run dev        # http://localhost:3000

# Landing page (optional)
cd web && npm run dev             # http://localhost:4100 (pick a free port)
```

Or from the root (yarn): `yarn dev` starts server, frontend and collector
together via `concurrently`.

## Tests

- **Server unit tests**: 37 Jest test files under `server/__tests__/` —
  run with `yarn test` at the root (or `npx jest` in `server/`).
- **Frontend build check**: `cd frontend && npm run build` — production
  build passes (verifies the rebranded UI compiles end-to-end).
- **Landing build check**: `cd web && npm run build` — 4 prerendered pages.
- **Smoke checks**: branded server modules load cleanly
  (`CortexModelRouter`, `getCortexUserAgent`, `MetaGenerator`, logo utils).

## Production

```bash
# Build the SPA
cd frontend && npm run build      # outputs to server/public

# Serve everything from the API
cd server && npm start            # NODE_ENV=production, serves the built app
```

Docker: a compose setup is available in `docker/` (`docker-compose.yml` +
`Dockerfile`). The landing page (`web/`) deploys independently as a static
Next.js site (e.g. Vercel).

## Security

- API auth via signed JWT (`JWT_SECRET`), per-user API keys, role-based
  permissions (admin/manager/default), per-workspace document visibility.
- Secrets (provider API keys) stored encrypted in the DB via `SIG_KEY`/`SIG_SALT`.
- `.env` files are git-ignored; only `.env.example` templates are committed.
- `supabase/migrations/00002_cortex_rls.sql` (draft) defines workspace-scoped
  Row Level Security policies for the target Postgres deployment.
- Report vulnerabilities by opening a **private** security advisory on this
  repository rather than a public issue.

## Roadmap

Planned next steps (in order):

1. Wire Supabase Auth (Email + Google/GitHub/Microsoft) onto the drafted schema.
2. Apply the Supabase schema + RLS and add a Postgres data path alongside SQLite.
3. Cortex Orchestrator UI on top of `CortexModelRouter` (agent modes ASK /
   ASSIST / AGENT / AUTONOMOUS with pause/resume/stop controls).
4. Monaco-based workbench (editor, terminal, file explorer) + sandboxed
   runtime with live preview.
5. Billing/credits on Stripe using the drafted `subscriptions` /
   `credit_balances` / `usage_events` tables.
6. Admin Center SaaS over real usage data.

## License

MIT — see [LICENSE](./LICENSE). This product is built on
[AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) (MIT,
© Mintplex Labs); attribution is preserved in [NOTICE.md](./NOTICE.md).
