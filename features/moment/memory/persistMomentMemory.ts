import type { SupabaseClient } from "@supabase/supabase-js";
import type { MomentMemoryArtifacts } from "@/features/moment/memory/types";

export async function persistMomentMemory(params: {
  supabase: SupabaseClient;
  userId: string;
  threadId: string | null;
  routeId: string | null;
  artifacts: MomentMemoryArtifacts;
}): Promise<string | null> {
  const { data: entryData, error: entryError } = await params.supabase.from("moment_entries").insert({
    user_id: params.userId,
    thread_id: params.threadId,
    route_id: params.routeId,
    source: params.artifacts.entry.source,
    input_summary: params.artifacts.entry.inputSummary,
    emotional_state: params.artifacts.entry.emotionalState,
    support_style: params.artifacts.entry.supportStyle,
    primary_brain_id: params.artifacts.entry.primaryBrainId,
    supporting_brain_ids: params.artifacts.entry.supportingBrainIds,
    route_label: params.artifacts.entry.routeLabel,
    route_category: params.artifacts.entry.routeCategory,
    route_audience: params.artifacts.entry.routeAudience,
    response_summary: params.artifacts.entry.responseSummary,
    tiny_next_step: params.artifacts.entry.tinyNextStep,
  }).select("id").single();
  if (entryError || !entryData) return null;

  if (params.artifacts.suggestions.length > 0) {
    await params.supabase.from("moment_suggestions").insert(params.artifacts.suggestions.map((item) => ({
      user_id: params.userId, thread_id: params.threadId, entry_id: entryData.id, source: item.source, suggestion_text: item.suggestionText, status: item.status,
    })));
  }
  if (params.artifacts.goalSuggestions.length > 0) {
    await params.supabase.from("moment_goals").upsert(params.artifacts.goalSuggestions.map((goal) => ({
      user_id: params.userId,
      thread_id: params.threadId,
      source: goal.source,
      title: goal.title,
      detail: goal.detail,
      status: goal.status,
    })), { onConflict: "user_id,title" });
  }
  await params.supabase.from("moment_support_effectiveness").insert({
    user_id: params.userId,
    thread_id: params.threadId,
    entry_id: entryData.id,
    support_style: params.artifacts.supportEffectiveness.supportStyle,
    accepted_suggestion: params.artifacts.supportEffectiveness.acceptedSuggestion,
    returned_to_thread: params.artifacts.supportEffectiveness.returnedToThread,
    tiny_step_completed: params.artifacts.supportEffectiveness.tinyStepCompleted,
    continuation_engaged: params.artifacts.supportEffectiveness.continuationEngaged,
    outcome_note: params.artifacts.supportEffectiveness.outcomeNote,
  });
  if (params.artifacts.tinyWin) {
    await params.supabase.from("moment_tiny_wins").insert({
      user_id: params.userId, thread_id: params.threadId, entry_id: entryData.id, source: params.artifacts.tinyWin.source, win_note: params.artifacts.tinyWin.winNote, status: params.artifacts.tinyWin.status,
    });
  }
  return entryData.id;
}
