import { NextResponse } from "next/server";
import { z } from "zod";
import { POST as checkInPost } from "@/app/api/ai/check-in/route";

const schema = z.object({ problem_text: z.string().min(3), stress_level: z.string().optional().default(""), test_context: z.string().optional().default(""), audience: z.string().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const body = {
    text: [parsed.data.problem_text, parsed.data.test_context].filter(Boolean).join("\n"),
    selectedStates: parsed.data.stress_level ? [parsed.data.stress_level] : [],
    sourceSurface: "tutor",
    suggestedIntent: "homework_help",
    optionalBrainHint: "tutor_brain",
    audience: parsed.data.audience,
    routeMetadata: { legacyRoute: "/api/ai/math-reset" },
  };
  return checkInPost(new Request(request.url.replace('/math-reset','/check-in'), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
}
