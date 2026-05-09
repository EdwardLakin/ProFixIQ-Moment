begin;

alter table public.moment_ai_messages drop constraint if exists moment_ai_messages_mode_check;

alter table public.moment_ai_messages add constraint moment_ai_messages_mode_check check (
  mode in (
    'stuck_decomposer','drama_pause_coach','math_reset_helper','emotion_reflector','parent_summary_generator','safety_classifier',
    'social_boundary_helper','confidence_repair','focus_reentry','shutdown_recovery','task_simplifier','school_restart'
  )
);

commit;
