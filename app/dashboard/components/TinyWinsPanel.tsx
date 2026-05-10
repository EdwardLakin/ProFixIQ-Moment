import { MomentCard } from "@/components/moment/MomentCard";

export function TinyWinsPanel({ win }: { win: string }) {
  return (
    <MomentCard>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">Tiny wins</p>
      <p className="mt-2 text-sm text-[#efe8ff]">{win}</p>
    </MomentCard>
  );
}
