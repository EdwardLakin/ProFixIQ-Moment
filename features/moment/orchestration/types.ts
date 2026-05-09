import type { MomentRouteResult } from "@/features/ai/types";

export type ResponseBlockType = "reflection" | "tiny_next_step" | "decomposed_steps" | "emotional_friction" | "momentum_builder" | "route_transition" | "recovery_prompt";

export type OperationalResponseBlock = {
  id: string;
  type: ResponseBlockType;
  title: string;
  body: string;
  items?: string[];
};

export type ActiveRouteContext = {
  contextId: string;
  from: string;
  to: string;
  carriedSummary?: string;
  previousTinyStep?: string;
};

export type OperationalState = {
  route: MomentRouteResult;
  activeContext: ActiveRouteContext;
  quickActions: { label: string; href: string }[];
};

export type OrchestrationPipelineInput = {
  reflection: string;
  tinyNextStep: string;
  steps: string[];
  supportiveNote: string;
};

export type NormalizedResponse = {
  blocks: OperationalResponseBlock[];
};
