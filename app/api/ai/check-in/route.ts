import { NextResponse } from "next/server";
import { z } from "zod";
import { runMomentOrchestrator } from "@/features/ai/orchestration/runMomentOrchestrator";
import { buildThreadUpsert, continuityCueFromThread, findThreadContinuation, inferSupportStyle, summarizeContinuity } from "@/features/moment/continuity/engine";
import type { MomentThread } from "@/features/moment/continuity/types";
import { applyRouteSafetyFilters, escalationCopy, resolveAudiencePolicy } from "@/features/moment/policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractMemoryArtifacts } from "@/features/moment/memory/extractMemoryArtifacts";
import { persistMomentMemory } from "@/features/moment/memory/persistMomentMemory";
import { readMomentMemory } from "@/features/moment/memory/readMomentMemory";
import { getMomentUsageSnapshot } from "@/lib/entitlements";
import { buildTrustSignal, deriveSupportQualityFlags, summarizeTrace } from "@/features/moment/orchestration/observability";
import { getCurrentMomentPlan } from "@/lib/subscriptions";
import { normalizeAgeRange } from "@/lib/momentAudience";

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

function detectPattern(text: string): { key: string; summary: string; focus: string } | null {
  const normalized = text.toLowerCase();
  if (/(math|homework|class|test)/.test(normalized)) return { key: "recurring_school_stress", summary: "Math or school stress has been showing up a lot lately.", focus: "Pair grounding with a tiny school start step." };
  if (/(work|boss|deadline|burnout)/.test(normalized)) return { key: "recurring_work_pressure", summary: "Work pressure seems to be recurring.", focus: "Use calmer restart boundaries before task sorting." };
  if (/(friend|drama|relationship|conflict)/.test(normalized)) return { key: "recurring_relationship_strain", summary: "Relationship tension seems to keep looping.", focus: "Try pause-before-reply and boundary framing." };
  if (/(shutdown|avoid|stuck|overwhelmed)/.test(normalized)) return { key: "recurring_shutdown_before_tasks", summary: "Task shutdown has been recurring before starts.", focus: "Lead with emotional grounding, then one setup action." };
  return null;
}

function detectEmotionalRhythmHint(text: string, now: Date) {
  const normalized = text.toLowerCase();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  if (/(math|homework|exam|study)/.test(normalized) && hour >= 20) return "Night study pressure can feel sharper.";
  if (/(alone|lonely|isolated)/.test(normalized) && (day === 0 || day === 6)) return "Weekends can sometimes feel heavier socially.";
  if (/(work|deadline|meetings|burnout)/.test(normalized) && day === 1 && hour <= 15) return "Monday work pressure can stack quickly.";
  if (/(conflict|fight|argument|drama)/.test(normalized)) return "After conflict, shutdown can show up as protection.";
  return null;
}

function detectSeasonalCue(text: string, now: Date) {
  const normalized = text.toLowerCase();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
  const tags: string[] = [];
  if (isWeekend) tags.push("weekend");
  if (month === 5 && day >= 1 && day <= 15) tags.push("Mother’s Day season");
  if (/(birthday|anniversary|holiday)/.test(normalized)) tags.push("important date");
  if (/(exam|final|midterm)/.test(normalized)) tags.push("exam period");
  if (/(monday|work week|school week)/.test(normalized)) tags.push("start-of-week pressure");
  return tags.length ? `Context note: ${tags.join(", ")} may be part of how this is landing.` : null;
}

function buildRecoveryTrajectoryCue(text: string, routeId: string) {
  const normalized = text.toLowerCase();
  if (routeId === "grief_support_brain") return "You’ve been approaching this grief in small returns, even when it still feels tender.";
  if (routeId === "work_stress_brain") return "You’ve been trying to make work pressure more survivable, not perfect.";
  if (routeId === "school_overwhelm_brain") return "You’ve been coming back to school pressure in steadier, smaller passes.";
  if (/(boundary|conflict|relationship)/.test(normalized)) return "You’ve been trying to hold clearer boundaries with less self-abandoning.";
  return "You’ve been showing a quieter kind of follow-through by checking back in.";
}

