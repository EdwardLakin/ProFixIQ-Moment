import { SupportFeedbackInline } from "./SupportFeedbackInline";
import { SupportToolInline } from "./SupportToolInline";
import { MomentCard } from "@/components/moment/MomentCard";
import type { CheckInResult } from "./types";

export function SupportStream({ result, adaptiveCue }: { result: CheckInResult | null; adaptiveCue: string | null }) {
  if (!result) return null;

  const firstStep = result.response.steps[0];

  return (
    <MomentCard className="p-4 sm:p-6">
      <div className="space-y-4">
        {adaptiveCue ? <p className="text-xs leading-6 text-[#d8cfff]">{adaptiveCue}</p> : null}
        <p className="text-sm leading-7 text-[#f5edff]">{result.response.reflection}</p>
        <p className="text-sm leading-7 text-[#ece3ff]">{result.response.tinyNextStep}</p>
        {firstStep ? <p className="text-sm leading-7 text-[#ddd0f3]">{firstStep}</p> : null}
      </div>
      <SupportToolInline response={result.response} />
      <p className="mt-5 max-w-xl text-xs leading-6 text-[#cabfdf]">You can keep going from here, or pause and come back.</p>
      <div className="mt-4"><SupportFeedbackInline /></div>
    </MomentCard>
  );
}
