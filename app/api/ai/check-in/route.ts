import { NextResponse } from "next/server";
import { z } from "zod";
import { routeMomentInput } from "@/features/ai/routeMomentInput";
import { runMomentBrain } from "@/features/ai/runMomentBrain";
import { detectSupportRisk } from "@/features/safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ text: z.string().min(3), selectedStates: z.array(z.string()).default([]) });

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const risk = detectSupportRisk(`${parsed.data.text} ${parsed.data.selectedStates.join(" ")}`);
  if (risk.severity === "high") {
    const safe = { routeLabel: "Emotional Reset", routePath: "/check-in", reflection: "I’m really glad you checked in. This sounds serious and you deserve immediate support.", tinyNextStep: "Reach out to a trusted adult right now.", whyThisRoute: "Moment detected language that needs immediate trusted-human support.", continueLabel: "Open Emotional Reset", steps: ["Tell a parent, guardian, school counselor, or another trusted adult exactly what is happening.", "If there is immediate danger, contact local emergency services now."], supportiveNote: "You matter, and you do not need to hold this alone.", followUpActions: [{ label: "Open Check In", href: "/check-in?from=safety" }] };
    const { data: aiMessage, error: aiError } = await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: "safety_classifier", input_snapshot: parsed.data, output_snapshot: safe, safety_flags: risk.flags }).select("id").single();
    return NextResponse.json({ route: { primaryBrain: "safety_classifier", supportingBrains: [], routePath: "/check-in", reason: "High-risk language detected.", confidence: "high" }, response: safe, persisted: { checkinId: null, aiMessageId: aiMessage?.id ?? null }, warnings: aiError ? [`Failed to persist AI message: ${aiError.message}`] : [] });
  }

  const route = routeMomentInput(parsed.data);
  const response = await runMomentBrain(route.primaryBrain);
  const warnings: string[] = [];
  const { data: checkin, error: checkinError } = await supabase.from("moment_checkins").insert({ user_id: user.id, note: parsed.data.text, mood_label: parsed.data.selectedStates.join(", "), situation_type: "general", ai_response: { route, response } }).select("id").single();
  if (checkinError) warnings.push(`Failed to persist check-in: ${checkinError.message}`);
  const { data: aiMessage, error: aiError } = await supabase.from("moment_ai_messages").insert({ user_id: user.id, mode: route.primaryBrain, source_table: "moment_checkins", source_id: checkin?.id, input_snapshot: parsed.data, output_snapshot: response, safety_flags: risk.flags }).select("id").single();
  if (aiError) warnings.push(`Failed to persist AI message: ${aiError.message}`);

  return NextResponse.json({ route, response, persisted: { checkinId: checkin?.id ?? null, aiMessageId: aiMessage?.id ?? null }, warnings });
}
