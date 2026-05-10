import { MomentCard } from "@/components/moment/MomentCard";

export function SupportFocusCard({ focus, helped }: { focus: string; helped: string }) {
  return (
    <MomentCard>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">What tends to help</p>
      <p className="mt-2 text-sm text-[#f8f1e7]">{focus}</p>
      <p className="mt-2 text-sm text-[#d3cbe7]">A recent steadying move: {helped}</p>
    </MomentCard>
  );
}
