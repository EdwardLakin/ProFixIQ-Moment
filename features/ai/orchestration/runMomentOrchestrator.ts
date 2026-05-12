import { routeMoment } from "@/features/ai/router/routeMoment";
import type { RouteMomentInput } from "@/features/ai/router/types";
import type { MomentRouteResult, OperationalBlock } from "@/features/ai/types";
import { buildEmotionalCognition, type EmotionalCognition } from "@/features/ai/orchestration/emotionalCognitionEngine";
import { behaviorForDomain, classifyResponseDomain } from "@/features/ai/orchestration/domainBehavior";
import { buildUnifiedCognition } from "@/features/ai/orchestration/unifiedCognition";

type PacingProfile = "grief" | "burnout" | "overwhelm" | "shutdown" | "conflict" | "default";
type ResponseDepth = "light" | "heavy" | "overwhelmed";
type FailureCase = "nothing_helps" | "unclear_need" | "numbness" | "emotional_exhaustion" | "repeated_grief" | "shame" | "emotional_overload" | "hopeless_non_crisis";

export type MomentOrchestratorResult = {
  trace: { pacingProfile: PacingProfile; responseDepth: ResponseDepth; supportFatigueReduction: boolean; clarificationUsed: boolean; emotionalCognition: EmotionalCognition; unifiedCognition: ReturnType<typeof buildUnifiedCognition>; previousDomain: string | null; currentDomain: string; suppressedDomains: string[]; emotionalCarryoverStrength: number; continuitySuppressedReason: string | null };
  route: MomentRouteResult;
  response: { routeLabel: string; routePath: string; reflection: string; tinyNextStep: string; whyThisRoute: string; continueLabel: string; steps: string[]; supportiveNote: string; followUpActions: { label: string; href: string }[]; blocks: OperationalBlock[] };
  warnings: string[];
};

const supportLabels: Record<string, string> = { finance_clarity_brain: "Finance pressure", work_stress_brain: "Trying to stay afloat at work", relationship_reflection_brain: "Relationship strain", school_overwhelm_brain: "School overwhelm", confidence_repair_brain: "Confidence dip", life_admin_brain: "Daily life load", grief_support_brain: "Carrying grief", emotional_presence_brain: "Emotional weight", loneliness_support_brain: "Feeling alone", overwhelm_grounding_brain: "Feeling overwhelmed" };
const hasAny = (text: string, needles: string[]) => needles.some((n) => text.includes(n));
function getPacingProfile(input: RouteMomentInput, route: MomentRouteResult): PacingProfile { const text = `${input.momentText} ${input.selectedSignals.join(" ")}`.toLowerCase(); if (route.primaryBrainId === "grief_support_brain" || text.includes("grief") || text.includes("loss")) return "grief"; if (route.primaryBrainId === "work_stress_brain" || text.includes("burnout") || text.includes("exhausted")) return "burnout"; if (route.primaryBrainId === "overwhelm_grounding_brain" || text.includes("overwhelm")) return "overwhelm"; if (text.includes("shutdown") || text.includes("numb")) return "shutdown"; if (route.primaryBrainId === "relationship_reflection_brain" || text.includes("conflict") || text.includes("argument")) return "conflict"; return "default"; }
function getResponseDepth(input: RouteMomentInput, profile: PacingProfile): ResponseDepth { const normalized = `${input.momentText} ${input.selectedSignals.join(" ")} ${(input.knownSupportNeeds ?? []).join(" ")}`.toLowerCase(); if (profile === "grief" || profile === "shutdown" || normalized.includes("can't do") || normalized.includes("cannot do")) return "heavy"; if (profile === "overwhelm" || normalized.includes("exhaust") || normalized.includes("numb") || normalized.includes("spiral")) return "overwhelmed"; return "light"; }
function shouldReducePrompting(input: RouteMomentInput, profile: PacingProfile, depth: ResponseDepth) { const followUps = input.followUpHistory?.length ?? 0; const repeats = input.recentRouteHistory?.slice(-4).filter((brainId) => brainId === input.recentRouteHistory?.[input.recentRouteHistory.length - 1]).length ?? 0; return depth !== "light" || profile === "grief" || profile === "shutdown" || followUps >= 3 || repeats >= 3; }
function detectEmotionalFailureCase(input: RouteMomentInput): FailureCase | null { const text = `${input.momentText} ${input.selectedSignals.join(" ")} ${(input.knownSupportNeeds ?? []).join(" ")}`.toLowerCase(); if (hasAny(text, ["nothing helps", "nothing works", "tried everything"])) return "nothing_helps"; if (hasAny(text, ["i don't know what i need", "dont know what i need", "not sure what i need"])) return "unclear_need"; if (hasAny(text, ["numb", "feel nothing", "empty"])) return "numbness"; if (hasAny(text, ["emotionally exhausted", "drained", "worn out", "spent"])) return "emotional_exhaustion"; if (hasAny(text, ["grief again", "still grieving", "same grief", "hasn't gotten better"])) return "repeated_grief"; if (hasAny(text, ["ashamed", "embarrassed", "humiliated", "stupid"])) return "shame"; if (hasAny(text, ["too much", "overloaded", "flooded"])) return "emotional_overload"; if (hasAny(text, ["hopeless", "pointless", "what's the point"])) return "hopeless_non_crisis"; return null; }

