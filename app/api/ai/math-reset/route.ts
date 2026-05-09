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
 const response = risk.severity === "high" ? normalizeMomentBrainOutput({ reflection: "Your safety matters most.", tinyNextStep: "Reach out to a trusted adult now.", steps: ["Share exactly what is happening."], supportiveNote: "Immediate danger means call emergency services.", followUpActions: [{ label: "Return to Moment", href: "/dashboard" }] }) : await runMomentBrain("math_reset_brain", joined);
 const warnings: string[] = [];
 const { data: row, error: rowError } = await supabase.from("moment_math_resets").insert({ user_id: user.id, ...parsed.data, ai_response: response }).select("id").single();
 if (rowError) warnings.push(`Failed to persist math reset: ${rowError.message}`);
 const { data: aiMessage, error: aiError } = await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: "math_reset_brain", source_table: "moment_math_resets", source_id: row?.id, input_snapshot: parsed.data, output_snapshot: response, safety_flags: risk.flags }).select("id").single();
 if (aiError) warnings.push(`Failed to persist AI message: ${aiError.message}`);
 return NextResponse.json({ response, persisted: { mathResetId: row?.id ?? null, aiMessageId: aiMessage?.id ?? null }, warnings });
}
