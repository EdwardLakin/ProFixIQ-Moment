import type { MomentRouteResult } from "@/features/ai/types";
import type { ContinuityCue, MomentThread, SupportStyle } from "@/features/moment/continuity/types";

function includesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token));
}

function summarizeMoment(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  return cleaned.slice(0, 180);
}

export function buildThreadTitle(text: string, route: MomentRouteResult) {
  const normalized = text.toLowerCase();
  if (includesAny(normalized, ["mother's day", "grief", "loss", "miss"])) return "Ongoing grief wave";
  if (includesAny(normalized, ["math", "class", "test", "homework"])) return "Recurring math overwhelm";
  if (includesAny(normalized, ["work", "boss", "deadline", "burnout"])) return "Work pressure cycle";
  if (includesAny(normalized, ["friend", "relationship", "boundary"])) return "Relationship boundary support";
  return route.routeLabel;
}

export function continuityCueFromThread(thread: MomentThread, incomingText: string): ContinuityCue | null {
  const normalized = incomingText.toLowerCase();
  const summary = thread.summary.toLowerCase();
  const routeHint = thread.primary_brain_id.replace(/_brain$/, "").replace(/_/g, " ");
  if (!normalized || !summary) return null;
  if (normalized.includes(routeHint) || includesAny(normalized, summary.split(" ").slice(0, 8))) {
    return {
      threadId: thread.id,
      prompt: `This might be connected to your recent ${thread.title.toLowerCase()}. Want to continue that thread or start fresh?`,
      confidence: "low",
    };
  }
  return null;
}

export function inferSupportStyle(style?: SupportStyle): SupportStyle {
  return style ?? "calm_reflective";
}

export function summarizeContinuity(text: string, threads: MomentThread[]): string | null {
  if (threads.length === 0) return null;
  const normalized = text.toLowerCase();
  const workMatches = threads.filter((thread) => thread.primary_brain_id === "work_stress_brain").length;
  const mathMatches = threads.filter((thread) => thread.primary_brain_id === "math_reset_brain" || thread.primary_brain_id === "school_overwhelm_brain").length;
  if (normalized.includes("work") && workMatches > 0) return "You have mentioned work pressure a few times recently. We can continue gently.";
  if (normalized.includes("math") && mathMatches > 0) return "Math frustration has shown up repeatedly this week. We can keep the next step small.";
  return "This seems loosely connected to a recent heavy moment. We can continue slowly or reset.";
}

export function buildThreadUpsert(text: string, route: MomentRouteResult, userId: string, supportStyle: SupportStyle) {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    title: buildThreadTitle(text, route),
    summary: summarizeMoment(text),
    primary_brain_id: route.primaryBrainId,
    support_style: supportStyle,
    emotional_state: route.category === "emotion" ? "overloaded" : "steady",
    status: "active",
    last_activity_at: now,
    updated_at: now,
  };
}
