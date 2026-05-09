import { getOpenAIKey } from "@/lib/env";
import type { MomentBrainId, MomentCheckInResponse, OperationalBlock } from "@/features/ai/types";
import { getMockResponse } from "@/features/ai/mockResponses";

export function normalizeMomentBrainOutput(input: Partial<MomentCheckInResponse>): MomentCheckInResponse {
  const safe: MomentCheckInResponse = {
    reflection: input.reflection?.trim() || "You checked in. That matters.",
    tinyNextStep: input.tinyNextStep?.trim() || "Take one tiny step and re-check in.",
    steps: (input.steps ?? []).filter(Boolean).slice(0, 3),
    supportiveNote: input.supportiveNote?.trim() || "Keep it light and specific.",
    followUpActions: (input.followUpActions ?? []).slice(0, 3),
  };

  const blocks: OperationalBlock[] = [
    { type: "momentum_builder", text: safe.tinyNextStep },
    { type: "route_transition", text: safe.steps[0] ?? "Choose the next calm route." },
    { type: "recovery_prompt", text: safe.supportiveNote },
  ];

  return { ...safe, blocks };
}

export async function runMomentBrain(primaryBrain: MomentBrainId): Promise<MomentCheckInResponse> {
  const apiKey = getOpenAIKey();
  const raw = !apiKey ? getMockResponse(primaryBrain) : getMockResponse(primaryBrain);
  return normalizeMomentBrainOutput(raw);
}
