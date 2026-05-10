import type { AgeRange, MomentBrainId } from "@/features/ai/brains/types";
import type { EmotionalLoad, MomentTool } from "@/features/moment/tools/contracts";
import { momentToolRegistry } from "@/features/moment/tools/registry";

type ToolMemory = { dismissed: string[]; helpful: string[] };

export function recommendMomentTools(input: { route: MomentBrainId; inputText: string; ageRange?: AgeRange; memorySnapshot?: ToolMemory; supportStyle?: string; emotionalLoad?: EmotionalLoad; }) {
  const ageRange = input.ageRange ?? "18_plus";
  const load = input.emotionalLoad ?? "medium";
  if (load === "grief" || load === "lonely") return [];
  const base = momentToolRegistry.filter((tool) => tool.supportedBrainIds.includes(input.route) && tool.supportedAgeRanges.includes(ageRange));
  const dismissed = new Set(input.memorySnapshot?.dismissed ?? []);
  const helpful = new Set(input.memorySnapshot?.helpful ?? []);
  const filtered = base.filter((tool) => !(dismissed.has(tool.id) && !helpful.has(tool.id)));
  const sorted = filtered.sort((a: MomentTool, b: MomentTool) => Number(helpful.has(b.id)) - Number(helpful.has(a.id)));
  if (load === "heavy" || load === "exhausted") return sorted.slice(0, 1);
  if (input.route === "tutor_brain" || input.route === "school_overwhelm_brain") return sorted.slice(0, 1);
  if (input.route === "work_stress_brain" || input.route === "finance_clarity_brain") return sorted.slice(0, 1);
  return sorted.slice(0, 2);
}
