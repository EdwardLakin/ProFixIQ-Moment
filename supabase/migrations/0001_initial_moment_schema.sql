begin;

create extension if not exists pgcrypto;

create table if not exists public.moment_profiles (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique references auth.users(id) on delete cascade,

  display_name text not null default '',

  age_range text not null default 'not_set'

    check (age_range in ('under_13','13_15','16_17','18_plus','not_set')),

  role text not null default 'student'

    check (role in ('student','guardian','adult','admin')),

  onboarding_complete boolean not null default false,

  support_goals text[] not null default '{}',

  focus_areas text[] not null default '{}',

  preferences jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()

);

create table if not exists public.moment_guardian_links (

  id uuid primary key default gen_random_uuid(),

  student_user_id uuid not null references auth.users(id) on delete cascade,

  guardian_user_id uuid null references auth.users(id) on delete cascade,

  guardian_email text not null,

  status text not null default 'pending'

    check (status in ('pending','accepted','revoked')),

  summary_access boolean not null default true,

  raw_session_access boolean not null default false,

  created_at timestamptz not null default now(),

  accepted_at timestamptz null,

  unique (student_user_id, guardian_email)

);

create table if not exists public.moment_checkins (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  mood_label text null,

  overwhelm_level integer null check (overwhelm_level between 1 and 10),

  situation_type text not null default 'general'

    check (situation_type in ('school','math','social','anxiety','chores','general')),

  note text null,

  ai_response jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()

);

create table if not exists public.moment_stuck_sessions (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  task_text text not null,

  hardest_part text null,

  emotional_state text null,

  status text not null default 'open'

    check (status in ('open','started','still_stuck','done','archived')),

  ai_response jsonb not null default '{}'::jsonb,

  started_at timestamptz null,

  completed_at timestamptz null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()

);

create table if not exists public.moment_drama_pauses (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  situation_text text not null,

  was_asked_to_help boolean null,

  is_my_responsibility boolean null,

  likely_outcome text null,

  chosen_boundary_script text null,

  ai_response jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()

);

create table if not exists public.moment_math_resets (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  math_topic text null,

  problem_text text null,

  stuck_point text null,

  confidence_level integer null check (confidence_level between 1 and 10),

  ai_response jsonb not null default '{}'::jsonb,

  status text not null default 'open'

    check (status in ('open','started','understood','needs_help','archived')),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()

);

create table if not exists public.moment_ai_messages (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  mode text not null

    check (mode in ('stuck_decomposer','drama_pause_coach','math_reset_helper','emotion_reflector','parent_summary_generator','safety_classifier')),

  source_table text null,

  source_id uuid null,

  input_snapshot jsonb not null default '{}'::jsonb,

  output_snapshot jsonb not null default '{}'::jsonb,

  safety_flags text[] not null default '{}',

  model text null,

  created_at timestamptz not null default now()

);

create table if not exists public.moment_safety_events (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  source_table text null,

  source_id uuid null,

  severity text not null default 'low'

    check (severity in ('low','medium','high')),

  event_type text not null default 'general_support',

  flags text[] not null default '{}',

  handled boolean not null default false,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()

);

create table if not exists public.moment_parent_summaries (

  id uuid primary key default gen_random_uuid(),

  student_user_id uuid not null references auth.users(id) on delete cascade,

  guardian_user_id uuid null references auth.users(id) on delete cascade,

  summary_period_start date not null,

  summary_period_end date not null,

  summary jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  unique (student_user_id, guardian_user_id, summary_period_start, summary_period_end)

);

create table if not exists public.moment_subscriptions (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique references auth.users(id) on delete cascade,

  stripe_customer_id text null unique,

  stripe_subscription_id text null unique,

  plan text not null default 'free'

    check (plan in ('free','plus','family')),

  status text not null default 'inactive'

    check (status in ('inactive','trialing','active','past_due','canceled','unpaid')),

  current_period_end timestamptz null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()

);

create or replace function public.moment_touch_updated_at()

returns trigger

language plpgsql

as $$

begin

  new.updated_at = now();

  return new;

end;

$$;

drop trigger if exists moment_profiles_touch_updated_at on public.moment_profiles;

create trigger moment_profiles_touch_updated_at

before update on public.moment_profiles

for each row execute function public.moment_touch_updated_at();

drop trigger if exists moment_stuck_sessions_touch_updated_at on public.moment_stuck_sessions;

create trigger moment_stuck_sessions_touch_updated_at

before update on public.moment_stuck_sessions

for each row execute function public.moment_touch_updated_at();

drop trigger if exists moment_math_resets_touch_updated_at on public.moment_math_resets;

create trigger moment_math_resets_touch_updated_at

before update on public.moment_math_resets

for each row execute function public.moment_touch_updated_at();

drop trigger if exists moment_subscriptions_touch_updated_at on public.moment_subscriptions;

create trigger moment_subscriptions_touch_updated_at

before update on public.moment_subscriptions

for each row execute function public.moment_touch_updated_at();

create index if not exists moment_profiles_user_idx on public.moment_profiles(user_id);

create index if not exists moment_guardian_links_student_idx on public.moment_guardian_links(student_user_id);

create index if not exists moment_guardian_links_guardian_idx on public.moment_guardian_links(guardian_user_id);

create index if not exists moment_checkins_user_created_idx on public.moment_checkins(user_id, created_at desc);

