import { getOpenAIKey } from "@/lib/env";

export type StuckResponse = {
  summary: string;
  likely_block: string;
  tiny_steps: string[];
  encouragement: string;
  five_minute_restart: string;
};

export async function runStuckMode(input: { task_text: string; hardest_part: string; emotional_state: string }): Promise<StuckResponse> {
  const apiKey = getOpenAIKey();

  if (!apiKey) {
    return {
      summary: `You want to make progress on: ${input.task_text}`,
      likely_block: input.hardest_part || "Getting started feels heavy right now.",
      tiny_steps: [
        "Open what you need and set a 5-minute timer.",
        "Write one imperfect starter sentence.",
        "Do one tiny piece only, then pause and reassess."
      ],
      encouragement: "Small starts count. Momentum grows from one gentle action.",
      five_minute_restart: "For five minutes: breathe, open your task, and complete just one visible step."
    };
  }

  return {
    summary: `You are trying to move forward with ${input.task_text}.`,
    likely_block: input.hardest_part || "Unclear first action",
    tiny_steps: ["Choose one concrete micro-step.", "Work for 5 minutes.", "Mark progress and continue if energy allows."],
    encouragement: "You do not need perfect. You only need to begin.",
    five_minute_restart: "Reset your space, pick one tiny step, and do it for five minutes."
  };
}
