import type { SupabaseClient } from "@supabase/supabase-js";
import type { MomentMemorySnapshot, SuggestionStatus, TinyWinStatus } from "@/features/moment/memory/types";

export async function readMomentMemory(supabase: SupabaseClient, userId: string): Promise<MomentMemorySnapshot> {
  const [{ data: entries }, { data: threads }, { data: goals }, { data: tinyWins }, { data: suggestions }] = await Promise.all([
    supabase.from("moment_entries").select("id,input_summary,emotional_state,tiny_next_step,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("moment_threads").select("id,title,summary,status,last_activity_at").eq("user_id", userId).in("status", ["active", "paused"]).order("last_activity_at", { ascending: false }).limit(3),
    supabase.from("moment_goals").select("id,title,detail,status,updated_at").eq("user_id", userId).eq("status", "active").order("updated_at", { ascending: false }).limit(3),
    supabase.from("moment_tiny_wins").select("id,win_note,status,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("moment_suggestions").select("id,suggestion_text,status,created_at").eq("user_id", userId).in("status", ["suggested", "accepted"]).order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    entries: (entries ?? []).map((entry) => ({ id: entry.id, inputSummary: entry.input_summary, emotionalState: entry.emotional_state, tinyNextStep: entry.tiny_next_step, createdAt: entry.created_at })),
    threads: (threads ?? []).map((thread) => ({ id: thread.id, title: thread.title, summary: thread.summary, status: thread.status as "active" | "paused", lastActivityAt: thread.last_activity_at })),
    goals: (goals ?? []).map((goal) => ({ id: goal.id, title: goal.title, detail: goal.detail, status: goal.status as "active", updatedAt: goal.updated_at })),
    tinyWins: (tinyWins ?? []).map((win) => ({ id: win.id, winNote: win.win_note, status: win.status as TinyWinStatus, createdAt: win.created_at })),
    suggestions: (suggestions ?? []).map((suggestion) => ({ id: suggestion.id, suggestionText: suggestion.suggestion_text, status: suggestion.status as SuggestionStatus, createdAt: suggestion.created_at })),
  };
}
