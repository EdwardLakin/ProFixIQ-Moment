begin;

-- Ensure RLS is enabled for every Moment table.
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
alter table public.moment_routes enable row level security;
alter table public.moment_threads enable row level security;
alter table public.moment_entries enable row level security;
alter table public.moment_goals enable row level security;
alter table public.moment_tiny_wins enable row level security;
alter table public.moment_suggestions enable row level security;
alter table public.moment_support_effectiveness enable row level security;
alter table public.moment_patterns enable row level security;
alter table public.moment_orchestration_events enable row level security;
alter table public.moment_support_feedback enable row level security;

-- Normalize legacy FOR ALL policies into strict action-specific policies.
drop policy if exists "moment_checkins_own_all" on public.moment_checkins;
create policy "moment_checkins_own_select" on public.moment_checkins for select using (auth.uid() = user_id);
create policy "moment_checkins_own_insert" on public.moment_checkins for insert with check (auth.uid() = user_id);
create policy "moment_checkins_own_update" on public.moment_checkins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_stuck_sessions_own_all" on public.moment_stuck_sessions;
create policy "moment_stuck_sessions_own_select" on public.moment_stuck_sessions for select using (auth.uid() = user_id);
create policy "moment_stuck_sessions_own_insert" on public.moment_stuck_sessions for insert with check (auth.uid() = user_id);
create policy "moment_stuck_sessions_own_update" on public.moment_stuck_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_drama_pauses_own_all" on public.moment_drama_pauses;
create policy "moment_drama_pauses_own_select" on public.moment_drama_pauses for select using (auth.uid() = user_id);
create policy "moment_drama_pauses_own_insert" on public.moment_drama_pauses for insert with check (auth.uid() = user_id);
create policy "moment_drama_pauses_own_update" on public.moment_drama_pauses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_math_resets_own_all" on public.moment_math_resets;
create policy "moment_math_resets_own_select" on public.moment_math_resets for select using (auth.uid() = user_id);
create policy "moment_math_resets_own_insert" on public.moment_math_resets for insert with check (auth.uid() = user_id);
create policy "moment_math_resets_own_update" on public.moment_math_resets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_entries_own_all" on public.moment_entries;
create policy "moment_entries_own_select" on public.moment_entries for select using (auth.uid() = user_id);
create policy "moment_entries_own_insert" on public.moment_entries for insert with check (auth.uid() = user_id);
create policy "moment_entries_own_update" on public.moment_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_goals_own_all" on public.moment_goals;
create policy "moment_goals_own_select" on public.moment_goals for select using (auth.uid() = user_id);
create policy "moment_goals_own_insert" on public.moment_goals for insert with check (auth.uid() = user_id);
create policy "moment_goals_own_update" on public.moment_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_tiny_wins_own_all" on public.moment_tiny_wins;
create policy "moment_tiny_wins_own_select" on public.moment_tiny_wins for select using (auth.uid() = user_id);
create policy "moment_tiny_wins_own_insert" on public.moment_tiny_wins for insert with check (auth.uid() = user_id);
create policy "moment_tiny_wins_own_update" on public.moment_tiny_wins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_suggestions_own_all" on public.moment_suggestions;
create policy "moment_suggestions_own_select" on public.moment_suggestions for select using (auth.uid() = user_id);
create policy "moment_suggestions_own_insert" on public.moment_suggestions for insert with check (auth.uid() = user_id);
create policy "moment_suggestions_own_update" on public.moment_suggestions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_support_effectiveness_own_all" on public.moment_support_effectiveness;
create policy "moment_support_effectiveness_own_select" on public.moment_support_effectiveness for select using (auth.uid() = user_id);
create policy "moment_support_effectiveness_own_insert" on public.moment_support_effectiveness for insert with check (auth.uid() = user_id);
create policy "moment_support_effectiveness_own_update" on public.moment_support_effectiveness for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "moment_patterns_own_all" on public.moment_patterns;
create policy "moment_patterns_own_select" on public.moment_patterns for select using (auth.uid() = user_id);
create policy "moment_patterns_own_insert" on public.moment_patterns for insert with check (auth.uid() = user_id);
create policy "moment_patterns_own_update" on public.moment_patterns for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Add missing policies for new tables that previously had no RLS policies.
create policy "moment_routes_own_select" on public.moment_routes for select using (auth.uid() = user_id);
create policy "moment_routes_own_insert" on public.moment_routes for insert with check (auth.uid() = user_id);
create policy "moment_routes_own_update" on public.moment_routes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "moment_threads_own_select" on public.moment_threads for select using (auth.uid() = user_id);
create policy "moment_threads_own_insert" on public.moment_threads for insert with check (auth.uid() = user_id);
create policy "moment_threads_own_update" on public.moment_threads for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Observability stays scoped to owner only for direct user access.
-- table_service_role_note: service role bypasses RLS for internal operations.
drop policy if exists "moment_orchestration_events_select_own" on public.moment_orchestration_events;
create policy "moment_orchestration_events_own_select" on public.moment_orchestration_events for select using (auth.uid() = user_id);
drop policy if exists "moment_orchestration_events_insert_own" on public.moment_orchestration_events;
create policy "moment_orchestration_events_own_insert" on public.moment_orchestration_events for insert with check (auth.uid() = user_id);

drop policy if exists "moment_support_feedback_select_own" on public.moment_support_feedback;
create policy "moment_support_feedback_own_select" on public.moment_support_feedback for select using (auth.uid() = user_id);
drop policy if exists "moment_support_feedback_insert_own" on public.moment_support_feedback;
create policy "moment_support_feedback_own_insert" on public.moment_support_feedback for insert with check (auth.uid() = user_id);

-- Verification queries (run manually post-migration).
-- 1) Verify every moment_* table has RLS enabled.
-- select tablename, rowsecurity from pg_tables where schemaname='public' and tablename like 'moment_%' order by tablename;
--
-- 2) Detect broad SELECT policies.
-- select schemaname, tablename, policyname, roles, qual from pg_policies
-- where schemaname='public' and tablename like 'moment_%'
-- and cmd='SELECT' and (coalesce(qual,'') ilike '%true%');
--
-- 3) Verify policy counts by table.
-- select tablename, count(*) as policy_count from pg_policies where schemaname='public' and tablename like 'moment_%' group by tablename order by tablename;
--
-- 4) Ensure subscription tables have no client writes.
-- select tablename, policyname, cmd from pg_policies where schemaname='public' and tablename='moment_subscriptions' order by cmd, policyname;
--
-- 5) Ensure observability tables are not broadly readable.
-- select tablename, policyname, roles, qual from pg_policies
-- where schemaname='public' and tablename in ('moment_orchestration_events','moment_support_feedback') and cmd='SELECT';
--
-- 6) Ensure guardian policies exist only on summaries and never on raw tables.
-- select tablename, policyname from pg_policies where schemaname='public' and policyname ilike '%guardian%';

commit;
