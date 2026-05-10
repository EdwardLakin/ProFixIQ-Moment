begin;

alter table public.moment_goals
  drop constraint if exists moment_goals_status_check;
alter table public.moment_goals
  add constraint moment_goals_status_check check (status in ('active','paused','gently_progressing','struggling','completed','archived'));

create table if not exists public.moment_support_effectiveness (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid null references public.moment_threads(id) on delete set null,
  entry_id uuid null references public.moment_entries(id) on delete set null,
  support_style text not null,
  accepted_suggestion boolean not null default false,
  returned_to_thread boolean not null default false,
  tiny_step_completed boolean not null default false,
  continuation_engaged boolean not null default false,
  outcome_note text null,
  created_at timestamptz not null default now()
);

create table if not exists public.moment_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern_key text not null,
  summary text not null,
  support_focus text not null,
  recurrence_count int not null default 1,
  confidence_note text not null default 'low_certainty',
  status text not null default 'active' check (status in ('active','quiet','archived')),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, pattern_key)
);

create index if not exists moment_support_effectiveness_user_idx on public.moment_support_effectiveness(user_id, created_at desc);
create index if not exists moment_patterns_user_idx on public.moment_patterns(user_id, last_seen_at desc);

alter table public.moment_support_effectiveness enable row level security;
alter table public.moment_patterns enable row level security;

create trigger moment_patterns_touch_updated_at before update on public.moment_patterns for each row execute function public.moment_touch_updated_at();

create policy "moment_support_effectiveness_own_all" on public.moment_support_effectiveness for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "moment_patterns_own_all" on public.moment_patterns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
alter table public.moment_goals add constraint moment_goals_user_title_unique unique (user_id, title);