function deriveSupportStyle(memorySnapshot: Awaited<ReturnType<typeof readMomentMemory>>) {
  const recent = memorySnapshot.supportEffectivenessNotes.slice(0, 4).map((item) => item.supportStyle);
  if (recent.filter((style) => style === "gentle_grounding").length >= 2) return "gentle_grounding";
  if (recent.filter((style) => style === "structured_reset").length >= 2) return "structured_reset";
  if (recent.filter((style) => style === "action_forward").length >= 2) return "action_forward";
  return "calm_reflective";
}


function ensureResponseShape(response: ReturnType<typeof runMomentOrchestrator>["response"]) {
  const reflection = typeof response.reflection === "string" && response.reflection.trim().length > 0
    ? response.reflection
    : "Thanks for sharing this. We can keep this gentle.";
  const tinyNextStep = typeof response.tinyNextStep === "string" && response.tinyNextStep.trim().length > 0
    ? response.tinyNextStep
    : "One slow breath is enough for now.";
  return {
    ...response,
    reflection,
    tinyNextStep,
    steps: Array.isArray(response.steps) && response.steps.length > 0 ? response.steps.filter((s) => typeof s === "string" && s.trim().length > 0) : [tinyNextStep],
  };
}


function buildFallbackResponse(reason: string) {
  return {
    routeLabel: "Gentle reset",
    routePath: "/check-in",
    reflection: "Thanks for staying with this. We can keep this gentle.",
    tinyNextStep: "Take one slower breath and name one thing you need right now.",
    whyThisRoute: reason,
    continueLabel: "Stay here",
    steps: ["We can keep this very light.", "If you want, name one pressure point in a few words."],
    supportiveNote: "No need to solve this immediately.",
    followUpActions: [{ label: "Quiet reflection", href: "/check-in" }],
  };
}

function createJournalArcSummary(memorySnapshot: Awaited<ReturnType<typeof readMomentMemory>>) {
  const joined = memorySnapshot.entries.map((entry) => `${entry.inputSummary} ${entry.emotionalState ?? ""}`).join(" ").toLowerCase();
  if (/(work|deadline|burnout)/.test(joined)) return "Arc lately: work pressure has been recurring, and slower restarts seem to help.";
  if (/(school|exam|class|homework)/.test(joined)) return "Arc lately: school pressure has been showing up; tiny starts appear more workable than big pushes.";
  if (/(grief|loss|miss)/.test(joined)) return "Arc lately: you’ve been carrying grief in waves, with gentler check-ins seeming more sustainable.";
  if (/(overwhelm|shutdown|stuck)/.test(joined)) return "Arc lately: overwhelm loops appear, and grounding-first support tends to land better.";
  return "Arc lately: you’ve been returning to what matters, and small continuity seems to help.";
}

