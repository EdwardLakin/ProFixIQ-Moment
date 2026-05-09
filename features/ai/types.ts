import type { BrainAudience, BrainCategory } from "@/features/ai/brains/types";

export type MomentBrainId =
  | "school_overwhelm_brain" | "math_reset_brain" | "social_boundary_brain" | "task_start_brain" | "emotional_reset_brain" | "confidence_repair_brain" | "work_stress_brain" | "finance_clarity_brain" | "relationship_reflection_brain" | "household_overload_brain" | "life_admin_brain" | "decision_reset_brain" | "safety_support_brain"
  | "emotion_reflector" | "stuck_decomposer" | "math_reset_helper" | "social_boundary_helper" | "confidence_repair" | "focus_reentry" | "shutdown_recovery" | "task_simplifier" | "school_restart" | "parent_summary_generator" | "safety_classifier";

export type MomentRouteResult = { primaryBrainId: MomentBrainId; supportingBrainIds: MomentBrainId[]; primaryBrain?: MomentBrainId; supportingBrains?: MomentBrainId[]; routeLabel: string; routePath: string; reason: string; confidence: number | "low" | "medium" | "high"; audience: BrainAudience | "all"; category: BrainCategory | "emotion" };

export type OperationalBlockType = "reflection" | "tiny_step" | "route_transition" | "grounding" | "boundary_prompt" | "decision_frame" | "money_clarity" | "work_reset" | "relationship_reflection" | "next_step" | "steps" | "support" | "momentum_builder" | "recovery_prompt";
export type OperationalBlock = { type: OperationalBlockType; text: string; items?: string[] };

export type MomentCheckInResponse = { reflection: string; tinyNextStep: string; whyThisHelps?: string; continueLabel?: string; blocks?: OperationalBlock[]; steps?: string[]; supportiveNote?: string; followUpActions?: { label: string; href: string }[] };
