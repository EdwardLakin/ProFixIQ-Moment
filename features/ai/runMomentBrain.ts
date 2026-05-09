import { getOpenAIKey } from "@/lib/env";
import type { MomentBrainId, MomentCheckInResponse } from "@/features/ai/types";
import { getMockResponse } from "@/features/ai/mockResponses";

export async function runMomentBrain(primaryBrain: MomentBrainId): Promise<MomentCheckInResponse> {
  const apiKey = getOpenAIKey();
  if (!apiKey) return getMockResponse(primaryBrain);
  return getMockResponse(primaryBrain);
}
