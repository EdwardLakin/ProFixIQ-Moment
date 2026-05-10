import type { ExtractMemoryArtifactsInput, MomentMemoryArtifacts } from "@/features/moment/memory/types";

const clean = (value: string, max = 180) => value.replace(/\s+/g, " ").trim().slice(0, max);

const goalTemplates: Record<string, { title: string; detail: string }> = {
  work_stress_brain: { title: "Handle work stress more calmly", detail: "Practice calmer restarts during high-pressure work moments." },
  finance_clarity_brain: { title: "Feel less overwhelmed by bills", detail: "Use small bill-clarity steps instead of carrying every money task at once." },
  social_boundary_brain: { title: "Stop getting pulled into friend drama", detail: "Pause before replying and choose one boundary sentence." },
  school_overwhelm_brain: { title: "Start homework with less shutdown", detail: "Use tiny setup starts when school pressure spikes." },
  task_start_brain: { title: "Build better routines", detail: "Begin with low-pressure setup actions on hard days." },
};

export function extractMemoryArtifacts(input: ExtractMemoryArtifactsInput): MomentMemoryArtifacts {
  const genericSafety = "safety_support summary recorded";
  const highRisk = input.riskSeverity === "high" || input.route.primaryBrainId === "safety_support_brain";
  const inputSummary = highRisk ? genericSafety : clean(input.userText, 150);
  const responseSummary = highRisk ? genericSafety : clean(input.response.reflection, 170);
  const tinyNextStep = highRisk ? "contact a trusted adult now" : clean(input.response.tinyNextStep, 120);

  const suggestions = [input.response.tinyNextStep, ...(input.response.steps ?? []), ...(input.response.blocks ?? []).map((b) => b.text)]
    .map((text) => clean(text, 140))
    .filter((text, idx, arr) => text.length > 5 && arr.indexOf(text) === idx)
    .slice(0, 3)
    .map((suggestionText) => ({ source: "ai_suggested" as const, suggestionText, status: "suggested" as const }));

  const likelyDone = /(done|finished|completed|i did|i tried|i started|came back|asked for help|paused)/i.test(input.userText);
  const tinyWin = likelyDone
    ? { source: "system_detected" as const, winNote: "Started even though it felt hard, or came back after friction.", status: "recorded" as const }
    : null;

  const goalTemplate = goalTemplates[input.route.primaryBrainId];
  const goalSuggestions = goalTemplate ? [{ source: "ai_suggested" as const, title: goalTemplate.title, detail: goalTemplate.detail, status: "active" as const }] : [];

  return {
    entry: {
      source: "system_detected",
      inputSummary,
      emotionalState: input.selectedStates[0] ?? null,
      supportStyle: input.supportStyle ?? null,
      primaryBrainId: input.route.primaryBrainId,
      supportingBrainIds: input.route.supportingBrainIds,
      routeLabel: input.route.routeLabel,
      routeCategory: input.route.category,
      routeAudience: input.route.audience,
      responseSummary,
      tinyNextStep,
    },
    suggestions,
    goalSuggestions,
    tinyWin,
    supportEffectiveness: {
      supportStyle: input.supportStyle ?? "calm_reflective",
      acceptedSuggestion: false,
      returnedToThread: true,
      tinyStepCompleted: likelyDone,
      continuationEngaged: true,
      outcomeNote: likelyDone ? "User signaled a gentle completion cue." : "Continuation engagement observed; keep support low-pressure.",
    },
  };
}
