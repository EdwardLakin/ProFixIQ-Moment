create table if not exists public.moment_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  primary_brain_id text not null,
  supporting_brain_ids text[] not null default '{}',
  category text not null,
  audience text not null,
  input_summary text null,
  route_reason text null,
  confidence numeric null,
  created_at timestamptz not null default now()
);

create index if not exists moment_routes_user_id_created_at_idx
  on public.moment_routes(user_id, created_at desc);
