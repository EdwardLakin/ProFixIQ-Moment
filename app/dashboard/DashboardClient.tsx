"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MomentPlan } from "@/lib/plans";
import type { MomentCheckInResponse, MomentRouteResult, OperationalBlock } from "@/features/ai/types";
import type { BrainAudience, BrainCategory, MomentBrainId } from "@/features/ai/brains/types";
import type { MomentGreetingOutput } from "@/features/moment/greeting/types";
import type { MomentMemorySnapshot } from "@/features/moment/memory/types";
import { GreetingSurface } from "./components/GreetingSurface";
import { IntakeComposer } from "./components/IntakeComposer";
import { ClarificationFlow } from "./components/ClarificationFlow";
import { SupportStream } from "./components/SupportStream";
import { ContinuityPanel } from "./components/ContinuityPanel";
import { TinyWinsPanel } from "./components/TinyWinsPanel";
import { ThreadContinuationCard } from "./components/ThreadContinuationCard";
import { SupportFocusCard } from "./components/SupportFocusCard";

type SupportStyle = "calm_reflective" | "gentle_grounding" | "structured_reset" | "action_forward";
const knownBrainIds: MomentBrainId[] = ["school_overwhelm_brain","math_reset_brain","social_boundary_brain","task_start_brain","emotional_reset_brain","confidence_repair_brain","work_stress_brain","finance_clarity_brain","relationship_reflection_brain","household_overload_brain","life_admin_brain","decision_reset_brain","safety_support_brain","grief_support_brain","emotional_presence_brain","loneliness_support_brain","overwhelm_grounding_brain"];
const knownAudiences: BrainAudience[] = ["teen","adult","all"];
const knownCategories: BrainCategory[] = ["school","math","social","task","emotion","confidence","work","money","relationship","household","life_admin","decision","safety","grief","loneliness","overwhelm"];
const safeLabel=(id:string)=>id.replace(/_brain$/,"").split("_").map((c)=>c[0].toUpperCase()+c.slice(1)).join(" ");
function toSafeRoute(raw: unknown): MomentRouteResult | null { if (!raw || typeof raw !== "object") return null; const route = raw as Record<string, unknown>; const id = typeof route.primaryBrainId === "string" ? route.primaryBrainId : null; if (!id || !knownBrainIds.includes(id as MomentBrainId)) return null; return { primaryBrainId:id as MomentBrainId,supportingBrainIds:[],routeLabel:typeof route.routeLabel==="string"?route.routeLabel:safeLabel(id),routePath:typeof route.routePath==="string"?route.routePath:"/check-in",reason:typeof route.reason==="string"?route.reason:"Moment selected support.",confidence:"medium",audience:knownAudiences.includes(route.audience as BrainAudience)?route.audience as BrainAudience:"all",category:knownCategories.includes(route.category as BrainCategory)?route.category as BrainCategory:"emotion"}; }
function toSafeBlocks(blocks: unknown, reflection: string, tinyNextStep: string): OperationalBlock[] { return Array.isArray(blocks) ? blocks.filter((b): b is Record<string, unknown> => !!b && typeof b === "object").map((b)=>({ type: typeof b.type === "string" ? b.type : "support", text: typeof b.text === "string" ? b.text : "" })).filter((b)=>b.text.length>0) as OperationalBlock[] : [{ type:"reflection", text:reflection},{type:"tiny_step",text:tinyNextStep}];}
function toSafeResponse(raw: unknown, route: MomentRouteResult): MomentCheckInResponse | null { if (!raw || typeof raw !== "object") return null; const response = raw as Record<string, unknown>; const reflection = typeof response.reflection === "string" ? response.reflection : "Thanks for sharing this moment."; const tinyNextStep = typeof response.tinyNextStep === "string" ? response.tinyNextStep : "Take one small step."; return { routeLabel: route.routeLabel, routePath: route.routePath, reflection, tinyNextStep, whyThisRoute: typeof response.whyThisRoute === "string" ? response.whyThisRoute : route.reason, continueLabel: "Continue gently", steps: [tinyNextStep], supportiveNote: "Small steps count.", followUpActions: [], blocks: toSafeBlocks(response.blocks, reflection, tinyNextStep) }; }

