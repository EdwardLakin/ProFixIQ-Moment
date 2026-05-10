"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentTextarea } from "@/components/moment/MomentTextarea";
import type { MomentCheckInResponse, MomentRouteResult, OperationalBlock } from "@/features/ai/types";
import type { BrainAudience, BrainCategory, MomentBrainId } from "@/features/ai/brains/types";
import type { MomentGreetingOutput } from "@/features/moment/greeting/types";

type SupportStyle = "calm_reflective" | "gentle_grounding" | "structured_reset" | "action_forward";
type ClarificationChoice = { id: string; label: string; };
type ClarificationPrompt = { id: string; prompt: string; choices: ClarificationChoice[] };
type FollowUpHistoryEntry = { promptId: string; choiceId: string; choiceLabel: string };

const knownBrainIds: MomentBrainId[] = ["school_overwhelm_brain", "math_reset_brain", "social_boundary_brain", "task_start_brain", "emotional_reset_brain", "confidence_repair_brain", "work_stress_brain", "finance_clarity_brain", "relationship_reflection_brain", "household_overload_brain", "life_admin_brain", "decision_reset_brain", "safety_support_brain"];
const knownAudiences: BrainAudience[] = ["teen", "adult", "all"];
const knownCategories: BrainCategory[] = ["school", "math", "social", "task", "emotion", "confidence", "work", "money", "relationship", "household", "life_admin", "decision", "safety"];

const supportChips = ["I feel overwhelmed", "I can’t focus", "I feel sad", "Work pressure", "Money stress", "I miss someone"];
const clarificationPrompts: ClarificationPrompt[] = [
  { id: "overwhelmed", prompt: "What feels loudest right now?", choices: [{ id: "school", label: "school" }, { id: "work", label: "work" }, { id: "money", label: "money" }, { id: "relationships", label: "relationships" }, { id: "everything", label: "just everything" }] },
  { id: "focus", prompt: "Does it feel more like:", choices: [{ id: "emotional_overwhelm", label: "emotional overwhelm" }, { id: "mental_exhaustion", label: "mental exhaustion" }, { id: "distraction", label: "distraction" }, { id: "pressure", label: "pressure to start" }] },
  { id: "sad", prompt: "Do you want:", choices: [{ id: "talk", label: "space to talk" }, { id: "grounding", label: "grounding" }, { id: "unstuck", label: "help getting unstuck" }, { id: "quiet", label: "quiet support" }] },
];

const safeLabel = (brainId: string) => brainId.replace(/_brain$/, "").split("_").map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1)).join(" ");

function toSafeRoute(raw: unknown): MomentRouteResult | null {
  if (!raw || typeof raw !== "object") return null;
  const route = raw as Record<string, unknown>;
  const rawPrimaryBrainId = typeof route.primaryBrainId === "string" ? route.primaryBrainId : typeof route.primaryBrain === "string" ? route.primaryBrain : null;
  const primaryBrainId = rawPrimaryBrainId && knownBrainIds.includes(rawPrimaryBrainId as MomentBrainId) ? rawPrimaryBrainId as MomentBrainId : null;
  if (!primaryBrainId) return null;
  const supportingRaw = Array.isArray(route.supportingBrainIds) ? route.supportingBrainIds : Array.isArray(route.supportingBrains) ? route.supportingBrains : [];
  const supportingBrainIds = supportingRaw.filter((id): id is MomentBrainId => typeof id === "string" && knownBrainIds.includes(id as MomentBrainId));
  const normalizedConfidence = typeof route.confidence === "string"
    ? route.confidence
    : typeof route.confidence === "number"
      ? route.confidence >= 0.85 ? "high" : route.confidence >= 0.65 ? "medium" : "low"
      : "medium";

  return {
    primaryBrainId,
    supportingBrainIds,
    routeLabel: typeof route.routeLabel === "string" ? route.routeLabel : safeLabel(primaryBrainId),
    routePath: typeof route.routePath === "string" ? route.routePath : "/check-in",
    reason: typeof route.reason === "string" ? route.reason : "Moment selected a route based on your check-in.",
    confidence: normalizedConfidence === "high" || normalizedConfidence === "medium" || normalizedConfidence === "low" ? normalizedConfidence : "medium",
    audience: knownAudiences.includes(route.audience as BrainAudience) ? route.audience as BrainAudience : "all",
    category: knownCategories.includes(route.category as BrainCategory) ? route.category as BrainCategory : "emotion",
  };
}

