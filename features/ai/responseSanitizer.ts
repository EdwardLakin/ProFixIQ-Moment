import type { MomentCheckInResponse } from "@/features/ai/types";

const INTERNAL_PATTERNS = [
  /support pacing is/i,
  /^mode:/i,
  /^route:/i,
  /\bbrain\b/i,
  /orchestrator/i,
  /cognition/i,
  /metadata/i,
  /support mode/i,
  /timing mode/i,
  /\bdetected\b/i,
  /classification/i,
];

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

function isInternalCopy(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return INTERNAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || isInternalCopy(trimmed)) continue;
    const key = normalize(trimmed);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    kept.push(trimmed);
  }
  return kept;
}

export function sanitizeVisibleResponse(response: MomentCheckInResponse): MomentCheckInResponse {
  const uniqueVisible = dedupeLines([response.reflection, response.tinyNextStep, ...response.steps, response.supportiveNote]);
  const fallback = uniqueVisible[0] ?? "Thanks for sharing this with me.";
  const reflection = dedupeLines([response.reflection])[0] ?? fallback;
  const tinyNextStep = dedupeLines([response.tinyNextStep]).find((line) => normalize(line) !== normalize(reflection)) ?? "";
  const steps = dedupeLines(response.steps).filter((line) => normalize(line) !== normalize(reflection) && normalize(line) !== normalize(tinyNextStep)).slice(0, 3);
  const supportiveNote = dedupeLines([response.supportiveNote]).find((line) => ![reflection, tinyNextStep, ...steps].some((item) => normalize(item) === normalize(line))) ?? "";
  return { ...response, reflection, tinyNextStep, steps, supportiveNote };
}

export function sanitizeUiCue(copy: string | null | undefined): string | null {
  if (!copy) return null;
  const cleaned = dedupeLines([copy]);
  return cleaned[0] ?? null;
}

