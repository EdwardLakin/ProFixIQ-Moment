import { systemPrompts } from "@/features/ai/prompts";
import type { MomentBrain, MomentBrainId } from "@/features/ai/types";

export const brainRegistry: Record<MomentBrainId, MomentBrain> = {
  emotion_reflector: { id: "emotion_reflector", label: "Emotion Reflector", description: "Names pressure and stabilizes the moment.", routePath: "/check-in", tags: ["emotion", "grounding"], systemPrompt: systemPrompts.emotion_reflector, outputSchemaName: "moment_response_v1" },
  stuck_decomposer: { id: "stuck_decomposer", label: "Stuck Decomposer", description: "Turns stuckness into tiny moves.", routePath: "/stuck", tags: ["start", "procrastination"], systemPrompt: systemPrompts.stuck_decomposer, outputSchemaName: "moment_response_v1" },
  math_reset_helper: { id: "math_reset_helper", label: "Math Reset", description: "De-stresses math confusion.", routePath: "/math-reset", tags: ["math", "homework"], systemPrompt: systemPrompts.math_reset_helper, outputSchemaName: "moment_response_v1" },
  social_boundary_helper: { id: "social_boundary_helper", label: "Drama Pause", description: "Creates boundary scripts for social stress.", routePath: "/drama-pause", tags: ["social", "boundaries"], systemPrompt: systemPrompts.social_boundary_helper, outputSchemaName: "moment_response_v1" },
  confidence_repair: { id: "confidence_repair", label: "Confidence Repair", description: "Repairs self-trust after shame spiral.", routePath: "/check-in", tags: ["confidence"], systemPrompt: systemPrompts.confidence_repair, outputSchemaName: "moment_response_v1" },
  focus_reentry: { id: "focus_reentry", label: "Focus Reentry", description: "Re-enters task flow with calm structure.", routePath: "/stuck", tags: ["focus"], systemPrompt: systemPrompts.focus_reentry, outputSchemaName: "moment_response_v1" },
  shutdown_recovery: { id: "shutdown_recovery", label: "Shutdown Recovery", description: "Supports frozen and shut-down moments.", routePath: "/check-in", tags: ["freeze"], systemPrompt: systemPrompts.shutdown_recovery, outputSchemaName: "moment_response_v1" },
  task_simplifier: { id: "task_simplifier", label: "Task Simplifier", description: "Removes complexity from next action.", routePath: "/stuck", tags: ["tasks"], systemPrompt: systemPrompts.task_simplifier, outputSchemaName: "moment_response_v1" },
  school_restart: { id: "school_restart", label: "School Restart", description: "Rebuilds momentum in school work.", routePath: "/stuck", tags: ["school"], systemPrompt: systemPrompts.school_restart, outputSchemaName: "moment_response_v1" },
  parent_summary_generator: { id: "parent_summary_generator", label: "Parent Summary", description: "Creates concise guardian updates.", routePath: "/parent", tags: ["guardian"], systemPrompt: systemPrompts.parent_summary_generator, outputSchemaName: "parent_summary_v1" },
  safety_classifier: { id: "safety_classifier", label: "Safety Classifier", description: "Flags high-risk content and returns safe fallback.", routePath: "/check-in", tags: ["safety"], systemPrompt: systemPrompts.safety_classifier, outputSchemaName: "safety_response_v1" },
};