function toSafeBlocks(blocks: unknown, reflection: string, tinyNextStep: string): OperationalBlock[] {
  if (Array.isArray(blocks)) {
    return blocks
      .filter((block): block is Record<string, unknown> => !!block && typeof block === "object")
      .map((block) => ({
        type: typeof block.type === "string" ? block.type : "support",
        text: typeof block.text === "string" ? block.text : "",
      }))
      .filter((block) => block.text.length > 0) as OperationalBlock[];
  }
  return [
    { type: "reflection", text: reflection },
    { type: "tiny_step", text: tinyNextStep },
  ];
}

function toSafeResponse(raw: unknown, route: MomentRouteResult): MomentCheckInResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const response = raw as Record<string, unknown>;
  const reflection = typeof response.reflection === "string" ? response.reflection : "Thanks for sharing this moment.";
  const tinyNextStep = typeof response.tinyNextStep === "string" ? response.tinyNextStep : "Take one small step you can finish in two minutes.";
  return {
    routeLabel: typeof response.routeLabel === "string" ? response.routeLabel : route.routeLabel,
    routePath: typeof response.routePath === "string" ? response.routePath : route.routePath,
    reflection,
    tinyNextStep,
    whyThisRoute: typeof response.whyThisRoute === "string" ? response.whyThisRoute : typeof response.whyThisHelps === "string" ? response.whyThisHelps : route.reason,
    continueLabel: typeof response.continueLabel === "string" ? response.continueLabel : `Continue with ${route.routeLabel}`,
    steps: Array.isArray(response.steps) ? response.steps.filter((s): s is string => typeof s === "string") : [tinyNextStep],
    supportiveNote: typeof response.supportiveNote === "string" ? response.supportiveNote : "Small steps count.",
    followUpActions: Array.isArray(response.followUpActions)
      ? response.followUpActions
        .filter((action): action is Record<string, unknown> => !!action && typeof action === "object")
        .map((action) => ({ label: typeof action.label === "string" ? action.label : "Open check-in", href: typeof action.href === "string" ? action.href : route.routePath }))
      : [{ label: `Open ${route.routeLabel}`, href: route.routePath }],
    blocks: toSafeBlocks(response.blocks, reflection, tinyNextStep),
  };
}

