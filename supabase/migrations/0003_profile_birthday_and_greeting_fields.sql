begin;

alter table public.moment_profiles
  add column if not exists birthday_month integer null check (birthday_month between 1 and 12),
  add column if not exists birthday_day integer null check (birthday_day between 1 and 31),
  add column if not exists last_seen_at timestamptz null,
  add column if not exists greeting_state jsonb not null default '{}'::jsonb;

commit;
