import type { MomentBrainId } from "@/features/ai/types";
import type { MomentEnvironmentState } from "@/features/moment/context/types";
import type { NormalizedResponse, OperationalResponseBlock, OrchestrationPipelineInput } from "@/features/moment/orchestration/types";

export function normalizeResponse(input: OrchestrationPipelineInput): NormalizedResponse {
  const blocks: OperationalResponseBlock[] = [
    { id: "reflection", type: "reflection", title: "What this moment sounds like", body: input.reflection },
    { id: "tiny", type: "tiny_next_step", title: "Start here", body: input.tinyNextStep },
    { id: "steps", type: "decomposed_steps", title: "Keep it small", body: "Use only as needed.", items: input.steps.slice(0, 3) },
    { id: "friction", type: "emotional_friction", title: "Friction check", body: input.supportiveNote },
  ];
  return { blocks };
}

export function getAdaptiveQuickActions(brain: MomentBrainId, environment: MomentEnvironmentState) {
  if (brain === "math_reset_brain") return [{ label: "Try a smaller problem", href: "/math-reset" }, { label: "Explain this differently", href: "/stuck" }];
  if (brain === "social_boundary_brain") return [{ label: "Stay out of the middle", href: "/drama-pause" }, { label: "Send a boundary reply", href: "/drama-pause" }];
  if (environment.recentEmotionalState === "shutdown") return [{ label: "Do a two-minute restart", href: "/check-in" }, { label: "Lower the pressure", href: "/stuck" }];
  return [{ label: "Take one tiny step", href: "/stuck" }, { label: "Calm reset", href: "/check-in" }];
}
