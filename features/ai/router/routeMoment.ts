import { brainRegistry } from "@/features/ai/brains/registry";
import type { BrainAudience, MomentBrainId } from "@/features/ai/brains/types";
import type { RouteMomentInput, RouteMomentResult } from "@/features/ai/router/types";

function inferAudience(ageRange?: RouteMomentInput["ageRange"]): BrainAudience {
  if (!ageRange) return "all";
  if (ageRange === "18_plus") return "adult";
  return "teen";
}

function hasAny(text: string, tokens: string[]) { return tokens.some((token) => text.includes(token)); }
function toConfidence(score: number): "low" | "medium" | "high" {
  if (score >= 0.85) return "high";
  if (score >= 0.6) return "medium";
  return "low";
}

export function routeMoment(input: RouteMomentInput): RouteMomentResult {
  const normalized = `${input.momentText} ${input.selectedSignals.join(" ")} ${input.profileContext ?? ""} ${(input.knownSupportNeeds ?? []).join(" ")}`.toLowerCase();
  const audience = inferAudience(input.ageRange);

  const severe = hasAny(normalized, ["suicide", "kill myself", "self harm", "hurt myself", "abuse"]);
  if (severe) return { primaryBrainId: "safety_support_brain", supportingBrainIds: [], routeLabel: brainRegistry.safety_support_brain.label, routePath: "/check-in", confidence: "high", reason: "Severe safety signal detected. Provide safety support language first.", audience: "all", category: "safety" };

  const pick = (id: MomentBrainId, supporting: MomentBrainId[], confidence: number, reason: string): RouteMomentResult => ({ primaryBrainId: id, supportingBrainIds: supporting, routeLabel: brainRegistry[id].label, routePath: brainRegistry[id].routePath, confidence: toConfidence(confidence), reason, audience: brainRegistry[id].audience, category: brainRegistry[id].category });

  if (hasAny(normalized, ["money", "bills", "budget", "debt", "taxes"])) return pick("finance_clarity_brain", ["task_start_brain"], 0.95, "Money language detected. Route to educational clarity only, not financial advice.");
  if (hasAny(normalized, ["partner", "spouse", "dating", "breakup", "marriage"])) return pick("relationship_reflection_brain", ["emotional_reset_brain"], 0.93, "Relationship language detected. Keep boundaries and communication prep focus.");
  if (hasAny(normalized, ["work", "boss", "job", "burnout", "deadline"])) return pick("work_stress_brain", ["task_start_brain"], 0.92, "Work stress language detected.");
  if (hasAny(normalized, ["math", "homework", "class", "test", "teacher"])) return pick(hasAny(normalized, ["math"]) ? "math_reset_brain" : "school_overwhelm_brain", ["task_start_brain"], 0.92, "School or math language detected.");
  if (hasAny(normalized, ["friend", "drama", "group chat", "rumor", "social"])) return pick("social_boundary_brain", ["emotional_reset_brain"], 0.9, "Social boundary language detected.");
  if (audience === "adult" && hasAny(normalized, ["errands", "forms", "appointments", "paperwork", "bills"])) return pick("life_admin_brain", ["household_overload_brain"], 0.84, "Adult life-admin language detected.");
  if (audience === "teen" && hasAny(normalized, ["start", "stuck", "avoid", "procrast"])) return pick("task_start_brain", ["emotional_reset_brain"], 0.86, "Teen start-friction signals detected.");

  return pick("emotional_reset_brain", ["task_start_brain"], 0.65, "Ambiguous input: start with emotional reset and tiny momentum step.");
}
