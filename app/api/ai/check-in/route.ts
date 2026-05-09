import { NextResponse } from "next/server";
import { z } from "zod";
import { runMomentOrchestrator } from "@/features/ai/orchestration/runMomentOrchestrator";
import { detectSupportRisk } from "@/features/safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  text: z.string().min(3),
  selectedStates: z.array(z.string()).default([]),
  ageRange: z.enum(["under_13", "13_15", "16_17", "18_plus"]).optional(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const risk = detectSupportRisk(`${parsed.data.text} ${parsed.data.selectedStates.join(" ")}`);

  if (risk.severity === "high") {
    const safe = {
      routeLabel: "Emotional Reset",
      routePath: "/check-in",
      reflection: "I’m really glad you checked in. This sounds serious and you deserve immediate support.",
      tinyNextStep: "Reach out to a trusted adult right now.",
      whyThisRoute: "Moment detected language that needs immediate trusted-human support.",
      continueLabel: "Open Emotional Reset",
      steps: [
        "Tell a parent, guardian, school counselor, or another trusted adult exactly what is happening.",
        "If there is immediate danger, contact local emergency services now.",
      ],
      supportiveNote: "You matter, and you do not need to hold this alone.",
      followUpActions: [{ label: "Open Check In", href: "/check-in?from=safety" }],
    };

    const { data: aiMessage, error: aiError } = await supabase
      .from("moment_ai_messages")
      .insert({
        user_id: user.id,
        mode: "safety_classifier",
        input_snapshot: parsed.data,
        output_snapshot: safe,
        safety_flags: risk.flags,
      })
      .select("id")
      .single();

    return NextResponse.json({
      route: {
        primaryBrainId: "safety_support_brain",
        supportingBrainIds: [],
        primaryBrain: "safety_support_brain",
        supportingBrains: [],
        routeLabel: "Emotional Reset",
        routePath: "/check-in",
        reason: "High-risk language detected.",
        confidence: "high",
        audience: "all",
        category: "emotion",
      },
      response: safe,
      persisted: { checkinId: null, aiMessageId: aiMessage?.id ?? null },
      warnings: aiError ? [`Failed to persist AI message: ${aiError.message}`] : [],
    });
  }

  const result = runMomentOrchestrator({
    momentText: parsed.data.text,
    selectedSignals: parsed.data.selectedStates,
    ageRange: parsed.data.ageRange,
  });

  return NextResponse.json({
    route: result.route,
    response: result.response,
    warnings: result.warnings,
  });
}
