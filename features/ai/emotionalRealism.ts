import type { MomentBrainId, MomentCheckInResponse } from "@/features/ai/types";

type RealismScorecard = {
  emotionalSpecificity: number;
  conversationalRealism: number;
  pacingRealism: number;
  warmthAuthenticity: number;
  repetitionRisk: number;
  abstractionDensity: number;
  emotionalGrounding: number;
  timingAppropriateness: number;
};

const CLICHE_PATTERNS = [
  "that sounds really hard",
  "you are not alone",
  "one step at a time",
  "low pressure",
  "gentle reminder",
  "hold space",
  "i hear a lot of",
  "you've got this",
  "small steps",
  "one short step is plenty",
];

const THERAPY_APP_PATTERNS = [
  "nervous system",
  "support pace",
  "regulation",
  "micro-step",
  "gentle next step",
  "optional feedback",
  "take a slower breath",
  "one short step",
  "if it helps",
];

const MOTIVATIONAL_PATTERNS = ["you can do this", "momentum", "optimize", "productivity", "perform", "reset then effort"];

const GRIEF_MARKERS = [
  "died", "passed away", "loss", "miss", "anniversary", "birthday", "mother's day", "fathers day", "father's day", "holiday", "without",
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function countMatches(text: string, patterns: string[]): number {
  const normalized = normalize(text);
  return patterns.reduce((count, token) => count + (normalized.includes(token) ? 1 : 0), 0);
}

function uniqueSentences(text: string): string {
  const parts = text.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const part of parts) {
    const key = normalize(part);
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(part);
  }
  return kept.join(" ");
}

function softenOverGuidance(text: string): string {
  return text
    .replace(/\b(you should|you need to|do this now)\b/gi, "you could")
    .replace(/\b(first,|second,|third,)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function expandPresenceReflection(reflection: string, userText: string, isGrief: boolean): string {
  const cleaned = reflection.trim();
  if (!cleaned) return reflection;
  const specificFragment = userText.split(/[.!?]/).map((s) => s.trim()).filter((s) => s.length > 24)[0];
  const presenceTail = isGrief
    ? "You don't have to be okay for this moment, and you don't have to make it smaller than it is."
    : "You don't need to rush past this feeling or package it neatly right now.";
  if (!specificFragment) return `${cleaned} ${presenceTail}`;
  return `${cleaned} What stands out is this part: "${specificFragment.slice(0, 160)}." ${presenceTail}`;
}

export function buildRealismScorecard(response: MomentCheckInResponse): RealismScorecard {
  const combined = [response.reflection, response.tinyNextStep, response.supportiveNote, ...response.steps].join(" ");
  const cliches = countMatches(combined, CLICHE_PATTERNS);
  const therapy = countMatches(combined, THERAPY_APP_PATTERNS);
  const motivational = countMatches(combined, MOTIVATIONAL_PATTERNS);
  const abstractTerms = countMatches(combined, ["load", "process", "pattern", "framework", "support", "regulate"]);
  const sentenceCount = combined.split(/[.!?]/).filter(Boolean).length || 1;

  return {
    emotionalSpecificity: Math.max(0, 1 - abstractTerms / 6),
    conversationalRealism: Math.max(0, 1 - (therapy + motivational) / 6),
    pacingRealism: Math.max(0, 1 - Math.max(0, response.steps.length - 2) / 3),
    warmthAuthenticity: Math.max(0, 1 - cliches / 5),
    repetitionRisk: Math.min(1, (cliches + therapy) / 8),
    abstractionDensity: Math.min(1, abstractTerms / sentenceCount),
    emotionalGrounding: Math.max(0, 1 - motivational / 4),
    timingAppropriateness: Math.max(0, 1 - (response.steps.length > 0 && (therapy + motivational) > 0 ? 0.4 : 0)),
  };
}

export function applyEmotionalRealismLayer(response: MomentCheckInResponse, primaryBrain: MomentBrainId, userText: string): MomentCheckInResponse {
  const isGrief = primaryBrain === "grief_support_brain" || countMatches(userText, GRIEF_MARKERS) > 0;

  const cleanedReflection = softenOverGuidance(uniqueSentences(response.reflection))
    .replace(/that sounds really hard/gi, "That hurts in a very real way")
    .replace(/i hear a lot of[^.]*\.?/gi, "");

  const cleanedNote = softenOverGuidance(uniqueSentences(response.supportiveNote))
    .replace(/you are not alone/gi, "You don't have to force this feeling away right now");

  let steps = response.steps
    .map((step) => softenOverGuidance(step))
    .filter((step) => countMatches(step, CLICHE_PATTERNS) === 0 && countMatches(step, THERAPY_APP_PATTERNS) === 0)
    .slice(0, isGrief ? 1 : 3);

  if (isGrief && steps.length === 0) {
    steps = ["If you want, you can share one thing you miss about them today."];
  }

  const tinyNextStep = isGrief
    ? "We can stay here for a moment. If you want, tell me what feels sharpest right now."
    : softenOverGuidance(response.tinyNextStep).replace(/one step at a time/gi, "at your own pace");

  const rewritten: MomentCheckInResponse = {
    ...response,
    reflection: expandPresenceReflection(cleanedReflection || response.reflection, userText, isGrief),
    supportiveNote: cleanedNote || response.supportiveNote,
    steps,
    tinyNextStep,
  };

  const scorecard = buildRealismScorecard(rewritten);
  if (scorecard.repetitionRisk > 0.6 || scorecard.conversationalRealism < 0.4) {
    rewritten.supportiveNote = "I'm here with you in this. We don't need to rush to make it tidy.";
  }

  return rewritten;
}
