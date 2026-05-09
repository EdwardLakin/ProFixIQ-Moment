"use client";

import { useState } from "react";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentOperationalRail } from "@/components/moment/MomentOperationalRail";
import { MomentPromptCard } from "@/components/moment/MomentPromptCard";
import { MomentResponseCard } from "@/components/moment/MomentResponseCard";
import { MomentStateChip } from "@/components/moment/MomentStateChip";
import { MomentSurface } from "@/components/moment/MomentSurface";
import { MomentTextarea } from "@/components/moment/MomentTextarea";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";

const chips = ["Overwhelmed", "Avoiding homework", "Math makes no sense", "Too many thoughts", "Friend drama", "Can’t start", "Shutting down", "Anxious", "Tired", "Embarrassed"];

export function DashboardClient() {
  const [text, setText] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [result, setResult] = useState<{ route: MomentRouteResult; response: MomentCheckInResponse } | null>(null);

  async function submit() {
    const res = await fetch("/api/ai/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, selectedStates }) });
    if (!res.ok) return;
    setResult(await res.json());
  }

  return <MomentSurface><div className="grid gap-4 lg:grid-cols-[1fr_280px]"><div className="space-y-4"><MomentPromptCard><h2 className="text-2xl font-semibold">What feels hardest right now?</h2><MomentTextarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Say what feels heavy. You don’t need perfect words." /><div className="flex flex-wrap gap-2">{chips.map((chip) => <MomentStateChip key={chip} label={chip} selected={selectedStates.includes(chip)} onClick={() => setSelectedStates((curr) => curr.includes(chip) ? curr.filter((value) => value !== chip) : [...curr, chip])} />)}</div><div className="flex flex-wrap gap-2"><MomentButton onClick={submit} disabled={text.length < 3}>Help me reset</MomentButton><MomentButton onClick={submit} className="bg-white/10 text-[#f8f1e7]">I just need to check in</MomentButton></div></MomentPromptCard>{result ? <MomentResponseCard route={result.route} response={result.response} /> : null}</div><MomentOperationalRail /></div></MomentSurface>;
}
