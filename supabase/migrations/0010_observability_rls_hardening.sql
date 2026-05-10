begin;

alter table public.moment_orchestration_events enable row level security;
alter table public.moment_support_feedback enable row level security;

-- Expected behavior:
-- 1) Authenticated users can only read/write their own rows.
-- 2) Service role bypasses RLS for operational workflows.
-- 3) No broad authenticated read access across users.

drop policy if exists "moment_orchestration_events_select_own" on public.moment_orchestration_events;
create policy "moment_orchestration_events_select_own" on public.moment_orchestration_events
for select using (auth.uid() = user_id);

drop policy if exists "moment_orchestration_events_insert_own" on public.moment_orchestration_events;
create policy "moment_orchestration_events_insert_own" on public.moment_orchestration_events
for insert with check (auth.uid() = user_id);

drop policy if exists "moment_support_feedback_select_own" on public.moment_support_feedback;
create policy "moment_support_feedback_select_own" on public.moment_support_feedback
for select using (auth.uid() = user_id);

drop policy if exists "moment_support_feedback_insert_own" on public.moment_support_feedback;
create policy "moment_support_feedback_insert_own" on public.moment_support_feedback
for insert with check (auth.uid() = user_id);

commit;
