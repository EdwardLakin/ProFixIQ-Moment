begin;

create table if not exists public.moment_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid null references public.moment_threads(id) on delete set null,
  route_id uuid null references public.moment_routes(id) on delete set null,
  source text not null default 'system_detected' check (source in ('user_created','ai_suggested','system_detected')),
  input_summary text not null,
  emotional_state text null,
  support_style text null,
  primary_brain_id text null,
  supporting_brain_ids text[] not null default '{}',
  route_label text null,
  route_category text null,
  route_audience text null,
  response_summary text null,
  tiny_next_step text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moment_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid null references public.moment_threads(id) on delete set null,
  source text not null default 'user_created' check (source in ('user_created','ai_suggested','system_detected')),
  title text not null,
  detail text null,
  status text not null default 'active' check (status in ('active','paused','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moment_tiny_wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid null references public.moment_threads(id) on delete set null,
  entry_id uuid null references public.moment_entries(id) on delete set null,
  source text not null default 'system_detected' check (source in ('user_created','ai_suggested','system_detected')),
  win_note text not null,
  status text not null default 'recorded' check (status in ('recorded','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moment_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid null references public.moment_threads(id) on delete set null,
  entry_id uuid null references public.moment_entries(id) on delete set null,
  source text not null default 'ai_suggested' check (source in ('user_created','ai_suggested','system_detected')),
  suggestion_text text not null,
  status text not null default 'suggested' check (status in ('suggested','accepted','dismissed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists moment_entries_user_created_idx on public.moment_entries(user_id, created_at desc);
create index if not exists moment_entries_thread_idx on public.moment_entries(thread_id, updated_at desc);
create index if not exists moment_goals_user_status_idx on public.moment_goals(user_id, status, updated_at desc);
create index if not exists moment_goals_thread_idx on public.moment_goals(thread_id, created_at desc);
create index if not exists moment_tiny_wins_user_status_idx on public.moment_tiny_wins(user_id, status, created_at desc);
create index if not exists moment_tiny_wins_thread_idx on public.moment_tiny_wins(thread_id, updated_at desc);
create index if not exists moment_suggestions_user_status_idx on public.moment_suggestions(user_id, status, updated_at desc);
create index if not exists moment_suggestions_thread_idx on public.moment_suggestions(thread_id, created_at desc);

alter table public.moment_entries enable row level security;
alter table public.moment_goals enable row level security;
alter table public.moment_tiny_wins enable row level security;
alter table public.moment_suggestions enable row level security;

create trigger moment_entries_touch_updated_at before update on public.moment_entries for each row execute function public.moment_touch_updated_at();
create trigger moment_goals_touch_updated_at before update on public.moment_goals for each row execute function public.moment_touch_updated_at();
create trigger moment_tiny_wins_touch_updated_at before update on public.moment_tiny_wins for each row execute function public.moment_touch_updated_at();
create trigger moment_suggestions_touch_updated_at before update on public.moment_suggestions for each row execute function public.moment_touch_updated_at();

create policy "moment_entries_own_all" on public.moment_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "moment_goals_own_all" on public.moment_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "moment_tiny_wins_own_all" on public.moment_tiny_wins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "moment_suggestions_own_all" on public.moment_suggestions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
