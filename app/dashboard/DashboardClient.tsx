"use client";

import Link from "next/link";
import { useState } from "react";
import { MomentButton } from "@/components/moment/MomentButton";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentTextarea } from "@/components/moment/MomentTextarea";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";
import type { MomentGreetingOutput } from "@/features/moment/greeting/types";

const supportChips = ["School feels overwhelming", "Starting is hard", "Math gets frustrating", "Friend drama pulls me in", "I shut down when confused", "I want calmer restarts", "I need help with boundaries", "I want tiny steps"];

export function DashboardClient({ greeting }: { greeting: MomentGreetingOutput }) {
  const [text, setText] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [result, setResult] = useState<{ route: MomentRouteResult; response: MomentCheckInResponse } | null>(null);

  async function submit() {
    const res = await fetch("/api/ai/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, selectedStates }) });
    if (!res.ok) return;
    const data = await res.json() as { route: MomentRouteResult; response: MomentCheckInResponse };
    setResult(data);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_14%_0%,rgba(244,200,255,0.14),transparent_38%),radial-gradient(circle_at_88%_0%,rgba(147,197,253,0.15),transparent_36%),linear-gradient(140deg,#1a1427,#111925_58%,#1a2238)] p-6 shadow-[0_45px_120px_-65px_rgba(232,121,249,0.8)] sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#e8dbff]/75">{greeting.headline}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f7efe3] sm:text-4xl">Tell Moment what&apos;s going on right now.</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#d9d8e8]">Moment routes this internally and gives you one tiny next step.</p>

        <MomentTextarea rows={6} value={text} onChange={(event) => setText(event.target.value)} placeholder="Write what this moment feels like. You can be messy and honest." />

        <div className="mt-4 flex flex-wrap gap-2">{supportChips.map((chip) => <button key={chip} type="button" onClick={() => setSelectedStates((curr) => curr.includes(chip) ? curr.filter((value) => value !== chip) : [...curr, chip])} className={`rounded-full px-3 py-1.5 text-xs transition ${selectedStates.includes(chip) ? "bg-[#d7ccff] text-[#271d3f]" : "bg-white/8 text-[#e5def2] ring-1 ring-white/15 hover:bg-white/14"}`}>{chip}</button>)}</div>

        <div className="mt-5 flex items-center justify-end">
          <MomentButton onClick={submit} disabled={text.length < 3}>Find my next step</MomentButton>
        </div>
      </section>

      {result ? (
        <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_-55px_rgba(129,140,248,0.75)]">
          <p className="text-xs uppercase tracking-[0.16em] text-violet-100/70">{result.response.whyThisRoute}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#f8f1e7]">{result.response.routeLabel}</h3>
          <p className="mt-3 text-[#dbd9e8]">{result.response.reflection}</p>
          <p className="mt-3 rounded-2xl bg-black/20 p-3 text-sm text-[#f8f1e7] ring-1 ring-white/10">Tiny next step: {result.response.tinyNextStep}</p>
          <Link href={result.response.routePath} className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-violet-100 ring-1 ring-white/20 hover:bg-white/15">{result.response.continueLabel}</Link>
        </section>
      ) : null}

      <MomentCard className="border-white/8 bg-white/[0.02]">
        <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">Need something specific?</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#d2cee5]">
          <Link href="/check-in" className="hover:text-white">Check In</Link>
          <Link href="/stuck" className="hover:text-white">Stuck Restart</Link>
          <Link href="/math-reset" className="hover:text-white">Math Reset</Link>
          <Link href="/drama-pause" className="hover:text-white">Boundary Pause</Link>
        </div>
      </MomentCard>
    </div>
  );
}
