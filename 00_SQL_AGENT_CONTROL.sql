-- PASIYA MAX — Agent ON/OFF control (run in Supabase SQL Editor)

create table if not exists public.agent_control (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.agent_control enable row level security;

drop policy if exists "agent_control_read" on public.agent_control;
create policy "agent_control_read" on public.agent_control
  for select using (true);

drop policy if exists "agent_control_write" on public.agent_control;
create policy "agent_control_write" on public.agent_control
  for all using (true) with check (true);

insert into public.agent_control (id, enabled)
values (1, true)
on conflict (id) do nothing;