export function DashboardClient({ greeting, memory, plan, usage }: { greeting: MomentGreetingOutput; memory: MomentMemorySnapshot | null; plan: MomentPlan; usage: { usedMoments: number; momentLimit: number | null; remainingMoments: number | null } }) {
  const emptyMemory: MomentMemorySnapshot = { entries: [], threads: [], goals: [], tinyWins: [], suggestions: [], supportPatterns: [], supportEffectivenessNotes: [] };
  const [memoryState,setMemoryState]=useState(memory ?? emptyMemory);
  const [savedNote,setSavedNote]=useState<string | null>(null);
  const [inlineError,setInlineError]=useState<string | null>(null);
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [text,setText]=useState("");
  const [result,setResult]=useState<{route:MomentRouteResult;response:MomentCheckInResponse}|null>(null);
  const [continuitySummary,setContinuitySummary]=useState<string | null>(null);
  const [continuityCue,setContinuityCue]=useState<string | null>(null);
  const [supportStyle]=useState<SupportStyle>("calm_reflective");
  const [threadId]=useState(`thread_${Date.now().toString(36)}`);
  const personalizedOpening=useMemo(()=> memoryState.threads[0]?.summary ? `This seems connected to ${memoryState.threads[0].summary.toLowerCase()}.` : "We can take this one breath at a time.",[memoryState]);
  async function submit(){
    setInlineError(null);
    setSavedNote(null);
    setIsSubmitting(true);
    try {
    const res=await fetch('/api/ai/check-in',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,selectedStates:[],conversationState:{threadId,selectedEmotionalContext:[],inferredSupportStyle:supportStyle}})});
    if(!res.ok){
      if (res.status === 402) {
        setInlineError("You’ve reached your monthly Moment limit. You can still view your journal and saved support until your limit resets.");
        return;
      }
      setInlineError("Couldn’t save that check-in right now. Your words are still here—try again in a moment.");
      return;
    }
    const data=await res.json();
    const route=toSafeRoute(data.route);
    if(!route){ setInlineError("We had trouble shaping support, but we can still stay with this gently."); return; }
    const response=toSafeResponse(data.response,route);
    if(!response){ setInlineError("Response came back incomplete. Please try once more."); return; }
    setResult({route,response});
    setContinuitySummary(data.response?.continuitySummary ?? null);
    setContinuityCue(data.response?.continuityCue ?? null);
    if(data.memorySnapshot && typeof data.memorySnapshot === "object") setMemoryState(data.memorySnapshot);
    setSavedNote((Array.isArray(data.warnings) && data.warnings.length > 0) ? "Support is ready. Some memory details may sync in a moment." : "Saved quietly to your private journal.");
    } catch {
      setInlineError("Something interrupted this check-in. Your text is safe—please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <div className="mx-auto max-w-4xl space-y-5 py-4">
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
      <p className="font-medium uppercase text-violet-100">Plan: {plan}</p>
      <p className="mt-1">{usage.momentLimit === null ? "Moments are available whenever you need them." : `${usage.usedMoments}/${usage.momentLimit} Moments used this month.`}</p>
      {usage.momentLimit !== null ? <p className="text-xs text-slate-300">{usage.remainingMoments === 0 ? "You’ve reached your monthly Moment limit. You can still view your journal and saved support this month." : `${usage.remainingMoments} Moments left this month.`}</p> : null}
      <Link href="/settings?tab=billing" className="mt-2 inline-block text-violet-200 underline">Manage plan</Link>
    </section>
    <GreetingSurface headline={greeting.headline} opening={personalizedOpening} text={text} onText={setText} />
    <IntakeComposer onSubmit={submit} disabled={text.length < 3 || isSubmitting} savedNote={savedNote} />
    {inlineError ? <p className="rounded-xl border border-rose-300/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{inlineError}</p> : null}
    <ClarificationFlow prompt={continuityCue} />
    <ContinuityPanel summary={continuitySummary} cue={continuityCue} />
    <SupportFocusCard focus={memoryState.supportPatterns[0]?.supportFocus ?? "As you check in over time, we’ll gently reflect patterns that may support you."} helped={memoryState.supportEffectivenessNotes[0]?.outcomeNote ?? "No pattern notes yet—each check-in helps us personalize your support."} />
    <ThreadContinuationCard thread={memoryState.threads[0]?.summary ?? "No active thread yet. When you revisit a topic, we’ll hold continuity here."} />
    <TinyWinsPanel win={memoryState.tinyWins[0]?.winNote ?? "No tiny win captured yet. Small progress still counts and can be saved here."} />
    <SupportStream result={result} />
  </div>;
}
