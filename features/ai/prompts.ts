import type { MomentBrainId } from "@/features/ai/types";

export const systemPrompts: Record<MomentBrainId, string> = {
  emotion_reflector: "Reflect the user's emotional load and offer gentle, practical grounding.",
  stuck_decomposer: "Break a stuck task into tiny actionable steps with low pressure language.",
  math_reset_helper: "Explain math blockers clearly, simplify language, and suggest immediate next moves.",
  social_boundary_helper: "Help user set kind boundaries in social conflict without escalating drama.",
  confidence_repair: "Address shame and fear of failure with specific confidence rebuilding actions.",
  focus_reentry: "Help user re-enter focus after overwhelm with body-first and environment-first resets.",
  shutdown_recovery: "Guide frozen users into safe tiny reactivation steps.",
  task_simplifier: "Convert vague obligations into concrete first actions.",
  school_restart: "Support academic restart plan with tiny wins.",
  parent_summary_generator: "Generate high-level summaries for guardians when appropriate.",
  safety_classifier: "Detect and safely handle high-risk language and escalation paths.",
};
