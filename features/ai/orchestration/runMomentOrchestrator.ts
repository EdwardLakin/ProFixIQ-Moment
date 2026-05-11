import { routeMoment } from "@/features/ai/router/routeMoment";
import type { RouteMomentInput } from "@/features/ai/router/types";
import type { MomentRouteResult, OperationalBlock } from "@/features/ai/types";
import { buildEmotionalCognition, type EmotionalCognition } from "@/features/ai/orchestration/emotionalCognitionEngine";
import { behaviorForDomain, classifyResponseDomain } from "@/features/ai/orchestration/domainBehavior";

type PacingProfile = "grief" | "burnout" | "overwhelm" | "shutdown" | "conflict" | "default";
type ResponseDepth = "light" | "heavy" | "overwhelmed";
type FailureCase = "nothing_helps" | "unclear_need" | "numbness" | "emotional_exhaustion" | "repeated_grief" | "shame" | "emotional_overload" | "hopeless_non_crisis";
type PhraseBank = { acknowledgments: string[]; pace: string[]; continuity: string[]; direction: string[]; tinyStep: string[] };
type SupportDepthMode = "quiet_presence" | "reflective_support" | "companionship" | "emotional_unpacking" | "gentle_guidance" | "practical_help";

export type MomentOrchestratorResult = {
  trace: { pacingProfile: PacingProfile; responseDepth: ResponseDepth; supportFatigueReduction: boolean; clarificationUsed: boolean; emotionalCognition: EmotionalCognition };
  route: MomentRouteResult;
  response: { routeLabel: string; routePath: string; reflection: string; tinyNextStep: string; whyThisRoute: string; continueLabel: string; steps: string[]; supportiveNote: string; followUpActions: { label: string; href: string }[]; blocks: OperationalBlock[] };
  warnings: string[];
};
const supportLabels: Record<string, string> = { finance_clarity_brain: "Finance pressure", work_stress_brain: "Trying to stay afloat at work", relationship_reflection_brain: "Relationship strain", school_overwhelm_brain: "School overwhelm", confidence_repair_brain: "Confidence dip", life_admin_brain: "Daily life load", grief_support_brain: "Carrying grief", emotional_presence_brain: "Emotional weight", loneliness_support_brain: "Feeling alone", overwhelm_grounding_brain: "Feeling overwhelmed" };
const hasAny = (text: string, needles: string[]) => needles.some((n) => text.includes(n));
function getPacingProfile(input: RouteMomentInput, route: MomentRouteResult): PacingProfile { const text = `${input.momentText} ${input.selectedSignals.join(" ")}`.toLowerCase(); if (route.primaryBrainId === "grief_support_brain" || text.includes("grief") || text.includes("loss")) return "grief"; if (route.primaryBrainId === "work_stress_brain" || text.includes("burnout") || text.includes("exhausted")) return "burnout"; if (route.primaryBrainId === "overwhelm_grounding_brain" || text.includes("overwhelm")) return "overwhelm"; if (text.includes("shutdown") || text.includes("numb")) return "shutdown"; if (route.primaryBrainId === "relationship_reflection_brain" || text.includes("conflict") || text.includes("argument")) return "conflict"; return "default"; }
function uniqueLines(lines: string[]) { const seen = new Set<string>(); return lines.filter((line) => { const key = line.trim().toLowerCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; }); }
function buildGriefFirstReflection(momentText: string): string {
  const lowered = momentText.toLowerCase();
  const mothersDayCue = /mom|mother|moms|mother's day|mothers day/.test(lowered);
  if (mothersDayCue) {
    return "I’m really sorry. That kind of sadness can feel especially unfair when other people are making plans with their moms. It’s not just missing her privately — it’s being reminded of what you don’t get to have right now.";
  }
  const excerpt = momentText.trim().split(/[.!?]/).map((part) => part.trim()).find((part) => part.length >= 18);
  if (excerpt) {
    return `I’m really sorry you’re carrying this. Reading \"${excerpt.slice(0, 140)}\" tells me this hurts in a deep, personal way.`;
  }
  return "I’m really sorry. Losing someone you love can ache in a way that feels relentless and unfair.";
}
function pickSupportDepthMode(profile: PacingProfile, depth: ResponseDepth, reducePrompting: boolean, routeId: string): SupportDepthMode {
  if (routeId === "grief_support_brain") return "quiet_presence";
  if (depth === "heavy" && reducePrompting) return "companionship";
  if (depth === "overwhelmed") return "reflective_support";
  if (profile === "conflict") return "emotional_unpacking";
  if (routeId === "work_stress_brain" || routeId === "finance_clarity_brain") return "practical_help";
  return reducePrompting ? "reflective_support" : "gentle_guidance";
}
function getResponseDepth(input: RouteMomentInput, profile: PacingProfile): ResponseDepth { const normalized = `${input.momentText} ${input.selectedSignals.join(" ")} ${(input.knownSupportNeeds ?? []).join(" ")}`.toLowerCase(); if (profile === "grief" || profile === "shutdown" || normalized.includes("can't do") || normalized.includes("cannot do")) return "heavy"; if (profile === "overwhelm" || normalized.includes("exhaust") || normalized.includes("numb") || normalized.includes("spiral")) return "overwhelmed"; return "light"; }
function shouldReducePrompting(input: RouteMomentInput, profile: PacingProfile, depth: ResponseDepth) { const followUps = input.followUpHistory?.length ?? 0; const repeats = input.recentRouteHistory?.slice(-4).filter((brainId) => brainId === input.recentRouteHistory?.[input.recentRouteHistory.length - 1]).length ?? 0; return depth !== "light" || profile === "grief" || profile === "shutdown" || followUps >= 3 || repeats >= 3; }
function detectEmotionalFailureCase(input: RouteMomentInput): FailureCase | null { const text = `${input.momentText} ${input.selectedSignals.join(" ")} ${(input.knownSupportNeeds ?? []).join(" ")}`.toLowerCase(); if (hasAny(text, ["nothing helps", "nothing works", "tried everything"])) return "nothing_helps"; if (hasAny(text, ["i don't know what i need", "dont know what i need", "not sure what i need"])) return "unclear_need"; if (hasAny(text, ["numb", "feel nothing", "empty"])) return "numbness"; if (hasAny(text, ["emotionally exhausted", "drained", "worn out", "spent"])) return "emotional_exhaustion"; if (hasAny(text, ["grief again", "still grieving", "same grief", "hasn't gotten better"])) return "repeated_grief"; if (hasAny(text, ["ashamed", "embarrassed", "humiliated", "stupid"])) return "shame"; if (hasAny(text, ["too much", "overloaded", "flooded"])) return "emotional_overload"; if (hasAny(text, ["hopeless", "pointless", "what's the point"])) return "hopeless_non_crisis"; return null; }
function phraseFor(profile: PacingProfile, style: NonNullable<RouteMomentInput["supportStyle"]>): PhraseBank { const byProfile: Record<PacingProfile, PhraseBank> = { grief: { acknowledgments: ["This carries a lot of weight, and it makes sense it hurts.", "I can hear how tender this is for you right now."], pace: ["We can move slowly and keep this soft.", "No rush to make this tidy today."], continuity: ["This feels connected to what has been heavy lately.", "You’ve been carrying this for a while."], direction: ["If helpful, we can stay with memory, grounding, or quiet reflection.", "If you want, we can hold this gently before choosing any next move."], tinyStep: ["If it helps, place a hand on your chest and take one slower breath.", "If and only if it feels okay, name one thing you miss in a short sentence."] }, burnout: { acknowledgments: ["You sound stretched thin.", "This is a lot to hold while already depleted."], pace: ["Let’s ground first, then simplify.", "First we lower pressure, then we sort."], continuity: ["This kind of pressure has shown up before.", "You’ve been trying to approach this with more gentleness."], direction: ["After one breath, we can narrow to one humane priority.", "Then we can cut this to the minimum that protects your energy today."], tinyStep: ["Loosen your jaw and shoulders before deciding anything.", "Choose one task to protect, and let the rest be later."] }, overwhelm: { acknowledgments: ["This sounds like too many demands at once.", "Your system is carrying more than it can process right now."], pace: ["Let’s reduce complexity first.", "We’ll keep choices very small."], continuity: ["This echoes the overload you’ve described before.", "This feels connected to earlier overwhelm moments."], direction: ["We can sort this into one emotional lane at a time.", "We can choose calm-first support before any plan."], tinyStep: ["Name the heaviest category in two words.", "Choose between grounding or one short list—just one."] }, shutdown: { acknowledgments: ["It makes sense your system wants to shut down.", "This sounds like a low-battery moment."], pace: ["Let’s keep this very low effort.", "No big choices right now."], continuity: ["You’ve had moments like this where less helped more.", "This feels familiar."], direction: ["We can use a reduced-choice path.", "We’ll keep language and options simple."], tinyStep: ["Pick one: sip water, sit back, or one slow breath.", "Do one body reset, then stop if needed."] }, conflict: { acknowledgments: ["This relationship tension sounds draining.", "It makes sense this conflict is taking up so much space."], pace: ["Reflection first, boundaries second.", "We can pause before deciding what to say."], continuity: ["This seems connected to earlier boundary pressure.", "You’ve been trying to handle this more clearly over time."], direction: ["Once grounded, we can draft one calm boundary line.", "Then we can shape one respectful boundary line."], tinyStep: ["Write the feeling first, not the response.", "Try one boundary sentence that protects your energy, without over-explaining."] }, default: { acknowledgments: ["I hear a lot of load in this moment.", "Thanks for naming what this feels like."], pace: [style === "gentle_grounding" ? "We can stay gentle and paced." : "We can keep this clear and low-pressure."], continuity: ["This feels related to what’s been hard lately.", "There’s a thread here from earlier moments."], direction: ["If useful, we can choose support first and structure second.", "If you want, we can find one supportive direction next."], tinyStep: ["A small next move is enough for now.", "One short step is plenty right now."] } }; return byProfile[profile]; }