function composeNaturalResponse(domain: ReturnType<typeof classifyResponseDomain>, capabilityWeights: ReturnType<typeof buildUnifiedCognition>["capabilityWeights"], momentText: string, opts: { activeDomain: string; suppressedDomains: string[]; emotionalCarryoverStrength: number }) {
  const suppressGriefCadence = opts.suppressedDomains.includes("grief_loss") || (opts.activeDomain === "tutor" && opts.emotionalCarryoverStrength < 0.25);
  if (domain === "tutor") {
    const warmth = capabilityWeights.shameReduction > 0.35 ? "You're not stupid; this just hasn't been explained in a way that clicks yet." : "It's okay for this to feel hard before it starts to make sense.";
    return {
      reflection: warmth,
      tinyNextStep: "Paste the exact problem or prompt, and tell me where you get stuck so we can solve that part first step-by-step.",
      supportiveNote: "Confusion is a normal stage of learning.",
    };
  }

  if (domain === "grief_loss") {
    return {
      reflection: "I'm really sorry. Days like this can make the absence feel sharp all over again.",
      tinyNextStep: "If you want, tell me one memory that feels closest right now, and we can stay there.",
      supportiveNote: "You don't need to force progress in this moment.",
    };
  }

  if (domain === "conflict") {
    return {
      reflection: "That sounds painful, and reacting fast usually comes from feeling hurt.",
      tinyNextStep: "Want to draft one message that is honest and calm without escalating things?",
      supportiveNote: "You can protect yourself without going on the attack.",
    };
  }

  return {
    reflection: suppressGriefCadence ? `Got it. ${momentText.trim().slice(0, 80)}` : `I hear how heavy this feels. ${momentText.trim().slice(0, 80)}`,
    tinyNextStep: "Tell me the most urgent part and we'll focus there first.",
    supportiveNote: "Small steps still count.",
  };
}

export function runMomentOrchestrator(input: RouteMomentInput): MomentOrchestratorResult {
  const route = routeMoment(input);
  const cognition = buildEmotionalCognition(input);
  const profile = getPacingProfile(input, route);
  const depth = getResponseDepth(input, profile);
  const failureCase = detectEmotionalFailureCase(input);
  const reducePrompting = shouldReducePrompting(input, profile, depth) || Boolean(failureCase);
  const domain = classifyResponseDomain(input, route.primaryBrainId);
  const previousDomain = input.recentRouteHistory?.[0] ? classifyResponseDomain({ ...input, momentText: input.knownSupportNeeds?.[0] ?? "", selectedSignals: [] }, input.recentRouteHistory[0]) : null;
  const hardDomainTransition = Boolean(previousDomain && previousDomain !== domain && !(previousDomain === "general" || domain === "general"));
  const domainBehavior = behaviorForDomain(domain);
  const unifiedCognition = buildUnifiedCognition(input, cognition, input.profileContext, route.primaryBrainId, domain);
  const suppressedDomains = hardDomainTransition ? [previousDomain as string] : [];
  const emotionalCarryoverStrength = hardDomainTransition ? 0.05 : unifiedCognition.memoryRelevance.score;
  const natural = composeNaturalResponse(domain, unifiedCognition.capabilityWeights, input.momentText, { activeDomain: domain, suppressedDomains, emotionalCarryoverStrength });

  const steps = domainBehavior.askFollowUp ? [natural.tinyNextStep] : [];
  const blocks = [natural.reflection, natural.tinyNextStep]
    .filter(Boolean)
    .map<OperationalBlock>((text, index) => index === 0 ? { type: "reflection", text } : { type: "gentle_next_step", text });

  const clarificationUsed = (input.followUpHistory?.length ?? 0) > 0;
  const continuitySuppressedReason = hardDomainTransition ? "domain_shift" : (unifiedCognition.memoryRelevance.suppressionReason ?? null);
  const continuity = unifiedCognition.memoryRelevance.applied && !hardDomainTransition
    ? "I can build on what you've shared before if that still fits this moment."
    : "We can stay with this moment only, and bring in past context later if you want.";
  const routeLabel = supportLabels[route.primaryBrainId] ?? route.routeLabel;
  return {
    trace: { pacingProfile: profile, responseDepth: depth, supportFatigueReduction: reducePrompting, clarificationUsed, emotionalCognition: cognition, unifiedCognition, previousDomain, currentDomain: domain, suppressedDomains, emotionalCarryoverStrength, continuitySuppressedReason },
    route,
    response: {
      routeLabel,
      routePath: route.routePath,
      reflection: natural.reflection,
      tinyNextStep: natural.tinyNextStep,
      whyThisRoute: continuity,
      continueLabel: profile === "grief" ? "Stay here a bit" : `Continue with ${routeLabel}`,
      steps,
      supportiveNote: natural.supportiveNote,
      followUpActions: [{ label: profile === "shutdown" ? "Keep it gentle" : `Open ${routeLabel}`, href: route.routePath }],
      blocks,
    },
    warnings: route.primaryBrainId === "safety_support_brain" ? ["High-severity safety signals detected."] : [],
  };
}
