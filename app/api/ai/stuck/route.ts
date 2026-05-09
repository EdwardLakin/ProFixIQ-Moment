import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMomentBrainOutput, runMomentBrain } from "@/features/ai/runMomentBrain";
import { detectSupportRisk } from "@/features/safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stuckSchema = z.object({
  task_text: z.string().min(3),
  hardest_part: z.string().optional().default(""),
  emotional_state: z.string().optional().default(""),
});

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

  const { data: session } = await supabase.from("moment_stuck_sessions").insert({ user_id: user.id, ...parsed.data, ai_response: response }).select("id").single();
  const { data: aiMessage } = await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: "stuck_decomposer", source_table: "moment_stuck_sessions", source_id: session?.id, input_snapshot: parsed.data, output_snapshot: response, safety_flags: risk.flags }).select("id").single();

  return NextResponse.json({ response, persisted: { sessionId: session?.id ?? null, aiMessageId: aiMessage?.id ?? null } });
}
