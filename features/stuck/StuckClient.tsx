"use client";

import { useState } from "react";
import { CarriedContextCard } from "@/components/moment/CarriedContextCard";
import { MomentBadge } from "@/components/moment/MomentBadge";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentResponseCard } from "@/components/moment/MomentResponseCard";
import { MomentTextarea } from "@/components/moment/MomentTextarea";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";

type LegacyStuckResult = { summary: string; likely_block: string; tiny_steps: string[]; encouragement: string; five_minute_restart: string };

type StuckResponseEnvelope = { response: MomentCheckInResponse; route?: MomentRouteResult };

const defaultStuckRoute: MomentRouteResult = { primaryBrainId: "task_start_brain", supportingBrainIds: [], routeLabel: "Task Start", routePath: "/stuck", reason: "Stuck reset requested.", confidence: "high", audience: "all", category: "task" };

function normalizeLegacyResponse(result: LegacyStuckResult): MomentCheckInResponse {
  return {
    reflection: result.summary,
    tinyNextStep: result.tiny_steps[0] ?? result.five_minute_restart,
    steps: result.tiny_steps,
    supportiveNote: result.encouragement,
    followUpActions: [{ label: "Return to Moment", href: "/dashboard" }],
    blocks: [
      { type: "recovery_prompt", text: result.summary },
      { type: "momentum_builder", text: `Likely block: ${result.likely_block}` },
      { type: "route_transition", text: result.five_minute_restart },
    ],
  };
}

export function StuckClient({ sessions, searchParams }: { sessions: Array<{ id: string; task_text: string; status: string }>; searchParams?: { from?: string; contextId?: string; summary?: string } }) {
  const [result, setResult] = useState<StuckResponseEnvelope | null>(null);
  const [sessionState, setSessionState] = useState(sessions);

  async function onSubmit(formData: FormData) {
    const res = await fetch("/api/ai/stuck", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData.entries())) });
    const data = await res.json() as StuckResponseEnvelope | LegacyStuckResult;
    if ("response" in data) {
      setResult({ response: data.response, route: data.route ?? defaultStuckRoute });
      return;
    }
    setResult({ response: normalizeLegacyResponse(data), route: defaultStuckRoute });
  }

  return <div className="space-y-4"><CarriedContextCard searchParams={searchParams} /><MomentCard><form action={onSubmit} className="space-y-3"><MomentTextarea name="task_text" required placeholder={searchParams?.summary ? `Start from carried context: ${searchParams.summary}` : "What task are you stuck on?"} defaultValue={searchParams?.summary ?? ""} /><MomentTextarea name="hardest_part" rows={2} placeholder="Hardest part" /><MomentTextarea name="emotional_state" rows={2} placeholder="How are you feeling?" /><MomentButton type="submit">Get tiny steps</MomentButton></form></MomentCard>{result ? <MomentResponseCard route={result.route ?? defaultStuckRoute} response={result.response} quickActions={result.response.followUpActions ?? []} /> : null}<MomentCard><h3 className="font-semibold">Recent sessions</h3><div className="mt-3 space-y-2">{sessionState.length===0 ? <p className="text-sm text-slate-400">No recent resets yet. Your first stuck reset will appear here.</p> : sessionState.map((s) => <div key={s.id} className="flex items-center justify-between gap-2"><span>{s.task_text}</span><div className="flex items-center gap-2"><MomentBadge>{s.status}</MomentBadge><button className="text-xs text-violet-200" onClick={async ()=>{await fetch(`/api/stuck-sessions/${s.id}/status`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:"started"})});setSessionState((prev)=>prev.map((it)=>it.id===s.id?{...it,status:"started"}:it));}}>started</button><button className="text-xs text-violet-200" onClick={async ()=>{await fetch(`/api/stuck-sessions/${s.id}/status`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:"still_stuck"})});setSessionState((prev)=>prev.map((it)=>it.id===s.id?{...it,status:"still_stuck"}:it));}}>still stuck</button><button className="text-xs text-violet-200" onClick={async ()=>{await fetch(`/api/stuck-sessions/${s.id}/status`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:"done"})});setSessionState((prev)=>prev.map((it)=>it.id===s.id?{...it,status:"done"}:it));}}>done</button></div></div>)}</div></MomentCard></div>;
}
