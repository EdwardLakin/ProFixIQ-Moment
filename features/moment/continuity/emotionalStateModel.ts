import type { EmotionalCognition } from "@/features/ai/orchestration/emotionalCognitionEngine";
import type { RouteMomentInput } from "@/features/ai/router/types";
import type { MomentMemorySnapshot } from "@/features/moment/memory/types";

export type SupportPreference = "presence" | "reflection" | "encouragement" | "practical_help" | "silence_pacing";

export type EmotionalStateModel = {
  dominantThemes: string[];
  unresolvedThemes: string[];
  emotionalIntensityTrend: "rising" | "stable" | "easing";
  emotionalFatigueScore: number;
  lonelinessRecurrence: number;
  griefRecurrence: number;
  shameRecurrence: number;
  avoidanceCycleRisk: "low" | "watch" | "high";
  supportReceptiveness: "low" | "mixed" | "high";
  relationalTrustLevel: "fragile" | "building" | "steady";
  emotionalFragility: "low" | "guarded" | "fragile" | "raw";
  overwhelmBuildUp: "low" | "watch" | "high";
  opennessState: "open" | "guarded" | "withdrawn";
  helpfulSupportStyles: string[];
  unhelpfulSupportStyles: string[];
  supportPreference: SupportPreference;
  narrativeArc: string;
  continuityPrompt: string | null;
};

function countMatches(items: string[], regex: RegExp) {
  return items.filter((item) => regex.test(item.toLowerCase())).length;
}

export function buildEmotionalStateModel(input: {
  routeInput: RouteMomentInput;
  memorySnapshot: MomentMemorySnapshot;
  cognition: EmotionalCognition;
}): EmotionalStateModel {
  const entryText = input.memorySnapshot.entries.map((entry) => `${entry.inputSummary} ${entry.emotionalState ?? ""}`);
  const joined = entryText.join(" ").toLowerCase();
  const themes = new Set<string>(input.cognition.themes);
  if (/(grief|loss|miss|passed away)/.test(joined)) themes.add("grief");
  if (/(alone|lonely|isolat|disconnected)/.test(joined)) themes.add("loneliness");
  if (/(shame|ashamed|embarrass|humiliat)/.test(joined)) themes.add("shame");
  if (/(overwhelm|shutdown|flooded|spiral|too much)/.test(joined)) themes.add("overwhelm");

  const notes = input.memorySnapshot.supportEffectivenessNotes.map((note) => note.outcomeNote);
  const helpful = input.memorySnapshot.supportEffectivenessNotes.filter((note) => /helped|better|easier|calmer|worked/i.test(note.outcomeNote)).map((note) => note.supportStyle);
  const unhelpful = input.memorySnapshot.supportEffectivenessNotes.filter((note) => /too much|not helpful|detached|clinical|overwhelm/i.test(note.outcomeNote)).map((note) => note.supportStyle);
  const highLoad = countMatches(entryText, /(grief|alone|hopeless|exhaust|overwhelm|shame)/i);
  const recentLoad = countMatches(entryText.slice(0, 3), /(grief|alone|hopeless|exhaust|overwhelm|shame)/i);
  const intensityTrend = recentLoad > Math.max(1, Math.floor(highLoad / 2)) ? "rising" : recentLoad === 0 ? "easing" : "stable";

  const opennessState = /(whatever|fine|doesn.t matter|i guess)/i.test(input.routeInput.momentText)
    ? "withdrawn"
    : input.cognition.maskingSignals.length > 0 ? "guarded" : "open";

  const supportReceptiveness = helpful.length > unhelpful.length ? "high" : helpful.length === unhelpful.length ? "mixed" : "low";
  const trustLevel = input.memorySnapshot.entries.length >= 5 ? (opennessState === "withdrawn" ? "building" : "steady") : "fragile";
  const preference: SupportPreference = /(what should i do|plan|steps|practical)/i.test(input.routeInput.momentText)
    ? "practical_help"
    : input.cognition.connectionBids.length > 0
      ? "presence"
      : input.cognition.exhaustionLevel === "high"
        ? "silence_pacing"
        : input.cognition.themes.includes("self_criticism")
          ? "encouragement"
          : "reflection";

  return {
    dominantThemes: Array.from(themes).slice(0, 5),
    unresolvedThemes: Array.from(themes).filter((theme) => theme !== "avoidance").slice(0, 4),
    emotionalIntensityTrend: intensityTrend,
    emotionalFatigueScore: Math.min(100, highLoad * 14 + (input.cognition.exhaustionLevel === "high" ? 20 : 6)),
    lonelinessRecurrence: countMatches(entryText, /(alone|lonely|isolat|disconnected)/i),
    griefRecurrence: countMatches(entryText, /(grief|loss|miss|passed away)/i),
    shameRecurrence: countMatches(entryText, /(shame|ashamed|embarrass|humiliat|i.m the problem)/i),
    avoidanceCycleRisk: input.cognition.themes.includes("avoidance") && input.cognition.contradictions.includes("wants_progress_but_avoids") ? "high" : input.cognition.themes.includes("avoidance") ? "watch" : "low",
    supportReceptiveness,
    relationalTrustLevel: trustLevel,
    emotionalFragility: input.cognition.fragilityLevel,
    overwhelmBuildUp: input.cognition.exhaustionLevel === "high" || highLoad >= 4 ? "high" : highLoad >= 2 ? "watch" : "low",
    opennessState,
    helpfulSupportStyles: [...new Set(helpful)].slice(0, 3),
    unhelpfulSupportStyles: [...new Set(unhelpful)].slice(0, 3),
    supportPreference: preference,
    narrativeArc: intensityTrend === "rising"
      ? "Pain themes are resurfacing more frequently; prioritize steadier emotional pacing."
      : intensityTrend === "easing"
        ? "Emotional load appears to be softening in recent check-ins."
        : "Core emotional themes remain active with partial stabilization.",
    continuityPrompt: notes.length > 0 ? "I remember this has been heavy in waves; we can pick up gently from where you left off." : null,
  };
}