export function DashboardClient({ greeting }: { greeting: MomentGreetingOutput }) {
  const [text, setText] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [result, setResult] = useState<{ route: MomentRouteResult; response: MomentCheckInResponse } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [supportStyle, setSupportStyle] = useState<SupportStyle>("calm_reflective");
  const [threadId] = useState(`thread_${Date.now().toString(36)}`);
  const [pendingPrompt, setPendingPrompt] = useState<ClarificationPrompt | null>(null);
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpHistoryEntry[]>([]);

  const promptFromText = useMemo(() => {
    const normalized = `${text} ${selectedStates.join(" ")}`.toLowerCase();
    if (normalized.includes("overwhelm")) return clarificationPrompts[0];
    if (normalized.includes("focus")) return clarificationPrompts[1];
    if (normalized.includes("sad")) return clarificationPrompts[2];
    return null;
  }, [selectedStates, text]);

  async function submit() {
    setError(null);
    setWarnings([]);
    try {
      const unresolvedClarification = pendingPrompt ? { promptId: pendingPrompt.id, followUpHistory } : null;
      const res = await fetch("/api/ai/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, selectedStates, conversationState: { threadId, unresolvedClarification, selectedEmotionalContext: selectedStates, inferredSupportStyle: supportStyle } }) });
      if (!res.ok) {
        setError("Moment couldn't process this check-in. Please try again.");
        return;
      }
      const data = await res.json() as { route?: unknown; response?: unknown; warnings?: unknown };
      const safeRoute = toSafeRoute(data.route);
      if (!safeRoute) {
        setError("Moment returned an unexpected route format. Please try again.");
        return;
      }
      const safeResponse = toSafeResponse(data.response, safeRoute);
      if (!safeResponse) {
        setError("Moment returned an unexpected response format. Please try again.");
        return;
      }
      setWarnings(Array.isArray(data.warnings) ? data.warnings.filter((w): w is string => typeof w === "string") : []);
      setResult({ route: safeRoute, response: safeResponse });
      setPendingPrompt(null);
    } catch {
      setError("Network issue: Moment couldn't load your next step. Check your connection and retry.");
    }
  }

  function selectClarification(choice: ClarificationChoice) {
    if (!pendingPrompt) return;
    const next = [...followUpHistory, { promptId: pendingPrompt.id, choiceId: choice.id, choiceLabel: choice.label }];
    setFollowUpHistory(next);
    if (choice.id === "grounding" || choice.id === "everything" || choice.id === "emotional_overwhelm") setSupportStyle("gentle_grounding");
    if (choice.id === "pressure" || choice.id === "work") setSupportStyle("action_forward");
    if (choice.id === "school" || choice.id === "money" || choice.id === "distraction") setSupportStyle("structured_reset");
    if (choice.id === "talk" || choice.id === "quiet") setSupportStyle("calm_reflective");
    setSelectedStates((curr) => curr.includes(choice.label) ? curr : [...curr, choice.label]);
    setPendingPrompt(null);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_14%_0%,rgba(244,200,255,0.14),transparent_38%),radial-gradient(circle_at_88%_0%,rgba(147,197,253,0.15),transparent_36%),linear-gradient(140deg,#1a1427,#111925_58%,#1a2238)] p-6 shadow-[0_45px_120px_-65px_rgba(232,121,249,0.8)] sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#e8dbff]/75">{greeting.headline}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f7efe3] sm:text-4xl">Tell Moment what&apos;s going on right now.</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#d9d8e8]">Moment adapts as you respond, with conversational follow-ups before final routing.</p>
        <MomentTextarea rows={6} value={text} onChange={(event) => setText(event.target.value)} placeholder="Write what this moment feels like. You can be messy and honest." />
        <div className="mt-4 flex flex-wrap gap-2">{supportChips.map((chip) => <button key={chip} type="button" onClick={() => setSelectedStates((curr) => curr.includes(chip) ? curr.filter((value) => value !== chip) : [...curr, chip])} className={`rounded-full px-3 py-1.5 text-xs transition ${selectedStates.includes(chip) ? "bg-[#d7ccff] text-[#271d3f]" : "bg-white/8 text-[#e5def2] ring-1 ring-white/15 hover:bg-white/14"}`}>{chip}</button>)}</div>
        {pendingPrompt ? (
          <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <p className="text-sm text-[#efeaff]">{pendingPrompt.prompt}</p>
            <div className="mt-3 flex flex-wrap gap-2">{pendingPrompt.choices.map((choice) => <button key={choice.id} type="button" onClick={() => selectClarification(choice)} className="rounded-full bg-white/8 px-3 py-1.5 text-xs text-[#f1ebff] ring-1 ring-white/20 hover:bg-white/15">{choice.label}</button>)}</div>
          </div>
        ) : null}
        <div className="mt-5 flex items-center justify-end gap-3">
          {!pendingPrompt && promptFromText ? <MomentButton onClick={() => setPendingPrompt(promptFromText)}>Answer one quick follow-up</MomentButton> : null}
          <MomentButton onClick={submit} disabled={text.length < 3}>Continue gently</MomentButton>
        </div>
        {error ? <p className="mt-3 rounded-xl border border-rose-200/40 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p> : null}
        {warnings.length > 0 ? <div className="mt-3 rounded-xl border border-amber-100/30 bg-amber-300/10 p-3 text-xs text-amber-100">{warnings.map((warning) => <p key={warning}>{warning}</p>)}</div> : null}
      </section>

      {result ? (
        <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_-55px_rgba(129,140,248,0.75)]">
          <p className="text-xs uppercase tracking-[0.16em] text-violet-100/70">{result.response.whyThisRoute}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#f8f1e7]">{result.response.routeLabel || safeLabel(result.route.primaryBrainId)}</h3>
          <p className="mt-3 text-[#dbd9e8]">{result.response.reflection}</p>
          <p className="mt-3 rounded-2xl bg-black/20 p-3 text-sm text-[#f8f1e7] ring-1 ring-white/10">Tiny next step: {result.response.tinyNextStep}</p>
          <p className="mt-3 text-xs text-violet-100/70">Support style: {supportStyle.replace("_", " ")}</p>
          <Link href={result.response.routePath || "/check-in"} className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-violet-100 ring-1 ring-white/20 hover:bg-white/15">{result.response.continueLabel}</Link>
        </section>
      ) : null}

      <MomentCard className="border-white/8 bg-white/[0.02]">
        <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">Need something specific?</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#d2cee5]"><Link href="/check-in" className="hover:text-white">Check In</Link><Link href="/stuck" className="hover:text-white">Stuck Restart</Link><Link href="/math-reset" className="hover:text-white">Math Reset</Link><Link href="/drama-pause" className="hover:text-white">Boundary Pause</Link></div>
      </MomentCard>
    </div>
  );
}
