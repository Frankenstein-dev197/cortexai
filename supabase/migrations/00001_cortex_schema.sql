-- CORTEX AI — target SaaS schema for Supabase
-- Status: DRAFT. Applied only when deploying Cortex against Supabase
-- (embedded SQLite/Prisma remains the default store in this build).

create extension if not exists "uuid-ossp";

-- -------------------- profiles --------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------- workspaces --------------------
create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists workspace_members (
  workspace_id uuid not null references workspaces (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role text not null default 'member',
  primary key (workspace_id, user_id)
);

-- -------------------- projects --------------------
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists repositories (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects (id) on delete cascade,
  provider text not null, -- github | gitlab
  url text not null,
  default_branch text not null default 'main',
  created_at timestamptz not null default now()
);

-- -------------------- conversations --------------------
create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  title text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  role text not null, -- user | assistant | system | tool
  content text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on messages (conversation_id);

-- -------------------- knowledge --------------------
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  source_type text not null, -- upload | url | connector
  status text not null default 'pending', -- pending | processed | failed
  uploaded_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists knowledge_sources (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  kind text not null, -- pdf | docx | txt | csv | json | markdown | url
  uri text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- -------------------- memory --------------------
create table if not exists memories (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  scope text not null, -- user | workspace | project | agent | conversation
  key text,
  content text not null,
  created_at timestamptz not null default now()
);

create index on memories (workspace_id, scope);

-- -------------------- agents --------------------
create table if not exists agents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  mode text not null default 'agent', -- ask | assist | agent | autonomous
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists agent_runs (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents (id) on delete cascade,
  conversation_id uuid references conversations (id) on delete set null,
  status text not null default 'pending', -- pending | running | paused | stopped | done | failed
  prompt text,
  result jsonb,
  started_at timestamptz,
  ended_at timestamptz
);

create table if not exists agent_steps (
  id uuid primary key default uuid_generate_v4(),
  run_id uuid not null references agent_runs (id) on delete cascade,
  ordinal int not null,
  kind text not null, -- plan | tool | message | observation
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on agent_steps (run_id);

create table if not exists tool_calls (
  id uuid primary key default uuid_generate_v4(),
  run_id uuid not null references agent_runs (id) on delete cascade,
  step_id uuid references agent_steps (id) on delete set null,
  tool text not null, -- shell | file | browser | git | http | llm
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  status text not null default 'pending', -- pending | ok | error
  created_at timestamptz not null default now()
);

create index on tool_calls (run_id);

-- -------------------- files --------------------
create table if not exists files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects (id) on delete cascade,
  path text not null,
  language text,
  size_bytes bigint,
  updated_at timestamptz not null default now(),
  unique (project_id, path)
);

-- -------------------- usage / credits / billing --------------------
create table if not exists usage_events (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  actor_id uuid references profiles (id),
  kind text not null, -- llm | rag | agent | browser | sandbox | analyzer | build
  tokens bigint not null default 0,
  credits numeric(12, 4) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on usage_events (workspace_id, created_at);

create table if not exists credit_balances (
  workspace_id uuid primary key references workspaces (id) on delete cascade,
  balance numeric(14, 4) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  amount numeric(14, 4) not null, -- positive = purchase/grant, negative = spend
  reason text not null,
  usage_event_id uuid references usage_events (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  plan text not null default 'free', -- free | starter | pro | team | business
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- -------------------- integrations / keys / deployments --------------------
create table if not exists integrations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  provider text not null, -- github | gitlab | stripe | supabase | vercel
  status text not null default 'disconnected', -- connected | disconnected | error
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists api_keys (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  label text not null,
  hashed_key text not null,
  revoked boolean not null default false,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists deployments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects (id) on delete cascade,
  status text not null default 'pending', -- pending | building | live | failed
  url text,
  commit_sha text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  workspace_id uuid references workspaces (id) on delete cascade,
  actor_id uuid references profiles (id),
  action text not null,
  target text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on audit_logs (workspace_id, created_at);
