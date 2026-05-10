import type { MomentTool } from "@/features/moment/tools/contracts";

const teen = ["under_13", "13_15", "16_17"] as const;
const allAges = ["under_13", "13_15", "16_17", "18_plus"] as const;
const adult = ["18_plus"] as const;

export const momentToolRegistry: MomentTool[] = [
  { id: "explain_another_way", label: "Want to try this a different way?", description: "Reframe the same concept without pressure.", supportedBrainIds: ["tutor_brain", "school_overwhelm_brain"], supportedAgeRanges: [...allAges], triggerSignals: ["don't understand", "confused"], contraindications: ["severe_safety"], outputMode: "inline_prompt" },
  { id: "first_problem_together", label: "Want to start with one example?", description: "Guide the first question or first sentence.", supportedBrainIds: ["tutor_brain", "task_start_brain"], supportedAgeRanges: [...allAges], triggerSignals: ["freeze", "can't start"], contraindications: ["severe_safety"], outputMode: "micro_steps" },
  { id: "shrink_assignment", label: "Want to shrink this into one tiny start?", description: "Turn assignment load into one small action.", supportedBrainIds: ["tutor_brain", "school_overwhelm_brain"], supportedAgeRanges: [...allAges], triggerSignals: ["assignment", "too much"], contraindications: ["grief_heavy"], outputMode: "micro_steps" },
  { id: "study_plan_micro", label: "Want a low-pressure study path?", description: "Create a short, calm study sequence.", supportedBrainIds: ["tutor_brain"], supportedAgeRanges: [...allAges], triggerSignals: ["test prep", "study"], contraindications: ["grief_heavy"], outputMode: "micro_steps" },
  { id: "stuck_point_finder", label: "Want help finding the exact stuck point?", description: "Identify where understanding breaks.", supportedBrainIds: ["tutor_brain", "school_overwhelm_brain"], supportedAgeRanges: [...allAges], triggerSignals: ["stuck", "not sure where"], contraindications: [], outputMode: "inline_prompt" },
  { id: "pressure_sort", label: "Want help sorting the pressure?", description: "Sort urgent vs can wait.", supportedBrainIds: ["finance_clarity_brain", "life_admin_brain", "work_stress_brain"], supportedAgeRanges: [...adult], triggerSignals: ["too many", "pressure"], contraindications: ["grief_heavy", "exhaustion_heavy"], outputMode: "micro_steps" },
  { id: "workload_triage", label: "Want to triage today's workload?", description: "Choose one work move.", supportedBrainIds: ["work_stress_brain"], supportedAgeRanges: [...adult], triggerSignals: ["burnout", "deadline"], contraindications: ["grief_heavy"], outputMode: "micro_steps" },
  { id: "communication_prep", label: "Want a sentence you can use?", description: "Draft one calm message.", supportedBrainIds: ["relationship_reflection_brain", "social_boundary_brain"], supportedAgeRanges: [...allAges], triggerSignals: ["say", "text"], contraindications: ["high_conflict_escalation"], outputMode: "sentence_starter" },
  { id: "friend_boundary_sentence", label: "Want a sentence you can use?", description: "Teen-safe friend boundary sentence.", supportedBrainIds: ["social_boundary_brain"], supportedAgeRanges: [...teen], triggerSignals: ["friend", "group chat"], contraindications: ["high_conflict_escalation"], outputMode: "sentence_starter" },
  { id: "calm_before_homework", label: "Want to calm first before homework?", description: "Ground before school tasks.", supportedBrainIds: ["school_overwhelm_brain", "tutor_brain"], supportedAgeRanges: [...teen], triggerSignals: ["homework", "panic"], contraindications: [], outputMode: "presence" }
];