create index if not exists moment_stuck_sessions_user_created_idx on public.moment_stuck_sessions(user_id, created_at desc);

create index if not exists moment_drama_pauses_user_created_idx on public.moment_drama_pauses(user_id, created_at desc);

create index if not exists moment_math_resets_user_created_idx on public.moment_math_resets(user_id, created_at desc);

create index if not exists moment_ai_messages_user_created_idx on public.moment_ai_messages(user_id, created_at desc);

create index if not exists moment_safety_events_user_created_idx on public.moment_safety_events(user_id, created_at desc);

create index if not exists moment_parent_summaries_student_idx on public.moment_parent_summaries(student_user_id, summary_period_start desc);

create index if not exists moment_subscriptions_user_idx on public.moment_subscriptions(user_id);

alter table public.moment_profiles enable row level security;

alter table public.moment_guardian_links enable row level security;

alter table public.moment_checkins enable row level security;

alter table public.moment_stuck_sessions enable row level security;

alter table public.moment_drama_pauses enable row level security;

alter table public.moment_math_resets enable row level security;

alter table public.moment_ai_messages enable row level security;

alter table public.moment_safety_events enable row level security;

alter table public.moment_parent_summaries enable row level security;

alter table public.moment_subscriptions enable row level security;

drop policy if exists "moment_profiles_own_select" on public.moment_profiles;

create policy "moment_profiles_own_select"

on public.moment_profiles for select

using (auth.uid() = user_id);

drop policy if exists "moment_profiles_own_insert" on public.moment_profiles;

create policy "moment_profiles_own_insert"

on public.moment_profiles for insert

with check (auth.uid() = user_id);

drop policy if exists "moment_profiles_own_update" on public.moment_profiles;

create policy "moment_profiles_own_update"

on public.moment_profiles for update

using (auth.uid() = user_id)

with check (auth.uid() = user_id);

drop policy if exists "moment_guardian_links_student_select" on public.moment_guardian_links;

create policy "moment_guardian_links_student_select"

on public.moment_guardian_links for select

using (auth.uid() = student_user_id or auth.uid() = guardian_user_id);

drop policy if exists "moment_guardian_links_student_insert" on public.moment_guardian_links;

create policy "moment_guardian_links_student_insert"

on public.moment_guardian_links for insert

with check (auth.uid() = student_user_id);

drop policy if exists "moment_guardian_links_student_update" on public.moment_guardian_links;

create policy "moment_guardian_links_student_update"

on public.moment_guardian_links for update

using (auth.uid() = student_user_id or auth.uid() = guardian_user_id)

with check (auth.uid() = student_user_id or auth.uid() = guardian_user_id);

drop policy if exists "moment_checkins_own_all" on public.moment_checkins;

create policy "moment_checkins_own_all"

on public.moment_checkins for all

using (auth.uid() = user_id)

with check (auth.uid() = user_id);

drop policy if exists "moment_stuck_sessions_own_all" on public.moment_stuck_sessions;

create policy "moment_stuck_sessions_own_all"

on public.moment_stuck_sessions for all

using (auth.uid() = user_id)

with check (auth.uid() = user_id);

drop policy if exists "moment_drama_pauses_own_all" on public.moment_drama_pauses;

create policy "moment_drama_pauses_own_all"

on public.moment_drama_pauses for all

using (auth.uid() = user_id)

with check (auth.uid() = user_id);

drop policy if exists "moment_math_resets_own_all" on public.moment_math_resets;

create policy "moment_math_resets_own_all"

on public.moment_math_resets for all

using (auth.uid() = user_id)

with check (auth.uid() = user_id);

drop policy if exists "moment_ai_messages_own_select" on public.moment_ai_messages;

create policy "moment_ai_messages_own_select"

on public.moment_ai_messages for select

using (auth.uid() = user_id);

drop policy if exists "moment_ai_messages_own_insert" on public.moment_ai_messages;

create policy "moment_ai_messages_own_insert"

on public.moment_ai_messages for insert

with check (auth.uid() = user_id);

drop policy if exists "moment_safety_events_own_select" on public.moment_safety_events;

create policy "moment_safety_events_own_select"

on public.moment_safety_events for select

using (auth.uid() = user_id);

drop policy if exists "moment_safety_events_own_insert" on public.moment_safety_events;

create policy "moment_safety_events_own_insert"

on public.moment_safety_events for insert

with check (auth.uid() = user_id);

drop policy if exists "moment_parent_summaries_student_select" on public.moment_parent_summaries;

create policy "moment_parent_summaries_student_select"

on public.moment_parent_summaries for select

using (auth.uid() = student_user_id);

drop policy if exists "moment_parent_summaries_guardian_select" on public.moment_parent_summaries;

create policy "moment_parent_summaries_guardian_select"

on public.moment_parent_summaries for select

using (

  exists (

    select 1

    from public.moment_guardian_links gl

    where gl.student_user_id = moment_parent_summaries.student_user_id

      and gl.guardian_user_id = auth.uid()

      and gl.status = 'accepted'

      and gl.summary_access = true

  )

);

drop policy if exists "moment_subscriptions_own_select" on public.moment_subscriptions;

create policy "moment_subscriptions_own_select"

on public.moment_subscriptions for select

using (auth.uid() = user_id);

commit;