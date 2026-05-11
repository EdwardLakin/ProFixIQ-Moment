"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MomentPlan } from "@/lib/plans";
import type { MomentCheckInResponse, MomentRouteResult, OperationalBlock } from "@/features/ai/types";
import { BRAIN_AUDIENCES, BRAIN_CATEGORIES, MOMENT_BRAIN_IDS, OPERATIONAL_BLOCK_TYPES, ROUTE_LABELS } from "@/features/ai/contracts";
import type { BrainAudience, BrainCategory, MomentBrainId } from "@/features/ai/brains/types";
import type { MomentGreetingOutput } from "@/features/moment/greeting/types";
import type { MomentMemorySnapshot } from "@/features/moment/memory/types";
import { GreetingSurface } from "./components/GreetingSurface";
import { IntakeComposer } from "./components/IntakeComposer";
import { SupportStream } from "./components/SupportStream";
import { ContinuityPanel } from "./components/ContinuityPanel";
import { sanitizeUiCue, sanitizeVisibleResponse } from "@/features/ai/responseSanitizer";

type SupportStyle = "calm_reflective" | "gentle_grounding" | "structured_reset" | "action_forward";
const knownBrainIds = new Set<string>(MOMENT_BRAIN_IDS);
const knownAudiences = new Set<string>(BRAIN_AUDIENCES);
const knownCategories = new Set<string>(BRAIN_CATEGORIES);
const knownBlockTypes = new Set<string>(OPERATIONAL_BLOCK_TYPES);
const safeLabel = (id: MomentBrainId) => ROUTE_LABELS[id] ?? id.replace(/_brain$/, "").split("_").map((c) => c[0].toUpperCase() + c.slice(1)).join(" ");
function toSafeRoute(raw: unknown): MomentRouteResult | null { if (!raw || typeof raw !== "object") return null; const route = raw as Record<string, unknown>; const id = typeof route.primaryBrainId === "string" ? route.primaryBrainId : null; if (!id || !knownBrainIds.has(id)) return null; const brainId = id as MomentBrainId; return { primaryBrainId:brainId,supportingBrainIds:[],routeLabel:typeof route.routeLabel==="string"?route.routeLabel:safeLabel(brainId),routePath:typeof route.routePath==="string"?route.routePath:"/check-in",reason:typeof route.reason==="string"?route.reason:"Moment selected support.",confidence:"medium",audience:typeof route.audience === "string" && knownAudiences.has(route.audience)?route.audience as BrainAudience:"all",category:typeof route.category === "string" && knownCategories.has(route.category)?route.category as BrainCategory:"emotion"}; }
function toSafeBlocks(blocks: unknown, reflection: string, tinyNextStep: string): OperationalBlock[] { return Array.isArray(blocks) ? blocks.filter((b): b is Record<string, unknown> => !!b && typeof b === "object").map((b)=>({ type: typeof b.type === "string" && knownBlockTypes.has(b.type) ? b.type : "support", text: typeof b.text === "string" ? b.text : "" })).filter((b)=>b.text.length>0) as OperationalBlock[] : [{ type:"reflection", text:reflection},{type:"tiny_step",text:tinyNextStep}];}
function toSafeResponse(raw: unknown, route: MomentRouteResult): MomentCheckInResponse | null { if (!raw || typeof raw !== "object") return null; const response = raw as Record<string, unknown>; const reflection = typeof response.reflection === "string" ? response.reflection : "Thanks for sharing this moment."; const tinyNextStep = typeof response.tinyNextStep === "string" ? response.tinyNextStep : "Take one small step."; const steps = Array.isArray(response.steps) ? response.steps.filter((s): s is string => typeof s === "string") : []; return sanitizeVisibleResponse({ routeLabel: route.routeLabel, routePath: route.routePath, reflection, tinyNextStep, whyThisRoute: typeof response.whyThisRoute === "string" ? response.whyThisRoute : "", continueLabel: "If you want, keep going", steps, supportiveNote: typeof response.supportiveNote === "string" ? response.supportiveNote : "Small steps count.", followUpActions: [], blocks: toSafeBlocks(response.blocks, reflection, tinyNextStep) }); }

