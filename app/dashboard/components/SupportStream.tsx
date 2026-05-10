import { SupportFeedbackInline } from "./SupportFeedbackInline";
import { MomentCard } from "@/components/moment/MomentCard";
import type { CheckInResult } from "./types";

export function SupportStream({ result }: { result: CheckInResult | null }) {
  if (!result) return null;

  return (
    <MomentCard className="p-6 sm:p-7">
      <p className="text-sm text-[#f5edff]">{result.response.reflection}</p>
      <p className="mt-4 text-sm text-[#ece3ff]">{result.response.tinyNextStep}</p>
      <details className="mt-5 text-sm text-[#d6caef]">
        <summary>{result.response.continueLabel || "If you want, continue"}</summary>
        <div className="mt-3 space-y-3">
          {result.response.steps.slice(0, 1).map((step) => (
            <p key={step}>{step}</p>
          ))}
        </div>
      </details>
      <p className="mt-4 text-xs text-[#cabfdf]">No pressure to fix everything right now.</p>
      <SupportFeedbackInline />
    </MomentCard>
  );
}
