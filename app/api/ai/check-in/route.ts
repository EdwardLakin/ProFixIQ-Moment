import { NextResponse } from "next/server";
import { z } from "zod";
import { runMomentOrchestrator } from "@/features/ai/orchestration/runMomentOrchestrator";
import { buildThreadUpsert, continuityCueFromThread, inferSupportStyle, summarizeContinuity } from "@/features/moment/continuity/engine";
import type { MomentThread } from "@/features/moment/continuity/types";
import { detectSupportRisk } from "@/features/safety";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  text: z.string().min(3),
  selectedStates: z.array(z.string()).default([]),
  ageRange: z.enum(["under_13", "13_15", "16_17", "18_plus"]).optional(),
  conversationState: z.object({
    threadId: z.string(),
    unresolvedClarification: z.object({ promptId: z.string(), followUpHistory: z.array(z.object({ promptId: z.string(), choiceId: z.string(), choiceLabel: z.string() })) }).nullable().optional(),
    selectedEmotionalContext: z.array(z.string()).default([]),
    inferredSupportStyle: z.enum(["calm_reflective", "gentle_grounding", "structured_reset", "action_forward"]).optional(),
  }).optional(),
});

function summarizeInput(text: string): string { return text.trim().replace(/\s+/g, " ").slice(0, 180); }

export async function POST(request: Request) {
  const warnings: string[] = [];
  let continuitySummary: string | null = null;
  let continuityCue: string | null = null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });


  const { data: activeThreads } = await supabase
    .from("moment_threads")
    .select("id,user_id,title,summary,primary_brain_id,support_style,emotional_state,status,last_activity_at,created_at,updated_at")
    .eq("user_id", user.id)
    .in("status", ["active", "paused"])
    .order("last_activity_at", { ascending: false })
    .limit(6);

  const risk = detectSupportRisk(`${parsed.data.text} ${parsed.data.selectedStates.join(" ")}`);
  if (risk.severity === "high") {
    const safe = { routeLabel: "Emotional Reset", routePath: "/check-in", reflection: "I’m really glad you checked in. This sounds serious and you deserve immediate support.", tinyNextStep: "Reach out to a trusted adult right now.", whyThisRoute: "Moment detected language that needs immediate trusted-human support.", continueLabel: "Open Emotional Reset", steps: ["Tell a parent, guardian, school counselor, or another trusted adult exactly what is happening.", "If there is immediate danger, contact local emergency services now."], supportiveNote: "You matter, and you do not need to hold this alone.", followUpActions: [{ label: "Open Check In", href: "/check-in?from=safety" }] };
    return NextResponse.json({ route: { primaryBrainId: "safety_support_brain", supportingBrainIds: [], routeLabel: "Emotional Reset", routePath: "/check-in", reason: "High-risk language detected.", confidence: "high", audience: "all", category: "emotion" }, response: safe, warnings });
  }

  const followUpAnswers = parsed.data.conversationState?.unresolvedClarification?.followUpHistory.map((entry) => entry.choiceLabel) ?? [];
  const typedThreads = (activeThreads ?? []) as MomentThread[];
  continuitySummary = summarizeContinuity(parsed.data.text, typedThreads);
  const cue = typedThreads.map((thread) => continuityCueFromThread(thread, parsed.data.text)).find((item) => !!item);
  continuityCue = cue?.prompt ?? null;

  const result = runMomentOrchestrator({
    momentText: parsed.data.text,
    selectedSignals: [...parsed.data.selectedStates, ...followUpAnswers],
    ageRange: parsed.data.ageRange,
    supportStyle: parsed.data.conversationState?.inferredSupportStyle,
    followUpHistory: parsed.data.conversationState?.unresolvedClarification?.followUpHistory ?? [],
    threadId: parsed.data.conversationState?.threadId,
  });
  const confidenceValue = result.route.confidence === "high" ? 0.95 : result.route.confidence === "medium" ? 0.75 : 0.5;
  const { error: routeError } = await supabase.from("moment_routes").insert({ user_id: user.id, primary_brain_id: result.route.primaryBrainId, supporting_brain_ids: result.route.supportingBrainIds, category: result.route.category, audience: result.route.audience, input_summary: summarizeInput(parsed.data.text), route_reason: result.route.reason, confidence: confidenceValue });
  const upsertPayload = buildThreadUpsert(parsed.data.text, result.route, user.id, inferSupportStyle(parsed.data.conversationState?.inferredSupportStyle));
  const { error: threadError } = await supabase.from("moment_threads").insert(upsertPayload);
  if (threadError) warnings.push(`Failed to persist thread continuity: ${threadError.message}`);
  if (routeError) warnings.push(`Failed to log route event: ${routeError.message}`);

  return NextResponse.json({ route: result.route, response: { ...result.response, continuitySummary, continuityCue, continuationOptions: ["continue", "pause", "start_fresh"] }, warnings: [...result.warnings, ...warnings] });
}
