import { MomentCard } from "@/components/moment/MomentCard";

export function ContinuityPanel({ summary, cue }: { summary: string | null; cue: string | null }) {
  if (!summary && !cue) return null;
  return (
    <MomentCard className="p-5 sm:p-6">
      {summary ? <p className="text-sm text-[#efe8ff]">{summary}</p> : null}
      {cue ? <p className="mt-2 text-sm text-[#d8d0ee]">{cue}</p> : null}
    </MomentCard>
  );
}
