import { routeMoment } from "@/features/ai/router/routeMoment";
import type { RouteMomentInput } from "@/features/ai/router/types";
import type { MomentRouteResult, OperationalBlock } from "@/features/ai/types";

export type MomentOrchestratorResult = {
  route: MomentRouteResult;
  response: {
    routeLabel: string;
    routePath: string;
    reflection: string;
    tinyNextStep: string;
    whyThisRoute: string;
    continueLabel: string;
    steps: string[];
    supportiveNote: string;
    followUpActions: { label: string; href: string }[];
    blocks: OperationalBlock[];
  };
  warnings: string[];
};

const routeBlock: Record<string, OperationalBlock> = {
  finance_clarity_brain: { type: "money_clarity", text: "List fixed bills, urgent due dates, and one question to clarify before acting." },
  work_stress_brain: { type: "work_reset", text: "Pick one must-do, one can-wait, and one boundary sentence for today." },
  relationship_reflection_brain: { type: "relationship_reflection", text: "Name one feeling, one boundary, and one respectful request." },
  school_overwhelm_brain: { type: "school_reset", text: "Pick one class and one 10-minute start task." },
  confidence_repair_brain: { type: "confidence_repair", text: "Write one recent win and one tiny proof-of-progress step." },
  life_admin_brain: { type: "life_admin_sort", text: "Sort tasks into now, later, and delegate if possible." },
  grief_support_brain: { type: "emotional_presence", text: "That sounds really heavy. It makes sense this hurts, especially around meaningful dates." },
  emotional_presence_brain: { type: "emotional_presence", text: "You do not need to force yourself to be okay right now." },
  loneliness_support_brain: { type: "emotional_presence", text: "Feeling alone can ache in a deep way. You are not wrong for feeling this." },
  overwhelm_grounding_brain: { type: "grounding", text: "Before solving anything, let your body settle: unclench your jaw, lower your shoulders, and take one slow breath." },
};

export function runMomentOrchestrator(input: RouteMomentInput): MomentOrchestratorResult {
  const route = routeMoment(input);
  const style = input.supportStyle ?? "calm_reflective";
  const reflection = input.momentText?.trim() ? `You're carrying a lot right now: ${input.momentText.trim().slice(0, 140)}.` : "You're carrying a lot right now, and naming it is a solid first step.";
  const emotionalPrimary = new Set(["grief_support_brain", "emotional_presence_brain", "loneliness_support_brain", "overwhelm_grounding_brain"]);
  const isEmotional = emotionalPrimary.has(route.primaryBrainId);
  const stylePacing = style === "gentle_grounding"
    ? "Let's move slowly: feel your feet on the floor, relax your jaw, and take one steady breath."
    : style === "structured_reset"
      ? "Let's keep this clear and light: one small category, one next action."
      : style === "action_forward"
        ? "We'll keep it direct and gentle: one tiny step now is enough."
        : "We can stay reflective and low-pressure while we sort this.";
  const blocks: OperationalBlock[] = [
    { type: "reflection", text: reflection },
    { type: "emotional_presence", text: stylePacing },
    isEmotional ? { type: "gentle_next_step", text: "If it helps, we can stay with this feeling, do light grounding, or reflect quietly." } : { type: "tiny_step", text: "Do a 2-minute setup step: open notes, name one next action, and begin." },
    isEmotional ? { type: "gentle_next_step", text: "If it helps, we can stay with this feeling, do light grounding, or reflect on who/what you're missing." } : { type: "route_transition", text: `Continue with ${route.routeLabel}.` },
    routeBlock[route.primaryBrainId] ?? { type: "grounding", text: "Take one slow breath, unclench your shoulders, and choose one tiny action." },
  ];

  return { route, response: { routeLabel: route.routeLabel, routePath: route.routePath, reflection, tinyNextStep: blocks[2].text, whyThisRoute: isEmotional ? "Emotional acknowledgment comes first before any structure." : "Routing confidence improved from your context and follow-up signals.", continueLabel: isEmotional ? "Continue with grief support" : `Continue with ${route.routeLabel}`, steps: [blocks[2].text], supportiveNote: isEmotional ? "You can move slowly here." : "Small consistent steps create progress.", followUpActions: [{ label: isEmotional ? "Grounding support" : `Open ${route.routeLabel}`, href: route.routePath }, { label: "Quiet reflection", href: "/check-in" }], blocks }, warnings: route.primaryBrainId === "safety_support_brain" ? ["High-severity safety signals detected."] : [] };
}
