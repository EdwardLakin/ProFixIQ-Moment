import type { MomentCheckInResponse } from "@/features/ai/types";

export function SupportToolInline({ response }: { response: MomentCheckInResponse }) {
  if (!response.supportTools || response.supportTools.length === 0) return null;
  return <div className="mt-4 flex flex-wrap gap-2">
    {response.supportTools.map((tool) => <button key={tool.id} className="rounded-full border border-white/15 px-3 py-1 text-xs text-[#efe8ff] hover:bg-white/10" type="button">{tool.label}</button>)}
  </div>;
}
