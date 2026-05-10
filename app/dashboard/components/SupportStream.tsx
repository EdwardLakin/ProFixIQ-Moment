import { MomentCard } from "@/components/moment/MomentCard";
import type { CheckInResult } from "./types";

export function SupportStream({ result }: { result: CheckInResult | null }) {
  if (!result) return null;
  return (
    <MomentCard>
      <p className="text-xs uppercase tracking-[0.18em] text-violet-100/70">What I’m hearing</p>
      <p className="mt-3 text-sm text-[#f5edff]">{result.response.reflection}</p>
      <p className="mt-2 text-sm text-[#d8d0ee]">{result.response.whyThisRoute}</p>
      <p className="mt-2 text-sm text-[#f3ebdb]">A gentle next step: {result.response.tinyNextStep}</p>
      <details className="mt-3 text-sm text-[#d6caef]">
        <summary>Keep going with this</summary>
        <div className="mt-2 space-y-1">
          {result.response.steps.map((step) => (
            <p key={step}>{step}</p>
          ))}
        </div>
      </details>
    </MomentCard>
  );
}
