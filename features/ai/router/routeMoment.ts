import { brainRegistry } from "@/features/ai/brains/registry";
import type { AgeRange, BrainAudience, MomentBrain, MomentBrainId } from "@/features/ai/brains/types";
import type { RouteMomentInput, RouteMomentResult } from "@/features/ai/router/types";

export function inferAudienceFromAgeRange(ageRange?: AgeRange): BrainAudience {
  if (!ageRange) return "all";
  return ageRange === "18_plus" ? "adult" : "teen";
}

export function isBrainAllowedForAudience(brain: MomentBrain, audience: BrainAudience, ageRange?: AgeRange): boolean {
  if (brain.allowedAgeRanges && ageRange && !brain.allowedAgeRanges.includes(ageRange)) return false;
  if (audience === "teen" && brain.audience === "adult") return false;
  if (audience === "adult" && brain.audience === "teen") return false;
  return true;
}

export function filterBrainsForAudience(brains: MomentBrain[], audience: BrainAudience, ageRange?: AgeRange): MomentBrain[] {
  return brains.filter((brain) => isBrainAllowedForAudience(brain, audience, ageRange));
}

function hasAny(text: string, tokens: string[]) { return tokens.some((token) => text.includes(token)); }
function toConfidence(score: number): "low" | "medium" | "high" { return score >= 0.85 ? "high" : score >= 0.6 ? "medium" : "low"; }

export function routeMoment(input: RouteMomentInput): RouteMomentResult {
  const normalized = `${input.momentText} ${input.selectedSignals.join(" ")} ${input.profileContext ?? ""} ${(input.knownSupportNeeds ?? []).join(" ")}`.toLowerCase();
  const audience = inferAudienceFromAgeRange(input.ageRange);

  const severe = hasAny(normalized, ["suicide", "kill myself", "self harm", "hurt myself", "abuse"]);
  if (severe) return { primaryBrainId: "safety_support_brain", supportingBrainIds: [], routeLabel: "Safety Support", routePath: "/check-in", confidence: "high", reason: "Severe safety signal detected.", audience: "all", category: "safety" };

  const adultCoded = ["finances", "partner", "marriage", "taxes", "workplace", "dating"];
  const minorAdultCoded = audience === "teen" && hasAny(normalized, adultCoded);

  const candidates = filterBrainsForAudience(Object.values(brainRegistry), audience, input.ageRange);
  const allowed = new Set(candidates.map((brain) => brain.id));

  const pick = (id: MomentBrainId, supporting: MomentBrainId[], confidence: number, reason: string): RouteMomentResult => {
    const selected = allowed.has(id) ? id : "emotional_reset_brain";
    const safeSupporting = supporting.filter((brainId) => allowed.has(brainId));
    return { primaryBrainId: selected, supportingBrainIds: safeSupporting, routeLabel: brainRegistry[selected].label, routePath: brainRegistry[selected].routePath, confidence: toConfidence(confidence), reason, audience: brainRegistry[selected].audience, category: brainRegistry[selected].category };
  };

  if (minorAdultCoded) return pick("emotional_reset_brain", ["social_boundary_brain", "task_start_brain"], 0.9, "Minor used adult-coded terms. Route to all-safe boundary support.");
  if (hasAny(normalized, ["money", "bills", "budget", "debt", "taxes"])) return pick("finance_clarity_brain", ["task_start_brain"], 0.95, "Money language detected.");
  if (hasAny(normalized, ["partner", "spouse", "dating", "breakup", "marriage"])) return pick("relationship_reflection_brain", ["emotional_reset_brain"], 0.93, "Relationship language detected.");
  if (hasAny(normalized, ["work", "boss", "job", "burnout", "deadline"])) return pick("work_stress_brain", ["task_start_brain"], 0.92, "Work stress language detected.");
  if (hasAny(normalized, ["math", "homework", "class", "test", "teacher"])) return pick(hasAny(normalized, ["math"]) ? "math_reset_brain" : "school_overwhelm_brain", ["task_start_brain"], 0.92, "School or math language detected.");
  if (hasAny(normalized, ["friend", "drama", "group chat", "rumor", "social"])) return pick("social_boundary_brain", ["emotional_reset_brain"], 0.9, "Social boundary language detected.");
  if (audience === "adult" && hasAny(normalized, ["errands", "forms", "appointments", "paperwork", "bills"])) return pick("life_admin_brain", ["household_overload_brain"], 0.84, "Adult life-admin language detected.");
  if (hasAny(normalized, ["start", "stuck", "avoid", "procrast"])) return pick("task_start_brain", ["emotional_reset_brain"], 0.86, "Start-friction signals detected.");

  return pick("emotional_reset_brain", ["task_start_brain"], 0.65, "Ambiguous input: start with emotional reset.");
}
