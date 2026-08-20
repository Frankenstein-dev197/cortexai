-- CORTEX AI — Row Level Security policies (Supabase/Postgres)
-- Status: DRAFT. Applies to the schema in 00001_cortex_schema.sql.
-- Invariant: a user can only see or change rows belonging to workspaces
-- they are a member of. Ownership and membership live in
-- public.workspace_members.

-- ---------- helpers ----------
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws and wm.user_id = auth.uid()
  );
$$;

-- ---------- enable RLS ----------
alter table profiles             enable row level security;
alter table workspaces           enable row level security;
alter table workspace_members    enable row level security;
alter table projects             enable row level security;
alter table repositories         enable row level security;
alter table conversations        enable row level security;
alter table messages             enable row level security;
alter table documents            enable row level security;
alter table knowledge_sources    enable row level security;
alter table memories             enable row level security;
alter table agents               enable row level security;
alter table agent_runs           enable row level security;
alter table agent_steps          enable row level security;
alter table tool_calls           enable row level security;
alter table files                enable row level security;
alter table usage_events         enable row level security;
alter table credit_balances      enable row level security;
alter table credit_transactions  enable row level security;
alter table subscriptions        enable row level security;
alter table integrations         enable row level security;
alter table api_keys             enable row level security;
alter table deployments          enable row level security;
alter table audit_logs           enable row level security;

-- ---------- profiles ----------
create policy "profiles read own" on profiles
  for select using (id = auth.uid());

create policy "profiles update own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------- workspaces ----------
create policy "workspaces read if member" on workspaces
  for select using (public.is_workspace_member(id));

create policy "workspaces insert owner" on workspaces
  for insert with check (owner_id = auth.uid());

create policy "workspaces update owner" on workspaces
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "workspaces delete owner" on workspaces
  for delete using (owner_id = auth.uid());

-- ---------- workspace_members ----------
create policy "members read if member" on workspace_members
  for select using (public.is_workspace_member(workspace_id));

create policy "members manage owner" on workspace_members
  for all using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
    )
  );

-- ---------- generic workspace-scoped tables ----------
-- Same policy shape for every table keyed by workspace_id.

create policy "projects scoped" on projects
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "repositories via project" on repositories
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = repositories.project_id and public.is_workspace_member(p.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = repositories.project_id and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "conversations scoped" on conversations
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "messages via conversation" on messages
  for all using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and public.is_workspace_member(c.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and public.is_workspace_member(c.workspace_id)
    )
  );

create policy "documents scoped" on documents
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "knowledge scoped" on knowledge_sources
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "memories scoped" on memories
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "agents scoped" on agents
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "agent_runs via agent" on agent_runs
  for all using (
    exists (
      select 1 from public.agents a
      where a.id = agent_runs.agent_id and public.is_workspace_member(a.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.agents a
      where a.id = agent_runs.agent_id and public.is_workspace_member(a.workspace_id)
    )
  );

create policy "agent_steps via run" on agent_steps
  for all using (
    exists (
      select 1 from public.agent_runs r
      join public.agents a on a.id = r.agent_id
      where r.id = agent_steps.run_id and public.is_workspace_member(a.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.agent_runs r
      join public.agents a on a.id = r.agent_id
      where r.id = agent_steps.run_id and public.is_workspace_member(a.workspace_id)
    )
  );

create policy "tool_calls via run" on tool_calls
  for all using (
    exists (
      select 1 from public.agent_runs r
      join public.agents a on a.id = r.agent_id
      where r.id = tool_calls.run_id and public.is_workspace_member(a.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.agent_runs r
      join public.agents a on a.id = r.agent_id
      where r.id = tool_calls.run_id and public.is_workspace_member(a.workspace_id)
    )
  );

create policy "files via project" on files
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = files.project_id and public.is_workspace_member(p.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = files.project_id and public.is_workspace_member(p.workspace_id)
    )
  );

-- ---------- usage / credits / billing ----------
create policy "usage scoped" on usage_events
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "balances read member" on credit_balances
  for select using (public.is_workspace_member(workspace_id));

create policy "balances write owner" on credit_balances
  for all using (
    exists (
      select 1 from public.workspaces w
      where w.id = credit_balances.workspace_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = credit_balances.workspace_id and w.owner_id = auth.uid()
    )
  );

create policy "transactions read member" on credit_transactions
  for select using (public.is_workspace_member(workspace_id));

create policy "transactions write owner" on credit_transactions
  for all using (
    exists (
      select 1 from public.workspaces w
      where w.id = credit_transactions.workspace_id and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspaces w
      where w.id = credit_transactions.workspace_id and w.owner_id = auth.uid()
    )
  );

create policy "subscriptions scoped" on subscriptions
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "integrations scoped" on integrations
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "api_keys scoped" on api_keys
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "deployments via project" on deployments
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = deployments.project_id and public.is_workspace_member(p.workspace_id)
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = deployments.project_id and public.is_workspace_member(p.workspace_id)
    )
  );

create policy "audit_logs scoped" on audit_logs
  for select using (public.is_workspace_member(workspace_id));
