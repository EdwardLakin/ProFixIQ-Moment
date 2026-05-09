export type BrainAudience = "teen" | "adult" | "all";
export type AgeRange = "under_13" | "13_15" | "16_17" | "18_plus";

export type BrainCategory = "school" | "math" | "social" | "task" | "emotion" | "confidence" | "work" | "money" | "relationship" | "household" | "life_admin" | "decision" | "safety" | "grief" | "loneliness" | "overwhelm";

export type MomentBrainId = "school_overwhelm_brain" | "math_reset_brain" | "social_boundary_brain" | "task_start_brain" | "emotional_reset_brain" | "confidence_repair_brain" | "work_stress_brain" | "finance_clarity_brain" | "relationship_reflection_brain" | "household_overload_brain" | "life_admin_brain" | "decision_reset_brain" | "safety_support_brain" | "grief_support_brain" | "emotional_presence_brain" | "loneliness_support_brain" | "overwhelm_grounding_brain";

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
