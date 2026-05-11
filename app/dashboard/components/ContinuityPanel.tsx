import { MomentCard } from "@/components/moment/MomentCard";

export function ContinuityPanel({ summary, cue }: { summary: string | null; cue: string | null }) {
  if (!summary && !cue) {
    return (
      <MomentCard className="p-5 sm:p-6">
        <p className="text-sm text-[#efe8ff]">Start wherever it feels easiest.</p>
      </MomentCard>
    );
  }
  return (
    <MomentCard className="p-5 sm:p-6">
      {summary ? <p className="text-sm text-[#efe8ff]">We can pick up from there, or start fresh.</p> : null}
      {cue ? <p className="mt-2 text-sm text-[#d8d0ee]">You can keep going from what you shared, or tell me what changed.</p> : null}
    </MomentCard>
  );
}
