"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

const stateMap = {
  overwhelmed: ["Overwhelmed", "Too many thoughts", "Anxious", "Tired"],
  stuck: ["Can’t start", "Avoiding homework", "Shutting down"],
  math: ["Math makes no sense", "Avoiding homework"],
  social: ["Friend drama", "Embarrassed"],
};

const stateStyles = {
  default: {
    shell: "border-white/10",
    glow: "from-violet-400/12 to-sky-300/8",
    badge: "border-violet-200/30 bg-violet-200/10 text-violet-100",
    response: "border-violet-200/20",
    rail: "Recovery + momentum",
  },
  overwhelmed: {
    shell: "border-amber-300/20",
    glow: "from-amber-300/16 to-rose-300/10",
    badge: "border-amber-300/40 bg-amber-300/12 text-amber-100",
    response: "border-amber-300/25",
    rail: "Recovery + grounding",
  },
  stuck: {
    shell: "border-slate-200/20",
    glow: "from-slate-300/14 to-violet-300/10",
    badge: "border-slate-200/35 bg-slate-200/10 text-slate-100",
    response: "border-slate-200/25",
    rail: "Recovery + restart",
  },
  math: {
    shell: "border-sky-300/20",
    glow: "from-sky-300/16 to-cyan-300/10",
    badge: "border-sky-300/35 bg-sky-300/10 text-sky-100",
    response: "border-sky-300/25",
    rail: "Recovery + focus",
  },
  social: {
    shell: "border-fuchsia-300/20",
    glow: "from-fuchsia-300/15 to-rose-300/12",
    badge: "border-fuchsia-300/35 bg-fuchsia-300/10 text-fuchsia-100",
    response: "border-fuchsia-300/25",
    rail: "Recovery + boundaries",
  },
};

export function DashboardClient() {
  const [text, setText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [result, setResult] = useState<{ route: MomentRouteResult; response: MomentCheckInResponse } | null>(null);
  const environment = useMomentEnvironment();

  const visualState = useMemo(() => {
    if (selectedStates.some((chip) => stateMap.math.includes(chip))) return "math";
    if (selectedStates.some((chip) => stateMap.social.includes(chip))) return "social";
    if (selectedStates.some((chip) => stateMap.stuck.includes(chip))) return "stuck";
    if (selectedStates.some((chip) => stateMap.overwhelmed.includes(chip))) return "overwhelmed";
    return "default";
  }, [selectedStates]);

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
  const styles = stateStyles[visualState];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <MomentPromptCard className={`relative overflow-hidden border ${styles.shell}`}>
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.glow} opacity-70`} />
          <div className="relative">
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-violet-100/75">Main check-in</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What feels hardest right now?</h2>
            <MomentTextarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Say what feels heavy. You don’t need perfect words." />
            <div className="mt-3 flex flex-wrap gap-2">{chips.map((chip) => <MomentStateChip key={chip} label={chip} selected={selectedStates.includes(chip)} onClick={() => setSelectedStates((curr) => curr.includes(chip) ? curr.filter((value) => value !== chip) : [...curr, chip])} />)}</div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${styles.badge}`}>Current state: {visualState}</span>
              <MomentButton onClick={submit} disabled={text.length < 3} className="w-full sm:w-auto">Help me reset</MomentButton>
            </div>
          </div>
        </MomentPromptCard>

        {warnings.length > 0 ? <MomentCard><p className="text-sm text-amber-100">Moment saved your reset locally, but cloud sync had trouble. You can keep going.</p></MomentCard> : null}

        {result ? <div className={`rounded-[1.6rem] border bg-white/[0.02] p-1.5 ${styles.response}`}><MomentResponseCard route={result.route} response={result.response} quickActions={quickActions} /></div> : null}

        <MomentCard className="border-white/10 bg-white/[0.025]">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-violet-100/75">Secondary routes</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{[{ href: "/check-in", label: "Check in" }, { href: "/stuck", label: "Stuck" }, { href: "/math-reset", label: "Math reset" }, { href: "/drama-pause", label: "Drama pause" }].map((item) => <Link key={item.href} href={item.href} className="min-h-10 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100">{item.label}</Link>)}</div>
        </MomentCard>
      </div>

      <div>
        <p className={`mb-2 inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${styles.badge}`}>{styles.rail}</p>
        <MomentumRail state={environment.state} />
      </div>
    </div>
  );
}
