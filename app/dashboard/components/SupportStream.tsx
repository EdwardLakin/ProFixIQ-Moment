import { SupportFeedbackInline } from "./SupportFeedbackInline";
import { MomentCard } from "@/components/moment/MomentCard";
import type { CheckInResult } from "./types";

export function SupportStream({ result }: { result: CheckInResult | null }) {
  if (!result) return null;

  const firstStep = result.response.steps[0];

  return (
    <MomentCard className="p-5 sm:p-6">
      <div className="space-y-3">
        <p className="text-sm leading-6 text-[#f5edff]">{result.response.reflection}</p>
        <p className="text-sm leading-6 text-[#ece3ff]">{result.response.tinyNextStep}</p>
        {firstStep ? <p className="text-sm leading-6 text-[#ddd0f3]">{firstStep}</p> : null}
      </div>
      <p className="mt-4 text-xs text-[#cabfdf]">No pressure to do this perfectly. You can pause anytime.</p>
      <SupportFeedbackInline />
    </MomentCard>
  );
}
