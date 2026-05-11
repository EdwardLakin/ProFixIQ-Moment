import { routeMoment } from "@/features/ai/router/routeMoment";
import type { RouteMomentInput } from "@/features/ai/router/types";
import type { MomentRouteResult, OperationalBlock } from "@/features/ai/types";

type PacingProfile = "grief" | "burnout" | "overwhelm" | "shutdown" | "conflict" | "default";
type ResponseDepth = "light" | "heavy" | "overwhelmed";
type FailureCase = "nothing_helps" | "unclear_need" | "numbness" | "emotional_exhaustion" | "repeated_grief" | "shame" | "emotional_overload" | "hopeless_non_crisis";
type PhraseBank = { acknowledgments: string[]; pace: string[]; continuity: string[]; direction: string[]; tinyStep: string[] };
type SupportDepthMode = "quiet_presence" | "reflective_support" | "companionship" | "emotional_unpacking" | "gentle_guidance" | "practical_help";

export type MomentOrchestratorResult = {
  trace: { pacingProfile: PacingProfile; responseDepth: ResponseDepth; supportFatigueReduction: boolean; clarificationUsed: boolean };
  route: MomentRouteResult;
  response: { routeLabel: string; routePath: string; reflection: string; tinyNextStep: string; whyThisRoute: string; continueLabel: string; steps: string[]; supportiveNote: string; followUpActions: { label: string; href: string }[]; blocks: OperationalBlock[] };
  warnings: string[];
};
const supportLabels: Record<string, string> = { finance_clarity_brain: "Finance pressure", work_stress_brain: "Trying to stay afloat at work", relationship_reflection_brain: "Relationship strain", school_overwhelm_brain: "School overwhelm", confidence_repair_brain: "Confidence dip", life_admin_brain: "Daily life load", grief_support_brain: "Carrying grief", emotional_presence_brain: "Emotional weight", loneliness_support_brain: "Feeling alone", overwhelm_grounding_brain: "Feeling overwhelmed" };
const routeBlock: Record<string, OperationalBlock> = { finance_clarity_brain: { type: "money_clarity", text: "When you’re ready, we can sort bills by due date and urgency so the pressure is less foggy." }, work_stress_brain: { type: "work_reset", text: "We can name one must-do, one can-wait, and one boundary line for today." }, relationship_reflection_brain: { type: "relationship_reflection", text: "Start with one feeling, one boundary, and one respectful request." }, school_overwhelm_brain: { type: "school_reset", text: "Choose one class and one short start task. Nothing beyond that yet." }, confidence_repair_brain: { type: "confidence_repair", text: "Name one recent win and one tiny proof step to rebuild trust in yourself." }, life_admin_brain: { type: "life_admin_sort", text: "Sort tasks into now, later, and not-today to lower load." }, grief_support_brain: { type: "emotional_presence", text: "This pain matters. We can keep this gentle and unhurried." }, emotional_presence_brain: { type: "emotional_presence", text: "You don’t need to force clarity right now." }, loneliness_support_brain: { type: "emotional_presence", text: "Feeling alone can ache deeply; we can stay with that without rushing fixes." }, overwhelm_grounding_brain: { type: "grounding", text: "Before planning anything, let your body settle with one slow exhale and softer shoulders." } };
const hasAny = (text: string, needles: string[]) => needles.some((n) => text.includes(n));
function getPacingProfile(input: RouteMomentInput, route: MomentRouteResult): PacingProfile { const text = `${input.momentText} ${input.selectedSignals.join(" ")}`.toLowerCase(); if (route.primaryBrainId === "grief_support_brain" || text.includes("grief") || text.includes("loss")) return "grief"; if (route.primaryBrainId === "work_stress_brain" || text.includes("burnout") || text.includes("exhausted")) return "burnout"; if (route.primaryBrainId === "overwhelm_grounding_brain" || text.includes("overwhelm")) return "overwhelm"; if (text.includes("shutdown") || text.includes("numb")) return "shutdown"; if (route.primaryBrainId === "relationship_reflection_brain" || text.includes("conflict") || text.includes("argument")) return "conflict"; return "default"; }
function uniqueLines(lines: string[]) { const seen = new Set<string>(); return lines.filter((line) => { const key = line.trim().toLowerCase(); if (!key || seen.has(key)) return false; seen.add(key); return true; }); }
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
  const style = input.supportStyle ?? "calm_reflective";
  const profile = getPacingProfile(input, route);
  const depth = getResponseDepth(input, profile);
  const failureCase = detectEmotionalFailureCase(input);
  const reducePrompting = shouldReducePrompting(input, profile, depth) || Boolean(failureCase);
  const supportDepthMode = pickSupportDepthMode(profile, depth, reducePrompting, route.primaryBrainId);
  const bank = phraseFor(profile, style);
  const reflection = depth === "light" && !failureCase ? `${bank.acknowledgments[0]} ${bank.pace[0]}` : bank.acknowledgments[0];
  const clarificationUsed = (input.followUpHistory?.length ?? 0) > 0;
  const continuity = bank.continuity[clarificationUsed ? 0 : 1];
  const tinyStep = supportDepthMode === "quiet_presence"
    ? "If you want to stay with this a little longer, I'm here with you."
    : profile === "grief" ? bank.tinyStep[0] : bank.tinyStep[1] ?? bank.tinyStep[0];
  const normalized = input.momentText.toLowerCase();
  const softLowConfidence = route.confidence === "low" || hasAny(normalized, ["not sure", "i don't know", "mixed", "everything"]) ? "There may be a few kinds of pressure stacked together here." : "";
  const failureCaseLine: Record<FailureCase, string> = { nothing_helps: "When nothing seems to help, staying present still counts as support.", unclear_need: "If you don't know what you need yet, we can keep this simple and gentle.", numbness: "Numb can be its own kind of overwhelm; there is nothing wrong with moving slowly.", emotional_exhaustion: "Emotional exhaustion asks for less demand, not more effort.", repeated_grief: "Grief can return in waves. It doesn't mean you're doing it wrong.", shame: "Shame can make everything feel smaller and harsher; you're still allowed care.", emotional_overload: "When everything feels loud inside, fewer words and fewer choices can help.", hopeless_non_crisis: "Even in a hopeless-feeling hour, we can focus on one steadying thing." };

  const blocks = uniqueLines([
    softLowConfidence || reflection,
    failureCase ? failureCaseLine[failureCase] : ((input.recentRouteHistory?.length ?? 0) > 2 ? "This feels familiar. You don't have to start from scratch." : continuity),
    reducePrompting ? "We can stay with this feeling before we do anything with it." : bank.direction[0],
    supportDepthMode === "quiet_presence" ? "You don't need to turn this into progress right now." : (reducePrompting ? "If you want, we can keep it to one very small next step." : tinyStep),
    (routeBlock[route.primaryBrainId] ?? { type: "grounding", text: "Take one slower breath and choose one small next action." }).text,
  ]).map<OperationalBlock>((text, index) => index === 0 ? { type: "reflection", text } : index === 1 ? { type: "emotional_presence", text } : index === 2 ? { type: "support", text } : index === 3 ? { type: "gentle_next_step", text } : { type: "route_transition", text });

  const routeLabel = supportLabels[route.primaryBrainId] ?? route.routeLabel;
  return {
    trace: { pacingProfile: profile, responseDepth: depth, supportFatigueReduction: reducePrompting, clarificationUsed },
    route,
    response: {
      routeLabel,
      routePath: route.routePath,
      reflection: softLowConfidence || reflection,
      tinyNextStep: failureCase === "numbness" || failureCase === "emotional_exhaustion" ? "One hand on your chest, one slower breath, then pause." : tinyStep,
      whyThisRoute: `${continuity} ${bank.direction[1]} Mode: ${supportDepthMode.replace(/_/g, " ")}.`,
      continueLabel: profile === "grief" || reducePrompting ? "Stay here a bit" : `Continue with ${routeLabel}`,
      steps: depth === "overwhelmed" || reducePrompting ? blocks.slice(2, 4).map((block) => block.text) : blocks.slice(2, 5).map((block) => block.text),
      supportiveNote: reducePrompting ? "No pressure to solve this right now." : bank.pace[1],
      followUpActions: reducePrompting ? [{ label: "Keep it quiet", href: "/check-in" }] : [{ label: profile === "shutdown" ? "Keep it gentle" : `Open ${routeLabel}`, href: route.routePath }, { label: "Quiet reflection", href: "/check-in" }],
      blocks,
    },
    warnings: route.primaryBrainId === "safety_support_brain" ? ["High-severity safety signals detected."] : [],
  };
}
