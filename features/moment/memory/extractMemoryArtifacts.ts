import type { ExtractMemoryArtifactsInput, MomentMemoryArtifacts } from "@/features/moment/memory/types";

const clean = (value: string, max = 180) => value.replace(/\s+/g, " ").trim().slice(0, max);

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

  const likelyDone = /(done|finished|completed|i did|i tried|i started)/i.test(input.userText);
  const tinyWin = likelyDone
    ? { source: "system_detected" as const, winNote: "User signaled a small action attempt; confirm in next check-in.", status: "recorded" as const }
    : null;

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
    tinyWin,
  };
}
