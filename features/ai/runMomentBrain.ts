import { brainRegistry } from "@/features/ai/brainRegistry";
import { getMockResponse } from "@/features/ai/mockResponses";
import type { MomentBrainId, MomentCheckInResponse, OperationalBlock } from "@/features/ai/types";
import { getOpenAIKey } from "@/lib/env";

export function normalizeMomentBrainOutput(input: Partial<MomentCheckInResponse>): MomentCheckInResponse {
  const safe: MomentCheckInResponse = {
    routeLabel: input.routeLabel?.trim() || "Emotional Reset",
    routePath: input.routePath?.trim() || "/check-in",
    reflection: input.reflection?.trim() || "You checked in. That matters.",
    tinyNextStep: input.tinyNextStep?.trim() || "Take one tiny step and re-check in.",
    whyThisRoute: input.whyThisRoute?.trim() || "Moment chose this route from what you shared.",
    continueLabel: input.continueLabel?.trim() || "Continue",
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

async function runOpenAI(primaryBrain: MomentBrainId, userText: string): Promise<Partial<MomentCheckInResponse>> {
  const apiKey = getOpenAIKey();
  if (!apiKey) return getMockResponse(primaryBrain);
  const brain = brainRegistry[primaryBrain];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: `${brain.systemPrompt}\nKeep responses practical, non-clinical, and brief.` },
        { role: "user", content: userText.slice(0, 1200) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "moment_response_v1",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              routeLabel: { type: "string" },
              routePath: { type: "string" },
              reflection: { type: "string" },
              tinyNextStep: { type: "string" },
              whyThisRoute: { type: "string" },
              continueLabel: { type: "string" },
              steps: { type: "array", items: { type: "string" }, maxItems: 3 },
              supportiveNote: { type: "string" },
              followUpActions: {
                type: "array",
                maxItems: 3,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: { label: { type: "string" }, href: { type: "string" } },
                  required: ["label", "href"],
                },
              },
            },
            required: ["routeLabel", "routePath", "reflection", "tinyNextStep", "whyThisRoute", "continueLabel", "steps", "supportiveNote", "followUpActions"],
          },
        },
      },
      max_output_tokens: 300,
    }),
  });

  if (!response.ok) throw new Error("OpenAI request failed");
  const payload = await response.json() as { output_text?: string };
  return payload.output_text ? JSON.parse(payload.output_text) as Partial<MomentCheckInResponse> : getMockResponse(primaryBrain);
}

export async function runMomentBrain(primaryBrain: MomentBrainId, userText = ""): Promise<MomentCheckInResponse> {
  try {
    const raw = await runOpenAI(primaryBrain, userText);
    return normalizeMomentBrainOutput(raw);
  } catch {
    return normalizeMomentBrainOutput(getMockResponse(primaryBrain));
  }
}
