import { routeMoment } from "@/features/ai/router/routeMoment";
import type { RouteMomentInput } from "@/features/ai/router/types";
import type { MomentRouteResult, OperationalBlock } from "@/features/ai/types";

export type MomentOrchestratorResult = {
  route: MomentRouteResult;
  response: {
    reflection: string;
    tinyNextStep: string;
    whyThisHelps: string;
    continueLabel: string;
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
};

export function runMomentOrchestrator(input: RouteMomentInput): MomentOrchestratorResult {
  const route = routeMoment(input);
  const reflection = input.momentText?.trim() ? `You're carrying a lot right now: ${input.momentText.trim().slice(0, 140)}.` : "You're carrying a lot right now, and naming it is a solid first step.";
  const blocks: OperationalBlock[] = [
    { type: "reflection", text: reflection },
    { type: "tiny_step", text: "Do a 2-minute setup step: open notes, name one next action, and begin." },
    { type: "route_transition", text: `Continue with ${route.routeLabel}.` },
    routeBlock[route.primaryBrainId] ?? { type: "grounding", text: "Take one slow breath, unclench your shoulders, and choose one tiny action." },
  ];

  return { route, response: { reflection, tinyNextStep: blocks[1].text, whyThisHelps: "Small actions lower overwhelm and build momentum.", continueLabel: `Continue with ${route.routeLabel}`, blocks }, warnings: route.primaryBrainId === "safety_support_brain" ? ["High-severity safety signals detected."] : [] };
}
