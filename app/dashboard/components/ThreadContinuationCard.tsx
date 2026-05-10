import { MomentCard } from "@/components/moment/MomentCard";

export function ThreadContinuationCard({ thread }: { thread: string }) {
  return (
    <MomentCard>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">Active thread</p>
      <p className="mt-2 text-sm text-[#efe8ff]">Want to continue where we left off?</p>
      <p className="mt-1 text-sm text-[#d9d2ec]">{thread}</p>
    </MomentCard>
  );
}
