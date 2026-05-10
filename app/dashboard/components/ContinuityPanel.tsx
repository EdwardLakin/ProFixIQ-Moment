import { MomentCard } from "@/components/moment/MomentCard";

export function ContinuityPanel({ summary, cue }: { summary: string | null; cue: string | null }) {
  if (!summary && !cue) return null;
  return (
    <MomentCard>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">Continuity</p>
      {summary ? <p className="mt-3 text-sm text-[#efe8ff]">{summary}</p> : null}
      {cue ? <p className="mt-2 text-sm text-[#d8d0ee]">{cue}</p> : null}
    </MomentCard>
  );
}
