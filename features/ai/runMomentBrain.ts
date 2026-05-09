import { brainRegistry } from "@/features/ai/brains/registry";
import type { MomentBrainId, MomentCheckInResponse } from "@/features/ai/types";

export function normalizeMomentBrainOutput(input: Partial<MomentCheckInResponse>, primaryBrain: MomentBrainId = "emotional_reset_brain"): MomentCheckInResponse {
  const label = brainRegistry[primaryBrain as keyof typeof brainRegistry]?.label ?? "Moment";
  const reflection = input.reflection?.trim() || "You checked in, and that matters.";
  const tinyNextStep = input.tinyNextStep?.trim() || "Take one tiny two-minute action.";
  const whyThisHelps = input.whyThisHelps?.trim() || "Small actions reduce pressure and rebuild momentum.";
  const continueLabel = input.continueLabel?.trim() || `Continue with ${label}`;
  const blocks = input.blocks?.length ? input.blocks : [{ type: "reflection" as const, text: reflection }, { type: "tiny_step" as const, text: tinyNextStep }];
  return { reflection, tinyNextStep, whyThisHelps, continueLabel, blocks };
}

export async function runMomentBrain(primaryBrain: MomentBrainId, userText = ""): Promise<MomentCheckInResponse> {
  void userText;
  return normalizeMomentBrainOutput({}, primaryBrain);
}