export function DashboardClient({ greeting, memory, plan, usage }: { greeting: MomentGreetingOutput; memory: MomentMemorySnapshot | null; plan: MomentPlan; usage: { usedMoments: number; momentLimit: number | null; remainingMoments: number | null } }) {
  const emptyMemory: MomentMemorySnapshot = { entries: [], threads: [], goals: [], tinyWins: [], suggestions: [], supportPatterns: [], supportEffectivenessNotes: [] };
  const [memoryState,setMemoryState]=useState(memory ?? emptyMemory);
  const [savedNote,setSavedNote]=useState<string | null>(null);
  const [inlineError,setInlineError]=useState<string | null>(null);
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [text,setText]=useState("");
  const [result,setResult]=useState<{route:MomentRouteResult;response:MomentCheckInResponse}|null>(null);
  const [continuitySummary,setContinuitySummary]=useState<string | null>(null);
  const [adaptiveCue,setAdaptiveCue]=useState<string | null>(null);
  const [supportStyle]=useState<SupportStyle>("calm_reflective");
  const [threadId]=useState(`thread_${Date.now().toString(36)}`);
  const personalizedOpening=useMemo(()=> memoryState.threads[0]?.summary ? `I can hold continuity with what you shared before: ${memoryState.threads[0].summary.toLowerCase()}.` : "You can start anywhere — one sentence is enough.",[memoryState]);

  async function submit(){
    setInlineError(null);
    setSavedNote(null);
    setIsSubmitting(true);
    try {
    const res=await fetch('/api/ai/check-in',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,selectedStates:[],conversationState:{threadId,selectedEmotionalContext:[],inferredSupportStyle:supportStyle}})});
    if(!res.ok){
      if (res.status === 402) {
        setInlineError("You’ve reached your monthly Moment limit. You can still read your saved moments.");
        return;
      }
      setInlineError("Couldn’t save right now. Your words are still here.");
      return;
    }
    const data=await res.json();
    const route=toSafeRoute(data.route);
    if(!route){ setInlineError("We hit a pause. Please try once more."); return; }
    const response=toSafeResponse(data.response,route);
    if(!response){ setInlineError("We hit a pause. Please try once more."); return; }
    setResult({route,response});
    setContinuitySummary(data.response?.continuitySummary ?? null);
    const timingMode = typeof data.response?.supportTimingMode === "string" ? data.response.supportTimingMode : null;
    const styleCue = sanitizeUiCue(typeof data.response?.supportStyleAdaptationCue === "string" ? data.response.supportStyleAdaptationCue : null);
    const blendCue = route.primaryBrainId === "tutor_brain"
      ? "Moment is blending emotional support with practical decomposition right now."
      : route.primaryBrainId === "social_boundary_brain"
        ? "Moment is balancing emotional processing with boundary clarity."
        : null;
    const pacingCue = timingMode === "gentle_presence" ? "I’ll keep this slower and lighter while we get our footing." : null;
    setAdaptiveCue(sanitizeUiCue(pacingCue ?? blendCue ?? styleCue));
    if(data.memorySnapshot && typeof data.memorySnapshot === "object") setMemoryState(data.memorySnapshot);
    setSavedNote("Saved quietly.");
    } catch {
      setInlineError("Something interrupted this check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <div className="mx-auto max-w-3xl space-y-6 py-5 sm:space-y-7">
    <section className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
      <p>{usage.momentLimit === null ? "Moments are here whenever you need them." : `${usage.usedMoments}/${usage.momentLimit} moments used this month.`}</p>
      <Link href="/settings?tab=billing" className="mt-1 inline-block text-xs text-violet-200/80 underline">Manage plan</Link>
    </section>
    <GreetingSurface headline={greeting.headline} opening={personalizedOpening} text={text} onText={setText} />
    <IntakeComposer onSubmit={submit} disabled={text.length < 3 || isSubmitting} savedNote={savedNote} />
    {inlineError ? <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{inlineError}</p> : null}
    <ContinuityPanel summary={continuitySummary ?? memoryState.threads[0]?.summary ?? null} cue={result ? "We can stay with this and adjust as your needs change." : null} />
    <SupportStream result={result} adaptiveCue={adaptiveCue} />
  </div>;
}
