"use client";

import { useState } from "react";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentPromptCard } from "@/components/moment/MomentPromptCard";
import { MomentResponseCard } from "@/components/moment/MomentResponseCard";
import { MomentStateChip } from "@/components/moment/MomentStateChip";
import { MomentSurface } from "@/components/moment/MomentSurface";
import { MomentTextarea } from "@/components/moment/MomentTextarea";
import { MomentumRail } from "@/components/moment/momentum/MomentumRail";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";
import { useMomentEnvironment } from "@/features/moment/context/hooks";
import { getAdaptiveQuickActions } from "@/features/moment/orchestration/engine";

const chips = ["Overwhelmed", "Avoiding homework", "Math makes no sense", "Too many thoughts", "Friend drama", "Can’t start", "Shutting down", "Anxious", "Tired", "Embarrassed"];

export function DashboardClient() {
  const [text, setText] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [result, setResult] = useState<{ route: MomentRouteResult; response: MomentCheckInResponse } | null>(null);
  const environment = useMomentEnvironment();

  async function submit() {
    const res = await fetch("/api/ai/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, selectedStates }) });
    if (!res.ok) return;
    const data = await res.json();
    setResult(data);
    environment.trackRoute("dashboard", data.route.routePath);
    environment.setRecoveryContext(data.response.reflection, "dashboard");
    environment.upsertLoop({ id: data.route.primaryBrain, label: data.route.reason, routePath: data.route.routePath, tinyStep: data.response.tinyNextStep, updatedAt: new Date().toISOString() });
    if (selectedStates.includes("Shutting down")) environment.setEmotionalState("shutdown");
    if (data.response.tinyNextStep) environment.setSuccessfulRestart();
  }

  const quickActions = result ? getAdaptiveQuickActions(result.route.primaryBrain, environment.state) : [];

  return <MomentSurface><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="space-y-6"><MomentPromptCard><h2 className="text-3xl font-semibold tracking-tight">What feels hardest right now?</h2><p className="mt-2 text-slate-300">Small steps when everything feels too big.</p><MomentTextarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Say what feels heavy. You don’t need perfect words." /><div className="flex flex-wrap gap-2">{chips.map((chip) => <MomentStateChip key={chip} label={chip} selected={selectedStates.includes(chip)} onClick={() => setSelectedStates((curr) => curr.includes(chip) ? curr.filter((value) => value !== chip) : [...curr, chip])} />)}</div><div className="flex flex-wrap gap-2"><MomentButton onClick={submit} disabled={text.length < 3}>Help me reset</MomentButton><MomentButton onClick={submit} className="bg-white/10 text-[#f8f1e7]">I just need to check in</MomentButton></div></MomentPromptCard>{result ? <MomentResponseCard route={result.route} response={result.response} quickActions={quickActions} /> : null}</div><MomentumRail state={environment.state} /></div></MomentSurface>;
}
