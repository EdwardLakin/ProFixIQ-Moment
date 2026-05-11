import { NextResponse } from "next/server";
import { z } from "zod";
import { POST as checkInPost } from "@/app/api/ai/check-in/route";

const schema = z.object({ situation_text: z.string().min(3), relationship: z.string().optional().default(""), goal: z.string().optional().default(""), audience: z.string().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const body = {
    text: [parsed.data.situation_text, parsed.data.relationship, parsed.data.goal].filter(Boolean).join("\n"),
    sourceSurface: "drama_pause",
    suggestedIntent: "work_through_conflict",
    optionalBrainHint: "social_boundary_brain",
    audience: parsed.data.audience,
    routeMetadata: { legacyRoute: "/api/ai/drama-pause" },
  };
  return checkInPost(new Request(request.url.replace('/drama-pause','/check-in'), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
}
