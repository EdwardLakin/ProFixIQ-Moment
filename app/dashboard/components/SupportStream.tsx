import { SupportFeedbackInline } from "./SupportFeedbackInline";
import { SupportToolInline } from "./SupportToolInline";
import { MomentCard } from "@/components/moment/MomentCard";
import type { CheckInResult } from "./types";

export function SupportStream({ result, adaptiveCue }: { result: CheckInResult | null; adaptiveCue: string | null }) {
  if (!result) return null;

  const firstStep = result.response.steps.find((step) => step.trim().toLowerCase() !== result.response.tinyNextStep.trim().toLowerCase());

  return (
    <MomentCard className="p-4 sm:p-6">
      <div className="space-y-4">
        {adaptiveCue ? <p className="text-xs leading-6 text-[#d8cfff]">{adaptiveCue}</p> : null}
        <p className="text-sm leading-7 text-[#f5edff]">{result.response.reflection}</p>
        {result.response.tinyNextStep ? <p className="text-sm leading-7 text-[#ece3ff]">{result.response.tinyNextStep}</p> : null}
        {firstStep ? <p className="text-sm leading-7 text-[#ddd0f3]">{firstStep}</p> : null}
      </div>
      <SupportToolInline response={result.response} />
      <div className="mt-4"><SupportFeedbackInline /></div>
    </MomentCard>
  );
}
