"use client";

import { useState } from "react";

const options = [
  ["helpful", "Was this helpful?"],
  ["too_much", "Too much"],
  ["not_helpful", "Not helpful"],
  ["needed_more_support", "Needed more support"],
  ["needed_less_advice", "Needed less advice"],
] as const;

export function SupportFeedbackInline() {
  const [saved, setSaved] = useState<string | null>(null);
  async function send(signal: string) {
    setSaved(null);
    await fetch("/api/moment/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signal, pacingMismatch: signal === "too_much" || signal === "needed_less_advice", overprompting: signal === "too_much" }) });
    setSaved("Thanks — noted quietly.");
  }
  return <div className="mt-4 space-y-2">
    <p className="text-xs text-[#cfc4e4]">Optional feedback</p>
    <div className="flex flex-wrap gap-2">{options.map(([value, label]) => <button key={value} onClick={() => send(value)} className="rounded-full border border-white/15 px-3 py-1 text-xs text-[#efe8ff] hover:bg-white/10">{label}</button>)}</div>
    {saved ? <p className="text-xs text-[#b8e7c9]">{saved}</p> : null}
  </div>;
}
