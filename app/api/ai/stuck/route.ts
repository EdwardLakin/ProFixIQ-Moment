import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMomentBrainOutput, runMomentBrain } from "@/features/ai/runMomentBrain";
import { detectSupportRisk } from "@/features/safety";
import type { MomentRouteResult } from "@/features/ai/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stuckSchema = z.object({ task_text: z.string().min(3), hardest_part: z.string().optional().default(""), emotional_state: z.string().optional().default("") });
const route: MomentRouteResult = { primaryBrain: "stuck_decomposer", supportingBrains: [], routePath: "/stuck", reason: "Stuck reset requested.", confidence: "high" };

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = stuckSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const joinedInput = `${parsed.data.task_text} ${parsed.data.hardest_part} ${parsed.data.emotional_state}`;
  const risk = detectSupportRisk(joinedInput);
  const response = risk.severity === "high"
    ? normalizeMomentBrainOutput({ reflection: "Thanks for sharing this. You deserve immediate real-world support.", tinyNextStep: "Pause and contact a trusted adult right now.", steps: ["Send one clear message asking for help now."], supportiveNote: "If there is immediate danger, contact emergency services now.", followUpActions: [{ label: "Return to Moment", href: "/dashboard" }] })
    : await runMomentBrain("stuck_decomposer", joinedInput);

  const warnings: string[] = [];
  const { data: session, error: sessionError } = await supabase.from("moment_stuck_sessions").insert({ user_id: user.id, ...parsed.data, ai_response: response }).select("id").single();
  if (sessionError) warnings.push(`Failed to persist stuck session: ${sessionError.message}`);
  const { data: aiMessage, error: aiError } = await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: "stuck_decomposer", source_table: "moment_stuck_sessions", source_id: session?.id, input_snapshot: parsed.data, output_snapshot: response, safety_flags: risk.flags }).select("id").single();
  if (aiError) warnings.push(`Failed to persist AI message: ${aiError.message}`);

  return NextResponse.json({ route, response, persisted: { sessionId: session?.id ?? null, aiMessageId: aiMessage?.id ?? null }, warnings });
}
