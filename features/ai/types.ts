import { OPERATIONAL_BLOCK_TYPES } from "@/features/ai/contracts";
import type { BrainAudience, BrainCategory, MomentBrainId } from "@/features/ai/brains/types";
export type { MomentBrainId } from "@/features/ai/brains/types";

export type MomentRouteConfidence = "low" | "medium" | "high";

export type MomentBrain = {
  id: MomentBrainId;
  label: string;
  description: string;
  routePath: string;
  tags: string[];
  systemPrompt: string;
  outputSchemaName: string;
};

export type MomentRouteResult = {
  primaryBrainId: MomentBrainId;
  supportingBrainIds: MomentBrainId[];
  primaryBrain?: MomentBrainId;
  supportingBrains?: MomentBrainId[];
  routeLabel: string;
  routePath: string;
  reason: string;
  confidence: MomentRouteConfidence;
  audience: BrainAudience;
  category: BrainCategory;
};

export type OperationalBlockType = (typeof OPERATIONAL_BLOCK_TYPES)[number];
export type OperationalBlock = { type: OperationalBlockType; text: string; items?: string[] };

export type MomentCheckInResponse = {
  routeLabel: string;
  routePath: string;
  reflection: string;
  tinyNextStep: string;
  whyThisRoute: string;
  continueLabel: string;
  steps: string[];
  supportiveNote: string;
  followUpActions: { label: string; href: string }[];
  blocks?: OperationalBlock[];
};

export type OrchestrationBrainContribution = { brainId: MomentBrainId; blocks: OperationalBlock[] };
export type MultiBrainMergeEnvelope = { primary: MomentBrainId; supporting: MomentBrainId[]; contributions: OrchestrationBrainContribution[] };
