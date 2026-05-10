import type { MomentRouteResult } from "@/features/ai/types";
import type { ContinuityCue, MomentThread, SupportStyle } from "@/features/moment/continuity/types";

function tokenize(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((token) => token.length > 2);
}

function similarityScore(a: string, b: string) {
  const one = new Set(tokenize(a));
  const two = new Set(tokenize(b));
  if (one.size === 0 || two.size === 0) return 0;
  let overlap = 0;
  one.forEach((token) => {
    if (two.has(token)) overlap += 1;
  });
  return overlap / Math.max(one.size, two.size);
}

function summarizeMoment(text: string) {
  return text.trim().replace(/\s+/g, " ").slice(0, 180);
}

export function summarizeContinuity(text: string, threads: MomentThread[]): string | null {
  const best = findThreadContinuation(text, threads, "emotional_reset_brain");
  if (!best) return null;
  return `This feels connected to ${best.thread.title.toLowerCase()}. You have been trying to approach this differently.`;
}

export function continuityCueFromThread(thread: MomentThread, incomingText: string): ContinuityCue | null {
  const score = similarityScore(incomingText, `${thread.title} ${thread.summary}`);
  if (score < 0.25) return null;
  return {
    threadId: thread.id,
    prompt: "Last time grounding helped before action. Want to continue where we left off?",
    confidence: score > 0.42 ? "medium" : "low",
  };
}

export function findThreadContinuation(text: string, threads: MomentThread[], primaryBrainId: string) {
  const ranked = threads.map((thread) => {
    const routeBoost = thread.primary_brain_id === primaryBrainId ? 0.28 : 0;
    const activeBoost = thread.status === "active" ? 0.18 : 0;
    const score = similarityScore(text, `${thread.title} ${thread.summary}`) + routeBoost + activeBoost;
    return { thread, score };
  }).sort((a, b) => b.score - a.score);
  return ranked[0] && ranked[0].score >= 0.38 ? ranked[0] : null;
}

export function inferSupportStyle(style?: SupportStyle): SupportStyle {
  return style ?? "calm_reflective";
}

export function buildThreadUpsert(text: string, route: MomentRouteResult, userId: string, supportStyle: SupportStyle, existingThreadId?: string) {
  const now = new Date().toISOString();
  return {
    id: existingThreadId,
    user_id: userId,
    title: route.routeLabel,
    summary: summarizeMoment(text),
    primary_brain_id: route.primaryBrainId,
    support_style: supportStyle,
    emotional_state: route.category === "emotion" ? "overloaded" : "steady",
    status: "active",
    last_activity_at: now,
    updated_at: now,
  };
}
