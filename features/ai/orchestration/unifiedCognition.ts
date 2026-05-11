import type { RouteMomentInput } from "@/features/ai/router/types";
import type { EmotionalCognition } from "@/features/ai/orchestration/emotionalCognitionEngine";
import type { MomentBrainId } from "@/features/ai/brains/types";

export type CapabilityId =
  | "tutor"
  | "griefPresence"
  | "emotionalPresence"
  | "shameReduction"
  | "taskDecomposition"
  | "conflictRegulation"
  | "grounding"
  | "practicalGuidance"
  | "memoryRecall";

export type CapabilityMap = Record<CapabilityId, number>;

export type UnifiedCognitionTrace = {
  capabilityWeights: CapabilityMap;
  memoryRelevance: {
    score: number;
    applied: boolean;
    suppressionReason?: "domain_mismatch" | "low_similarity";
  };
  dominantCapability: CapabilityId;
};

const BASE_WEIGHTS: CapabilityMap = {
  tutor: 0,
  griefPresence: 0,
  emotionalPresence: 0.15,
  shameReduction: 0,
  taskDecomposition: 0,
  conflictRegulation: 0,
  grounding: 0,
  practicalGuidance: 0,
  memoryRecall: 0,
};

const containsAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function normalizeWeights(weights: CapabilityMap): CapabilityMap {
  const max = Math.max(...Object.values(weights), 1);
  const normalized = {} as CapabilityMap;
  (Object.keys(weights) as CapabilityId[]).forEach((key) => {
    normalized[key] = Math.round((weights[key] / max) * 100) / 100;
  });
  return normalized;
}

export function computeMemoryRelevance(input: RouteMomentInput, continuitySummary?: string | null): UnifiedCognitionTrace["memoryRelevance"] {
  if (!continuitySummary) return { score: 0, applied: false, suppressionReason: "low_similarity" };
  const domainText = `${input.momentText} ${input.selectedSignals.join(" ")}`.toLowerCase();
  const griefTerms = ["grief", "loss", "died", "death", "miss", "mother", "mom"];
  const tutorTerms = ["math", "homework", "study", "class", "essay", "quiz", "science"];
  const continuityLooksGrief = containsAny(continuitySummary.toLowerCase(), griefTerms);
  const inputLooksTutor = containsAny(domainText, tutorTerms);
  const inputLooksGrief = containsAny(domainText, griefTerms);

  if (continuityLooksGrief && inputLooksTutor && !inputLooksGrief) {
    return { score: 0.05, applied: false, suppressionReason: "domain_mismatch" };
  }

  const sharedTokenCount = continuitySummary.toLowerCase().split(/\W+/).filter((token) => token.length > 3 && domainText.includes(token)).length;
  const score = clamp01(sharedTokenCount / 8);
  return { score, applied: score >= 0.22, suppressionReason: score >= 0.22 ? undefined : "low_similarity" };
}

export function buildUnifiedCognition(input: RouteMomentInput, cognition: EmotionalCognition, continuitySummary?: string | null, primaryBrainId?: MomentBrainId): UnifiedCognitionTrace {
  const text = `${input.momentText} ${input.selectedSignals.join(" ")} ${(input.knownSupportNeeds ?? []).join(" ")}`.toLowerCase();
  const weights: CapabilityMap = { ...BASE_WEIGHTS };

  if (containsAny(text, ["math", "homework", "study", "class", "science", "essay", "problem", "quiz"]) || primaryBrainId === "tutor_brain") {
    weights.tutor += 0.8;
    weights.taskDecomposition += 0.65;
    weights.practicalGuidance += 0.4;
  }

  if (containsAny(text, ["grief", "loss", "died", "death", "mother's day", "mothers day", "miss her", "miss him"]) || primaryBrainId === "grief_support_brain") {
    weights.griefPresence += 0.95;
    weights.emotionalPresence += 0.7;
  }

  if (containsAny(text, ["stupid", "ashamed", "embarrassed", "i'm behind", "im behind"])) {
    weights.shameReduction += 0.55;
    weights.emotionalPresence += 0.2;
  }

  if (containsAny(text, ["friend", "conflict", "boundary", "group chat", "text them", "argument"]) || primaryBrainId === "social_boundary_brain") {
    weights.conflictRegulation += 0.85;
    weights.practicalGuidance += 0.35;
  }

  if (containsAny(text, ["overwhelmed", "spiral", "shutdown", "can't breathe", "panic"])) {
    weights.grounding += 0.7;
    weights.emotionalPresence += 0.25;
  }

  const memoryRelevance = computeMemoryRelevance(input, continuitySummary);
  weights.memoryRecall = memoryRelevance.applied ? memoryRelevance.score : 0;

  const capabilityWeights = normalizeWeights(weights);
  const dominantCapability = (Object.entries(capabilityWeights).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "emotionalPresence") as CapabilityId;
  return { capabilityWeights, memoryRelevance, dominantCapability };
}
