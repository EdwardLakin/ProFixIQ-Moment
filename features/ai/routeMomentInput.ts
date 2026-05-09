import { brainRegistry } from "@/features/ai/brainRegistry";
import type { MomentBrainId, MomentRouteResult } from "@/features/ai/types";

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function routeMomentInput(input: { text: string; selectedStates: string[] }): MomentRouteResult {
  const normalized = `${input.text} ${input.selectedStates.join(" ")}`.toLowerCase();

  const pick = (primaryBrain: MomentBrainId, supportingBrains: MomentBrainId[], reason: string, confidence: MomentRouteResult["confidence"]): MomentRouteResult => ({
    primaryBrain,
    supportingBrains,
    routePath: brainRegistry[primaryBrain].routePath,
    reason,
    confidence,
  });

  if (hasAny(normalized, ["math", "homework", "algebra", "worksheet", "numbers"])) return pick("math_reset_helper", ["stuck_decomposer"], "Math and schoolwork signals detected.", "high");
  if (hasAny(normalized, ["friend", "drama", "group chat", "rumor", "conflict"])) return pick("social_boundary_helper", ["emotion_reflector"], "Social conflict language detected.", "high");
  if (hasAny(normalized, ["can't start", "cant start", "avoiding", "procrastinating", "procrastination"])) return pick("stuck_decomposer", ["task_simplifier"], "Stuck and avoidance language detected.", "high");
  if (hasAny(normalized, ["tired", "frozen", "shutting down", "shutdown"])) return pick("shutdown_recovery", ["focus_reentry"], "Energy drop/freeze language detected.", "medium");
  if (hasAny(normalized, ["fail", "dumb", "embarrassed", "stupid"])) return pick("confidence_repair", ["school_restart"], "Confidence injury language detected.", "medium");

  return pick("emotion_reflector", ["stuck_decomposer"], "General check-in path used.", "low");
}
