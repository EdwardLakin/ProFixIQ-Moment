export const BRAIN_AUDIENCES = ["teen", "adult", "all"] as const;
export const AGE_RANGES = ["under_13", "13_15", "16_17", "18_plus"] as const;

export const BRAIN_CATEGORIES = ["school", "math", "social", "task", "emotion", "confidence", "work", "money", "relationship", "household", "life_admin", "decision", "safety", "grief", "loneliness", "overwhelm"] as const;

export const MOMENT_BRAIN_IDS = ["school_overwhelm_brain", "math_reset_brain", "social_boundary_brain", "task_start_brain", "emotional_reset_brain", "confidence_repair_brain", "work_stress_brain", "finance_clarity_brain", "relationship_reflection_brain", "household_overload_brain", "life_admin_brain", "decision_reset_brain", "safety_support_brain", "grief_support_brain", "emotional_presence_brain", "loneliness_support_brain", "overwhelm_grounding_brain"] as const;

export const ROUTE_LABELS = {
  school_overwhelm_brain: "School overwhelm",
  math_reset_brain: "Math reset",
  social_boundary_brain: "Social boundary",
  task_start_brain: "Task start",
  emotional_reset_brain: "Emotional reset",
  confidence_repair_brain: "Confidence repair",
  work_stress_brain: "Work stress",
  finance_clarity_brain: "Finance clarity",
  relationship_reflection_brain: "Relationship reflection",
  household_overload_brain: "Household overload",
  life_admin_brain: "Life admin",
  decision_reset_brain: "Decision reset",
  safety_support_brain: "Safety support",
  grief_support_brain: "Grief support",
  emotional_presence_brain: "Emotional presence",
  loneliness_support_brain: "Loneliness support",
  overwhelm_grounding_brain: "Overwhelm grounding",
} as const;

export const OPERATIONAL_BLOCK_TYPES = ["reflection", "tiny_step", "route_transition", "grounding", "boundary_prompt", "decision_frame", "money_clarity", "work_reset", "relationship_reflection", "school_reset", "confidence_repair", "life_admin_sort", "momentum_builder", "recovery_prompt", "next_step", "steps", "support", "emotional_presence", "gentle_next_step"] as const;
