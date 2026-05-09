import type { MomentBrainId, MomentCheckInResponse } from "@/features/ai/types";

const byBrain: Partial<Record<MomentBrainId, MomentCheckInResponse>> = {
  math_reset_helper: { reflection: "Math is feeling like static right now, not a skill issue.", tinyNextStep: "Circle one problem and label what part is confusing.", steps: ["Write what the problem is asking in your own words.", "Identify one known value or formula.", "Try only the first operation."], supportiveNote: "You only need one clear move to restart momentum.", followUpActions: [{ label: "Explain the math", href: "/math-reset?from=check-in" }, { label: "Break this down", href: "/stuck?from=check-in" }] },
  social_boundary_helper: { reflection: "You are carrying social pressure that is draining your focus.", tinyNextStep: "Pause replies for 10 minutes and choose one boundary line.", steps: ["Decide what is your responsibility vs not.", "Pick a short non-escalating response.", "Mute one thread while you reset."], supportiveNote: "Protecting your energy is a smart move.", followUpActions: [{ label: "Help me stay out of it", href: "/drama-pause?from=check-in" }] },
  stuck_decomposer: { reflection: "The task feels bigger than your current bandwidth.", tinyNextStep: "Set a five-minute timer and do the first visible action.", steps: ["Open the tab or notebook.", "Write one rough starter line.", "Stop after five minutes or continue if it feels easier."], supportiveNote: "Tiny starts are real progress.", followUpActions: [{ label: "I still feel stuck", href: "/stuck?from=check-in" }] },
  shutdown_recovery: { reflection: "Your system sounds overloaded and low on fuel.", tinyNextStep: "Drink water, stand up, and take three slow breaths.", steps: ["Reduce noise or visual clutter.", "Pick one single next action.", "Work for only three minutes."], supportiveNote: "Reset first, then effort.", followUpActions: [{ label: "Start a five-minute reset", href: "/check-in?from=check-in" }] },
  confidence_repair: { reflection: "This sounds like a confidence hit, not proof you can't do it.", tinyNextStep: "Write one thing you do understand.", steps: ["Name the fear in one sentence.", "Choose a tiny school restart task.", "Finish one small proof-of-progress."], supportiveNote: "You are rebuildable, one rep at a time.", followUpActions: [{ label: "Break this down", href: "/stuck?from=check-in" }] },
  emotion_reflector: { reflection: "You're carrying a lot, and it makes sense this feels heavy.", tinyNextStep: "Name the next 10-minute action only.", steps: ["Pick one task.", "Reduce scope.", "Begin before motivation shows up."], supportiveNote: "You're not behind; you're restarting.", followUpActions: [{ label: "Start a five-minute reset", href: "/stuck?from=check-in" }] },
  focus_reentry: { reflection: "", tinyNextStep: "", steps: [], supportiveNote: "", followUpActions: [] },
  task_simplifier: { reflection: "", tinyNextStep: "", steps: [], supportiveNote: "", followUpActions: [] },
  school_restart: { reflection: "", tinyNextStep: "", steps: [], supportiveNote: "", followUpActions: [] },
  parent_summary_generator: { reflection: "", tinyNextStep: "", steps: [], supportiveNote: "", followUpActions: [] },
  safety_classifier: { reflection: "", tinyNextStep: "", steps: [], supportiveNote: "", followUpActions: [] },
};

export function getMockResponse(brain: MomentBrainId): MomentCheckInResponse {
  return byBrain[brain] ?? byBrain.emotion_reflector ?? { reflection: "You checked in.", tinyNextStep: "Take one small step." };
}
