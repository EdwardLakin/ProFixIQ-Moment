"use client";

import Link from "next/link";
import { useState } from "react";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentPromptCard } from "@/components/moment/MomentPromptCard";
import { MomentResponseCard } from "@/components/moment/MomentResponseCard";
import { MomentStateChip } from "@/components/moment/MomentStateChip";
import { MomentTextarea } from "@/components/moment/MomentTextarea";
import { MomentumRail } from "@/components/moment/momentum/MomentumRail";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";
import { useMomentEnvironment } from "@/features/moment/context/hooks";
import { getAdaptiveQuickActions } from "@/features/moment/orchestration/engine";

const chips = ["Overwhelmed", "Avoiding homework", "Math makes no sense", "Too many thoughts", "Friend drama", "Can’t start", "Shutting down", "Anxious", "Tired", "Embarrassed"];

export function DashboardClient() {
  const [text, setText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [result, setResult] = useState<{ route: MomentRouteResult; response: MomentCheckInResponse } | null>(null);
  const environment = useMomentEnvironment();

  async function submit() {
    const res = await fetch("/api/ai/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, selectedStates }) });
    if (!res.ok) return;
    const data = await res.json() as { route: MomentRouteResult; response: MomentCheckInResponse; warnings?: string[] };
    setWarnings(data.warnings ?? []);
    setResult(data);
    environment.trackRoute("dashboard", data.route.routePath);
    environment.setRecoveryContext(data.response.reflection, "dashboard");
    environment.upsertLoop({ id: data.route.primaryBrain, label: data.route.reason, routePath: data.route.routePath, tinyStep: data.response.tinyNextStep, updatedAt: new Date().toISOString() });
    if (selectedStates.includes("Shutting down")) environment.setEmotionalState("shutdown");
    if (data.response.tinyNextStep) environment.setSuccessfulRestart();
  }

  const quickActions = result ? getAdaptiveQuickActions(result.route.primaryBrain, environment.state) : [];

  return <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="space-y-5"><MomentPromptCard><h2 className="text-3xl font-semibold tracking-tight">What feels hardest right now?</h2><MomentTextarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Say what feels heavy. You don’t need perfect words." /><div className="flex flex-wrap gap-2">{chips.map((chip) => <MomentStateChip key={chip} label={chip} selected={selectedStates.includes(chip)} onClick={() => setSelectedStates((curr) => curr.includes(chip) ? curr.filter((value) => value !== chip) : [...curr, chip])} />)}</div><MomentButton onClick={submit} disabled={text.length < 3}>Help me reset</MomentButton></MomentPromptCard>{warnings.length > 0 ? <MomentCard><p className="text-sm text-amber-100">Moment saved your reset locally, but cloud sync had trouble. You can keep going.</p></MomentCard> : null}{result ? <MomentResponseCard route={result.route} response={result.response} quickActions={quickActions} /> : null}<MomentCard><h3 className="text-base font-semibold">Continue with a focused module</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{[{ href: "/check-in", label: "Check in" }, { href: "/stuck", label: "Stuck" }, { href: "/math-reset", label: "Math reset" }, { href: "/drama-pause", label: "Drama pause" }].map((item) => <Link key={item.href} href={item.href} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">{item.label}</Link>)}</div></MomentCard></div><MomentumRail state={environment.state} /></div>;
}
