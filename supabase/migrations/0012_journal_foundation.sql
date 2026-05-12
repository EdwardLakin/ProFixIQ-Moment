begin;

alter table public.moment_profiles
  add column if not exists journal_context_enabled boolean not null default false;

alter table public.moment_entries
  add column if not exists entry_date date not null default current_date,
  add column if not exists title text null,
  add column if not exists content text null,
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists ai_context_allowed_snapshot boolean not null default false,
  add column if not exists deleted_at timestamptz null;

alter table public.moment_entries
  drop constraint if exists moment_entries_source_check;
alter table public.moment_entries
  add constraint moment_entries_source_check check (source in ('user_created','ai_suggested','system_detected','ai_moment','manual','imported'));

create index if not exists moment_entries_user_entry_date_idx on public.moment_entries(user_id, entry_date desc);
create index if not exists moment_entries_user_source_idx on public.moment_entries(user_id, source);
create index if not exists moment_entries_user_created_desc_idx on public.moment_entries(user_id, created_at desc);

commit;
