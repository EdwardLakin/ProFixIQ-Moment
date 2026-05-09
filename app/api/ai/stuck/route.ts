import { NextResponse } from "next/server";
import { z } from "zod";
import { runStuckMode } from "@/features/ai/modes";
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

  const json = await request.json();
  const parsed = stuckSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const joinedInput = `${parsed.data.task_text} ${parsed.data.hardest_part} ${parsed.data.emotional_state}`;
  const risk = detectSupportRisk(joinedInput);
  const output = risk.severity === "high"
    ? { summary: "You deserve support right now.", likely_block: "Safety concern detected", tiny_steps: ["Pause and reach out to a trusted adult right now."], encouragement: "You matter.", five_minute_restart: "If you are in immediate danger, call emergency services now." }
    : await runStuckMode(parsed.data);

  const { data: session } = await supabase.from("moment_stuck_sessions").insert({ user_id: user.id, ...parsed.data, ai_response: output }).select("id").single();
  await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: "stuck_decomposer", source_table: "moment_stuck_sessions", source_id: session?.id, input_snapshot: parsed.data, output_snapshot: output, safety_flags: risk.flags });

  return NextResponse.json(output);
}
