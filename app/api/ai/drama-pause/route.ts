import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeMomentBrainOutput, runMomentBrain } from "@/features/ai/runMomentBrain";
import { detectSupportRisk } from "@/features/safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";
const schema = z.object({ situation_text: z.string().min(3), relationship: z.string().optional().default(""), goal: z.string().optional().default("") });
export async function POST(request: Request) {
 const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const parsed = schema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
 const joined = `${parsed.data.situation_text} ${parsed.data.relationship} ${parsed.data.goal}`; const risk = detectSupportRisk(joined);
 const response = risk.severity === "high" ? normalizeMomentBrainOutput({ reflection: "You deserve support right away.", tinyNextStep: "Pause this conversation and contact a trusted adult.", steps: ["Ask for help in plain words now."], supportiveNote: "If danger is immediate, call emergency services.", followUpActions: [{ label: "Return to Moment", href: "/dashboard" }] }) : await runMomentBrain("social_boundary_helper", joined);
 const warnings: string[] = [];
 const { data: row, error: rowError } = await supabase.from("moment_drama_pauses").insert({ user_id: user.id, ...parsed.data, ai_response: response }).select("id").single();
 if (rowError) warnings.push(`Failed to persist drama pause: ${rowError.message}`);
 const { data: aiMessage, error: aiError } = await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: "social_boundary_helper", source_table: "moment_drama_pauses", source_id: row?.id, input_snapshot: parsed.data, output_snapshot: response, safety_flags: risk.flags }).select("id").single();
 if (aiError) warnings.push(`Failed to persist AI message: ${aiError.message}`);
 return NextResponse.json({ response, persisted: { dramaPauseId: row?.id ?? null, aiMessageId: aiMessage?.id ?? null }, warnings });
}