export async function POST(request: Request) {
  const warnings: string[] = [];
  let continuitySummary: string | null = null;
  let continuityCue: string | null = null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { data: profile } = await supabase.from("moment_profiles").select("age_range").eq("user_id", user.id).maybeSingle();
  const trustedAgeRange = normalizeAgeRange(profile?.age_range);
  const policy = resolveAudiencePolicy(trustedAgeRange);
  const safety = applyRouteSafetyFilters(`${parsed.data.text} ${parsed.data.selectedStates.join(" ")}`);
  if (safety.deny) {
    const safe = { routeLabel: "Emotional Reset", routePath: "/check-in", reflection: "I’m really glad you checked in. This sounds serious and you deserve immediate support.", tinyNextStep: escalationCopy(policy.isMinor), whyThisRoute: "Moment detected language that needs immediate trusted-human support.", continueLabel: "Open Emotional Reset", steps: ["Tell a parent, guardian, school counselor, or another trusted adult exactly what is happening.", "If there is immediate danger, contact local emergency services now."], supportiveNote: "You matter, and you do not need to hold this alone.", followUpActions: [{ label: "Open Check In", href: "/check-in?from=safety" }] };
    return NextResponse.json({ route: { primaryBrainId: "safety_support_brain", supportingBrainIds: [], routeLabel: "Emotional Reset", routePath: "/check-in", reason: "High-risk language detected.", confidence: "high", audience: "all", category: "emotion" }, response: safe, warnings });
  }

  const subscription = await getCurrentMomentPlan(user.id);
  const usage = await getMomentUsageSnapshot(user.id, subscription.plan);
  if (usage.momentLimit !== null && usage.usedMoments >= usage.momentLimit) {
    return NextResponse.json({
      code: "moment_limit_reached",
      message: "You’ve reached your monthly Moment limit. You can still view your journal and saved support until your limit resets.",
      usedMoments: usage.usedMoments,
      momentLimit: usage.momentLimit,
      remainingMoments: usage.remainingMoments,
    }, { status: 402 });
  }


  const { data: activeThreads } = await supabase
    .from("moment_threads")
    .select("id,user_id,title,summary,primary_brain_id,support_style,emotional_state,status,last_activity_at,created_at,updated_at")
    .eq("user_id", user.id)
    .in("status", ["active", "paused"])
    .order("last_activity_at", { ascending: false })
    .limit(6);


  const followUpAnswers = parsed.data.conversationState?.unresolvedClarification?.followUpHistory.map((entry) => entry.choiceLabel) ?? [];
  const typedThreads = (activeThreads ?? []) as MomentThread[];
  continuitySummary = summarizeContinuity(parsed.data.text, typedThreads);
  const cue = typedThreads.map((thread) => continuityCueFromThread(thread, parsed.data.text)).find((item) => !!item);
  continuityCue = cue?.prompt ?? null;

  let result;
  try {
  result = runMomentOrchestrator({
    momentText: parsed.data.text,
    selectedSignals: [...parsed.data.selectedStates, ...followUpAnswers],
    ageRange: trustedAgeRange,
    supportStyle: parsed.data.conversationState?.inferredSupportStyle,
    followUpHistory: parsed.data.conversationState?.unresolvedClarification?.followUpHistory ?? [],
    threadId: parsed.data.conversationState?.threadId,
  });
  } catch {
    const fallback = buildFallbackResponse("Support temporarily shifted into minimal mode.");
    return NextResponse.json({ route: { primaryBrainId: "emotional_reset_brain", supportingBrainIds: [], routeLabel: "Gentle reset", routePath: "/check-in", reason: "orchestration_fallback", confidence: "low", audience: "all", category: "emotion" }, response: { ...fallback, trustSignal: buildTrustSignal(0), fallbackMode: "orchestrator_failure" }, warnings: ["Orchestration fallback used."] });
  }
  const confidenceValue = result.route.confidence === "high" ? 0.95 : result.route.confidence === "medium" ? 0.75 : 0.5;
  const safeResponse = ensureResponseShape(result.response);
  const { data: routeData, error: routeError } = await supabase.from("moment_routes").insert({ user_id: user.id, primary_brain_id: result.route.primaryBrainId, supporting_brain_ids: result.route.supportingBrainIds, category: result.route.category, audience: result.route.audience, input_summary: summarizeInput(parsed.data.text), route_reason: result.route.reason, confidence: confidenceValue }).select("id").single();
  const continuation = findThreadContinuation(parsed.data.text, typedThreads, result.route.primaryBrainId);
  const upsertPayload = buildThreadUpsert(parsed.data.text, result.route, user.id, inferSupportStyle(parsed.data.conversationState?.inferredSupportStyle), continuation?.thread.id);
  const threadWrite = continuation?.thread.id
    ? await supabase.from("moment_threads").update(upsertPayload).eq("id", continuation.thread.id).select("id").single()
    : await supabase.from("moment_threads").insert(upsertPayload).select("id").single();
  const threadData = threadWrite.data;
  const threadError = threadWrite.error;
  if (threadError) warnings.push(`Failed to persist thread continuity: ${threadError.message}`);
  if (routeError) warnings.push(`Failed to log route event: ${routeError.message}`);

  const artifacts = extractMemoryArtifacts({
    userText: parsed.data.text,
    selectedStates: parsed.data.selectedStates,
    route: result.route,
    response: safeResponse,
    supportStyle: parsed.data.conversationState?.inferredSupportStyle,
    riskSeverity: safety.risk.severity,
    ageRange: trustedAgeRange,
  });
  let entryId: string | null = null;
  try {
    entryId = await persistMomentMemory({
    supabase,
    userId: user.id,
    threadId: threadData?.id ?? null,
    routeId: routeData?.id ?? null,
    artifacts,
  });
  } catch {
    entryId = null;
  }
  if (!entryId) warnings.push("We saved your support response, but memory sync is delayed.");

  const detectedPattern = detectPattern(parsed.data.text);
  if (detectedPattern) {
    const { data: existing } = await supabase.from("moment_patterns").select("id,recurrence_count").eq("user_id", user.id).eq("pattern_key", detectedPattern.key).maybeSingle();
    if (existing) {
      await supabase.from("moment_patterns").update({ recurrence_count: (existing.recurrence_count ?? 1) + 1, summary: detectedPattern.summary, support_focus: detectedPattern.focus, last_seen_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("moment_patterns").insert({ user_id: user.id, pattern_key: detectedPattern.key, summary: detectedPattern.summary, support_focus: detectedPattern.focus });
    }
  }

  const memorySnapshot = await readMomentMemory(supabase, user.id).catch(() => ({ entries: [], threads: [], goals: [], tinyWins: [], suggestions: [], supportPatterns: [], supportEffectivenessNotes: [] }));
  const now = new Date();
  const rhythmHint = detectEmotionalRhythmHint(parsed.data.text, now);
  const seasonalCue = detectSeasonalCue(parsed.data.text, now);
  const styleHint = deriveSupportStyle(memorySnapshot);
  const trajectoryCue = buildRecoveryTrajectoryCue(parsed.data.text, result.route.primaryBrainId);
  const journalArcSummary = createJournalArcSummary(memorySnapshot);
  const unresolvedCount = memorySnapshot.threads.filter((thread) => thread.status === "active").length;
  const gentlePresence = unresolvedCount >= 3 || /(exhausted|drained|can.t do this|too much)/i.test(parsed.data.text);
  const adaptedSteps = gentlePresence ? safeResponse.steps.slice(0, 1) : safeResponse.steps;
  const qualityFlags = deriveSupportQualityFlags({
    steps: adaptedSteps,
    reflection: safeResponse.reflection,
    tinyNextStep: safeResponse.tinyNextStep,
    confidence: result.route.confidence,
    reducePrompting: result.trace.supportFatigueReduction,
  });
  const fallbackPath = (warnings.some((item) => item.includes("memory")) ? "memory_failure" : result.route.confidence === "low" ? "routing_low_confidence" : "none") as "none" | "memory_failure" | "routing_low_confidence";
  const trace = {
    routedBrain: result.route.primaryBrainId,
    supportStyle: parsed.data.conversationState?.inferredSupportStyle ?? "calm_reflective",
    pacingProfile: result.trace.pacingProfile,
    clarificationUsed: result.trace.clarificationUsed,
    responseDepth: result.trace.responseDepth,
    continuationPath: "continue" as const,
    supportFatigueReduction: result.trace.supportFatigueReduction,
    fallbackPath,
    confidence: result.route.confidence,
    qualityFlags,
  };
  try {
    await supabase.from("moment_orchestration_events").insert({ user_id: user.id, thread_id: threadData?.id ?? null, route_id: routeData?.id ?? null, trace_summary: summarizeTrace(trace), trace_metadata: trace });
  } catch {}
  return NextResponse.json({
    route: result.route,
    response: {
      ...safeResponse,
      steps: adaptedSteps,
      continuitySummary,
      continuityCue,
      continuationOptions: ["continue", "pause", "start_fresh"],
      emotionalRhythmHint: rhythmHint ? `Soft pattern cue (low confidence): ${rhythmHint}` : null,
      seasonalContextCue: seasonalCue,
      supportStyleAdaptationCue: `Support pacing is leaning ${styleHint.replace("_", " ")} right now.`,
      recoveryTrajectoryCue: trajectoryCue,
      journalArcSummary,
      supportTimingMode: gentlePresence ? "gentle_presence" : "normal",
      trustSignal: buildTrustSignal(memorySnapshot.entries.length),
      fallbackMode: fallbackPath,
      qualityFlags,
    },
    warnings: [...result.warnings, ...warnings],
    memorySnapshot,
  });
}
