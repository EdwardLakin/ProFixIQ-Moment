import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMomentBrainOutput, runMomentBrain } from "@/features/ai/runMomentBrain";
import { detectSupportRisk } from "@/features/safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";
const schema = z.object({ problem_text: z.string().min(3), stress_level: z.string().optional().default(""), test_context: z.string().optional().default("") });
export async function POST(request: Request) {
 const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
 const joined = `${parsed.data.problem_text} ${parsed.data.stress_level} ${parsed.data.test_context}`; const risk = detectSupportRisk(joined);
 const response = risk.severity === "high" ? normalizeMomentBrainOutput({ reflection: "Your safety matters most.", tinyNextStep: "Reach out to a trusted adult now.", steps: ["Share exactly what is happening."], supportiveNote: "Immediate danger means call emergency services.", followUpActions: [{ label: "Return to Moment", href: "/dashboard" }] }) : await runMomentBrain("math_reset_helper", joined);
 const { data: row } = await supabase.from("moment_math_resets").insert({ user_id: user.id, ...parsed.data, ai_response: response }).select("id").single();
 const { data: aiMessage } = await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: "math_reset_helper", source_table: "moment_math_resets", source_id: row?.id, input_snapshot: parsed.data, output_snapshot: response, safety_flags: risk.flags }).select("id").single();
 return NextResponse.json({ response, persisted: { mathResetId: row?.id ?? null, aiMessageId: aiMessage?.id ?? null } });
}
