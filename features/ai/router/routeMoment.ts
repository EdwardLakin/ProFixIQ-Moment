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
function toConfidence(score: number): "low" | "medium" | "high" { return score >= 18 ? "high" : score >= 10 ? "medium" : "low"; }

export function routeMoment(input: RouteMomentInput): RouteMomentResult {
  const normalized = `${input.momentText} ${input.selectedSignals.join(" ")} ${input.profileContext ?? ""} ${(input.knownSupportNeeds ?? []).join(" ")} ${(input.followUpHistory ?? []).map((item) => item.choiceLabel).join(" ")} ${input.suggestedIntent ?? ""}`.toLowerCase();
  const audience = inferAudienceFromAgeRange(input.ageRange);
  if (hasAny(normalized, ["suicide", "kill myself", "self harm", "hurt myself", "abuse"])) return { primaryBrainId: "safety_support_brain", supportingBrainIds: [], routeLabel: "Safety Support", routePath: "/check-in", confidence: "high", reason: "Severe safety signal detected.", audience: "all", category: "safety" };

  const candidates = filterBrainsForAudience(Object.values(brainRegistry), audience, input.ageRange);
  const allowed = new Set(candidates.map((brain) => brain.id));
  const scores = new Map<MomentBrainId, number>();
  const add = (id: MomentBrainId, amount: number) => scores.set(id, (scores.get(id) ?? 0) + amount);

  if (input.optionalBrainHint) add(input.optionalBrainHint, 6);
  if (input.sourceSurface === "stuck") add("task_start_brain", 4);
  if (input.sourceSurface === "drama_pause") add("social_boundary_brain", 4);
  if (input.sourceSurface === "tutor") add("tutor_brain", 5);

  if (hasAny(normalized, ["grief", "loss", "died", "death", "passed away", "miss her", "miss him", "anniversary", "mother's day", "fathers day"])) { add("grief_support_brain", 15); add("emotional_presence_brain", 5); }
  if (hasAny(normalized, ["lonely", "alone", "isolated"])) add("loneliness_support_brain", 12);
  if (hasAny(normalized, ["overwhelmed", "shutdown", "spiral", "can't breathe", "cant focus"])) { add("overwhelm_grounding_brain", 12); add("emotional_presence_brain", 4); }
  if (hasAny(normalized, ["stuck", "avoid", "procrast", "can't start", "cannot start"])) { add("task_start_brain", 10); add("emotional_presence_brain", 3); }
  if (hasAny(normalized, ["math", "homework", "studying", "test prep", "science", "writing", "i don't understand", "i dont understand", "grade", "teacher", "class"])) add("tutor_brain", 14);
  if (hasAny(normalized, ["friend", "drama", "conflict", "boundary", "group chat", "rumor"])) add("social_boundary_brain", 12);
  if (hasAny(normalized, ["work", "boss", "deadline", "burnout"])) add("work_stress_brain", 10);
  if (audience === "adult" && hasAny(normalized, ["money", "bills", "budget", "debt", "tax", "paperwork", "appointments"])) { add("finance_clarity_brain", 10); add("life_admin_brain", 7); }

  for (const route of input.recentRouteHistory ?? []) add(route, 1.5);
  if (hasAny(normalized, ["feel stupid", "ashamed", "embarrassed"])) add("emotional_presence_brain", 5);

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const selected = ranked.find(([id]) => allowed.has(id))?.[0] ?? "emotional_reset_brain";
  const score = ranked.find(([id]) => id === selected)?.[1] ?? 0;
  const supports = ranked.filter(([id]) => id !== selected && allowed.has(id) && (scores.get(id) ?? 0) >= 5).slice(0, 2).map(([id]) => id);

  return {
    primaryBrainId: selected,
    supportingBrainIds: supports,
    routeLabel: brainRegistry[selected].label,
    routePath: brainRegistry[selected].routePath,
    confidence: toConfidence(score),
    reason: `Weighted routing selected ${selected} from text, preset, emotion, and continuity signals.`,
    audience: brainRegistry[selected].audience,
    category: brainRegistry[selected].category,
  };
}