export function runMomentOrchestrator(input: RouteMomentInput): MomentOrchestratorResult {
  const route = routeMoment(input);
  const cognition = buildEmotionalCognition(input);
  const style = input.supportStyle ?? "calm_reflective";
  const profile = getPacingProfile(input, route);
  const depth = getResponseDepth(input, profile);
  const failureCase = detectEmotionalFailureCase(input);
  const reducePrompting = shouldReducePrompting(input, profile, depth) || Boolean(failureCase);
    const bank = phraseFor(profile, style);
  const domain = classifyResponseDomain(input, route.primaryBrainId);
  const domainBehavior = behaviorForDomain(domain);

  const griefReflection = buildGriefFirstReflection(input.momentText);
  const tutorReflection = "Not understanding it doesn't mean you're stupid — it means the explanation hasn't clicked yet.";
  const stuckReflection = "That shame spiral can make starting even harder. Wasting the day doesn't mean you ruined it.";
  const conflictReflection = "Being left out hurts, and wanting to fire off a mean text usually means you're protecting that hurt.";
  const overwhelmReflection = "That sounds like a lot at once. Let's make this smaller so your brain has less to carry.";

  const reflection =
    domain === "grief_loss" ? griefReflection
      : domain === "tutor" ? tutorReflection
      : domain === "stuck_avoidance" ? stuckReflection
      : domain === "conflict" ? conflictReflection
      : domain === "general_overwhelm" ? overwhelmReflection
      : (cognition.subtext[0] ?? bank.acknowledgments[0]);

  const tinyNextStep =
    domain === "tutor" ? "Send me the exact problem, topic, or study-guide question that's confusing, and we'll break it down step by step."
      : domain === "stuck_avoidance" ? "What's the essay about? We'll pick the smallest possible first move."
      : domain === "conflict" ? "Want help drafting one honest text that says you're hurt without escalating it?"
      : domain === "general_overwhelm" ? "Pick one lane: school, work, or relationships. We'll handle only that first."
      : domain === "grief_loss" ? "If you want, tell me one moment with her that you wish you could have again."
      : "Tell me which part feels most urgent, and we'll start there.";

  const steps = domainBehavior.askFollowUp ? [tinyNextStep] : [];
  const supportiveNote = domain === "tutor"
    ? "Confusion is part of learning, not proof that you're bad at this."
    : domain === "grief_loss"
      ? "We can pick up from there, or start fresh."
      : "Start wherever feels easiest.";

  const blocks = uniqueLines([
    reflection,
    tinyNextStep,
    ...(steps.length ? steps : []),
  ]).map<OperationalBlock>((text, index) => index === 0 ? { type: "reflection", text } : { type: "gentle_next_step", text });

  const clarificationUsed = (input.followUpHistory?.length ?? 0) > 0;
  const continuity = clarificationUsed ? "You can keep going from what you shared, or tell me what changed." : "We can pick up from there, or start fresh.";
  const routeLabel = supportLabels[route.primaryBrainId] ?? route.routeLabel;
  return {
    trace: { pacingProfile: profile, responseDepth: depth, supportFatigueReduction: reducePrompting, clarificationUsed, emotionalCognition: cognition },
    route,
    response: {
      routeLabel,
      routePath: route.routePath,
      reflection,
      tinyNextStep,
      whyThisRoute: continuity,
      continueLabel: profile === "grief" ? "Stay here a bit" : `Continue with ${routeLabel}`,
      steps,
      supportiveNote,
      followUpActions: [{ label: profile === "shutdown" ? "Keep it gentle" : `Open ${routeLabel}`, href: route.routePath }],
      blocks,
    },
    warnings: route.primaryBrainId === "safety_support_brain" ? ["High-severity safety signals detected."] : [],
  };
}
