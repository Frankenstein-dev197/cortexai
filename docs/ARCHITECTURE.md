# CORTEX AI — Architecture

Status of this document: **design + current implementation state**.
Anything marked (draft) is designed but not yet wired in the running build.

## System overview

```
USER
  │
  ▼
Landing (web/) ────────────────┐
                                │
App (frontend/) ──► Server (server/) ──► Collector (collector/)
       │                 │                     │
       │                 ├─ Prisma/SQLite (default store)
       │                 ├─ LLM providers (30+)
       │                 ├─ RAG: chunk → embed → vector search → cite
       │                 ├─ Agents (aibitat, MCP tools)
       │                 └─ Multi-user + workspaces
       │
       └─ (draft) Supabase: Auth + Postgres + Storage + Realtime
       └─ (draft) Cortex Orchestrator → Sandbox runtime → Live preview
```

## CORTEX Black design system

- Base palette: `#050505` (void), `#080808`, `#0A0A0A` (obsidian),
  `#111111` (carbon), `#171717` (graphite), `#1C1C1C` (slate)
- Text: `#F5F5F5` (bone), secondary `#A3A3A3` (ash)
- Accent: indigo `#6366F1`, used sparingly
- Implemented in `frontend/src/index.css` (CSS vars) +
  `frontend/tailwind.config.js`; landing tokens in `web/tailwind.config.ts`
- Default theme: **dark** (see `frontend/src/hooks/useTheme.js`)

## Agent modes (draft labels on a real foundation)

The AnythingLLM agent framework (aibitat + MCP servers, agent flows) is the
real, working base. The CORTEX product names map as follows:

| Product mode | Foundation mechanism | State |
|---|---|---|
| Ask | Direct chat completion | working |
| Assist | Chat with tool-suggestive flows | working |
| Agent | aibitat agents + MCP tools | working |
| Autonomous | Orchestrated loop with sandbox | draft |

User controls required by the brief (pause/resume/stop/cancel/retry) exist in
the foundation (abort controllers, agent flow stop) and will be surfaced in
the Orchestrator UI (draft).

## CORTEX Orchestrator (draft)

Target: `USER → CORTEX → ORCHESTRATOR → MODEL → AGENT → TOOLS → RUNTIME → RESULT`.
Decides model/agent/tools/steps; drives test→fix→verify loops.
Current state: model routing exists via `CortexModelRouter` (renamed from
upstream) in `server/utils/AiProviders/modelRouter/index.js`; the rest of the
orchestration surface is a design target.

## Sandbox & Live Preview (draft)

Target pipeline: `CODE → SANDBOX → INSTALL → START → PREVIEW → BROWSER`
with filesystem/process isolation, timeouts, resource limits and secret
isolation. Not implemented in this build — nothing here is simulated in UI.

## SaaS schema (draft)

`supabase/migrations/00001_cortex_schema.sql` + `00002_cortex_rls.sql`
define the Supabase target:
profiles, workspaces, workspace_members, projects, repositories,
conversations, messages, documents, knowledge_sources, memories, agents,
agent_runs, agent_steps, tool_calls, files, usage_events, credit_balances,
credit_transactions, subscriptions, integrations, api_keys, deployments,
audit_logs — all with row-level security scoped to workspace membership.

## Rebrand doctrine

- No leftover AnythingLLM branding in the UI (strings, logos, meta, links).
- External URLs (GitHub/docs/discord) point to the Cortex repository.
- Tenant-facing copy everywhere says "Cortex AI"; telemetry endpoints are
  upstream-only utilities, not product UI.
- `ANYTHING_LLM_*` env var names remain for upstream compatibility only.
