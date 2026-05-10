import { MomentCard } from "@/components/moment/MomentCard";

export function ThreadContinuationCard({ thread }: { thread: string }) {
  return (
    <MomentCard>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">Carry this forward</p>
      <p className="mt-2 text-sm text-[#efe8ff]">If you want, we can stay with what’s already been heavy.</p>
      <p className="mt-1 text-sm text-[#d9d2ec]">{thread}</p>
    </MomentCard>
  );
}
