import type { MomentCheckInResponse } from "@/features/ai/types";

export function SupportToolInline({ response }: { response: MomentCheckInResponse }) {
  if (!response.supportTools || response.supportTools.length === 0) return null;
  return <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
    <p className="text-xs leading-6 text-[#ddd0f3]">I can offer a few gentle options if that would help.</p>
  </div>;
}
