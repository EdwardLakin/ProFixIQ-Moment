create table if not exists public.moment_orchestration_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid null references public.moment_threads(id) on delete set null,
  route_id uuid null references public.moment_routes(id) on delete set null,
  trace_summary text not null,
  trace_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.moment_support_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid null references public.moment_threads(id) on delete set null,
  route_id uuid null references public.moment_routes(id) on delete set null,
  signal text not null,
  pacing_mismatch boolean not null default false,
  overprompting_signal boolean not null default false,
  created_at timestamptz not null default now()
);
