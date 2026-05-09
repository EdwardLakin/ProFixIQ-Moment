import { routeMoment } from "@/features/ai/router/routeMoment";
import type { RouteMomentInput } from "@/features/ai/router/types";

export type OrchestratorBlockType = "reflection" | "tiny_step" | "route_transition" | "grounding" | "boundary_prompt" | "decision_frame" | "money_clarity" | "work_reset" | "relationship_reflection";

export type MomentOrchestratorResult = {
  route: {
    primaryBrainId: string;
    supportingBrainIds: string[];
    routeLabel: string;
    routePath: string;
    category: string;
    confidence: number;
    reason: string;
  };
  response: {
    reflection: string;
    tinyNextStep: string;
    whyThisHelps: string;
    continueLabel: string;
    blocks: { type: OrchestratorBlockType; text: string }[];
  };
  warnings: string[];
};

export function runMomentOrchestrator(input: RouteMomentInput): MomentOrchestratorResult {
  const route = routeMoment(input);
  const reflection = input.momentText?.trim() ? `You're carrying a lot right now: ${input.momentText.trim().slice(0, 140)}.` : "You're carrying a lot right now, and naming it is a solid first step.";

  const blockByRoute: Record<string, { type: OrchestratorBlockType; text: string }> = {
    finance_clarity_brain: { type: "money_clarity", text: "List fixed bills, flexible spending, and one question to research before acting." },
    work_stress_brain: { type: "work_reset", text: "Pick one must-do, one can-wait, and one no for today." },
    relationship_reflection_brain: { type: "relationship_reflection", text: "Draft one boundary sentence and one calm ask." },
  };

  const blocks = [
    { type: "reflection" as const, text: reflection },
    { type: "tiny_step" as const, text: "Do a 2-minute setup step: open notes, name one next action, and begin." },
    { type: "route_transition" as const, text: `Continue with ${route.routeLabel}.` },
    blockByRoute[route.primaryBrainId] ?? { type: "grounding" as const, text: "Take one slow breath, unclench your shoulders, and choose one tiny action." },
  ];

  return {
    route,
    response: {
      reflection,
      tinyNextStep: blocks[1].text,
      whyThisHelps: "Small actions lower overwhelm and build momentum without forcing perfection.",
      continueLabel: `Continue with ${route.routeLabel}`,
      blocks,
    },
    warnings: route.primaryBrainId === "safety_support_brain" ? ["High-severity safety signals detected. Show support escalation language before productivity steps."] : [],
  };
}
