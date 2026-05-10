import type { AgeRange, MomentBrainId } from "@/features/ai/brains/types";

export const MOMENT_TOOL_IDS = [
  "pressure_sort","break_into_one_next_step","prepare_what_to_say","explain_another_way","decide_what_can_wait","calm_before_starting","simplify_first_move",
  "first_problem_together","shrink_assignment","study_plan_micro","stuck_point_finder",
  "must_pay_can_wait","small_cut_finder","one_account_at_a_time",
  "workload_triage","boundary_prep","meeting_decompression","restart_after_shutdown",
  "communication_prep","boundary_sentence","feelings_sort","repair_or_pause",
  "mental_load_sort","one_category_start","what_can_wait","reduce_decision_pressure",
  "two_option_clarity","tradeoff_sort","next_right_step","sleep_on_it_check",
  "friend_boundary_sentence","calm_before_homework","tiny_start_step"
] as const;

export type MomentToolId = (typeof MOMENT_TOOL_IDS)[number];
export type ToolOutputMode = "inline_prompt" | "micro_steps" | "sentence_starter" | "presence";
export type EmotionalLoad = "light" | "medium" | "heavy" | "grief" | "lonely" | "exhausted";

export type MomentTool = {
  id: MomentToolId;
  label: string;
  description: string;
  supportedBrainIds: MomentBrainId[];
  supportedAgeRanges: AgeRange[];
  triggerSignals: string[];
  contraindications: string[];
  outputMode: ToolOutputMode;
};
