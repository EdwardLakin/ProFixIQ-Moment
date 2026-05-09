export type MomentBrainId =
  | "emotion_reflector"
  | "stuck_decomposer"
  | "math_reset_helper"
  | "social_boundary_helper"
  | "confidence_repair"
  | "focus_reentry"
  | "shutdown_recovery"
  | "task_simplifier"
  | "school_restart"
  | "parent_summary_generator"
  | "safety_classifier";

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
  primaryBrain: MomentBrainId;
  supportingBrains: MomentBrainId[];
  routePath: string;
  reason: string;
  confidence: MomentRouteConfidence;
};

export type MomentCheckInResponse = {
  reflection: string;
  tinyNextStep: string;
  steps: string[];
  supportiveNote: string;
  followUpActions: { label: string; href: string }[];
};
