import { NextResponse } from "next/server";
import { z } from "zod";
import { POST as checkInPost } from "@/app/api/ai/check-in/route";

const stuckSchema = z.object({ task_text: z.string().min(3), hardest_part: z.string().optional().default(""), emotional_state: z.string().optional().default(""), audience: z.string().optional() });

export async function POST(request: Request) {
  const parsed = stuckSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const body = {
    text: [parsed.data.task_text, parsed.data.hardest_part].filter(Boolean).join("\n"),
    selectedStates: parsed.data.emotional_state ? [parsed.data.emotional_state] : [],
    sourceSurface: "stuck",
    suggestedIntent: "unblock_task_start",
    optionalBrainHint: "task_start_brain",
    audience: parsed.data.audience,
    routeMetadata: { legacyRoute: "/api/ai/stuck" },
  };
  return checkInPost(new Request(request.url.replace('/stuck','/check-in'), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
}
