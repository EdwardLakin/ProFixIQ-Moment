create table if not exists public.moment_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null,
  primary_brain_id text not null,
  support_style text not null,
  emotional_state text not null,
  status text not null check (status in ('active','paused','resolved')),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists moment_threads_user_status_idx on public.moment_threads(user_id, status, last_activity_at desc);
