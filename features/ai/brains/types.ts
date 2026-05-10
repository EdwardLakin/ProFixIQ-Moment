import { AGE_RANGES, BRAIN_AUDIENCES, BRAIN_CATEGORIES, MOMENT_BRAIN_IDS } from "@/features/ai/contracts";

export type BrainAudience = (typeof BRAIN_AUDIENCES)[number];
export type AgeRange = (typeof AGE_RANGES)[number];

export type BrainCategory = (typeof BRAIN_CATEGORIES)[number];

export type MomentBrainId = (typeof MOMENT_BRAIN_IDS)[number];

export type MomentBrain = {
  id: MomentBrainId;
  label: string;
  audience: BrainAudience;
  allowedAgeRanges?: AgeRange[];
  disallowedSignals?: string[];
  category: BrainCategory;
  routePath: string;
  description: string;
  safetyBoundaries: string[];
  inputSignals: string[];
  systemPrompt: string;
  outputSchemaName: string;
};
