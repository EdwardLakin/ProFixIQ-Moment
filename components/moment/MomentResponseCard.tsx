import Link from "next/link";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";
import { MomentActionCard } from "@/components/moment/MomentActionCard";
import { MomentRouteBadge } from "@/components/moment/MomentRouteBadge";

export function MomentResponseCard({ route, response }: { route: MomentRouteResult; response: MomentCheckInResponse }) {
  return <MomentActionCard><MomentRouteBadge route={route} /><p className="mt-3 text-slate-200">{response.reflection}</p><p className="mt-3 text-lg font-semibold text-[#f8f1e7]">{response.tinyNextStep}</p><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">{response.steps.slice(0,4).map((step) => <li key={step}>{step}</li>)}</ul><div className="mt-4 flex flex-wrap gap-2">{response.followUpActions.map((action) => <Link key={action.href + action.label} href={action.href} className="rounded-full border border-white/15 px-3 py-2 text-sm">{action.label}</Link>)}</div></MomentActionCard>;
}
