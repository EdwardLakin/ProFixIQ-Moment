"use client";

import { useMemo, useState } from "react";

type JournalEntry = { id: string; source: string | null; entry_date: string | null; title: string | null; content: string | null; input_summary: string | null; created_at: string };

function readableDate(input: string) {
  const date = new Date(input);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function JournalExperience({ rows, archiveAction }: { rows: JournalEntry[]; archiveAction: (formData: FormData) => void }) {
  const [tab, setTab] = useState<"all" | "manual" | "moments">("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => rows.filter((entry) => {
    if (tab === "manual" && entry.source !== "manual") return false;
    if (tab === "moments" && entry.source === "manual") return false;
    const haystack = `${entry.title ?? ""} ${entry.content ?? ""} ${entry.input_summary ?? ""}`.toLowerCase();
    return query ? haystack.includes(query.toLowerCase()) : true;
  }), [rows, tab, query]);

  const groups = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const row of filtered) {
      const key = row.entry_date ?? row.created_at.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), row]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return <section className="mt-6 space-y-4">
    <div className="flex flex-wrap items-center gap-2">
      {(["all", "manual", "moments"] as const).map((name) => <button key={name} type="button" onClick={() => setTab(name)} className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${tab === name ? "border-violet-300/80 bg-violet-300/15 text-violet-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/30"}`}>{name === "moments" ? "Moments" : name}</button>)}
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journal" className="ml-auto min-w-[220px] rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400" />
    </div>
    {groups.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-slate-300">No entries found for this filter.</p> : groups.map(([date, entries]) => <article key={date} className="rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 sm:p-5">
      <h3 className="text-sm font-medium text-slate-200">{readableDate(date)}</h3>
      <ul className="mt-3 space-y-3">
        {entries.map((entry) => <li key={entry.id} className="rounded-2xl border border-white/10 bg-[#0c1020]/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200/80">{entry.source === "manual" ? "Manual" : "Moment"}</p>
              <p className="text-xs text-slate-400">{new Date(entry.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
            </div>
            <form action={archiveAction} onSubmit={(event) => { if (!window.confirm("Archive this journal entry?") ) event.preventDefault(); }}>
              <input type="hidden" name="entryId" value={entry.id} />
              <button type="submit" className="text-xs text-slate-300 underline-offset-2 hover:text-white hover:underline">Archive</button>
            </form>
          </div>
          {entry.title ? <h4 className="mt-3 text-base font-medium text-slate-100">{entry.title}</h4> : null}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{entry.content ?? entry.input_summary ?? "Saved Moment memory."}</p>
        </li>)}
      </ul>
    </article>)}
  </section>;
}
