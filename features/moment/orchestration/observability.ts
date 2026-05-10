export type OrchestrationTrace = {
  routedBrain: string;
  supportStyle: string;
  pacingProfile: string;
  clarificationUsed: boolean;
  responseDepth: string;
  continuationPath: "continue" | "pause" | "start_fresh";
  supportFatigueReduction: boolean;
  fallbackPath: "none" | "orchestrator_failure" | "memory_failure" | "routing_low_confidence" | "unknown_state";
  confidence: "low" | "medium" | "high";
  qualityFlags: string[];
};

export function summarizeTrace(trace: OrchestrationTrace) {
  return `${trace.routedBrain} · ${trace.pacingProfile} · ${trace.responseDepth} · ${trace.fallbackPath}`;
}

export function deriveSupportQualityFlags(input: { steps: string[]; reflection: string; tinyNextStep: string; confidence: string; reducePrompting: boolean }) {
  const flags: string[] = [];
  const loweredReflection = input.reflection.toLowerCase();
  if (/(just breathe|just breathe|one breath)/.test(loweredReflection) && input.steps.length > 1) flags.push("repetitive_phrasing");
  if (input.steps.length >= 4) flags.push("action_density_high");
  if (input.steps.join(" ").split("?").length > 3) flags.push("overprompting_risk");
  if (input.confidence === "low") flags.push("emotional_mismatch_risk");
  if (input.reducePrompting) flags.push("support_fatigue_protection");
  if (input.tinyNextStep.length < 16 && input.steps.length > 2) flags.push("abrupt_pacing_risk");
  return flags;
}

export function buildTrustSignal(index = 0) {
  const signals = [
    "You can start fresh anytime.",
    "Nothing here has to be solved immediately.",
    "Private by default.",
    "You don’t need the perfect words.",
  ];
  return signals[index % signals.length];
}
