import Link from "next/link";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";
import { MomentActionCard } from "@/components/moment/MomentActionCard";
import { MomentRouteBadge } from "@/components/moment/MomentRouteBadge";
import { normalizeResponse } from "@/features/moment/orchestration/engine";
import { MomentumBuilderBlock } from "@/components/moment/MomentumBuilderBlock";
import { RouteTransitionBlock } from "@/components/moment/RouteTransitionBlock";
import { RecoveryPromptBlock } from "@/components/moment/RecoveryPromptBlock";
import { motionTokens } from "@/features/ui/momentTheme";

export function MomentResponseCard({ route, response, quickActions }: { route: MomentRouteResult; response: MomentCheckInResponse; quickActions: { label: string; href: string }[] }) {
  const normalized = normalizeResponse({ reflection: response.reflection, tinyNextStep: response.tinyNextStep, steps: response.steps ?? [], supportiveNote: response.supportiveNote ?? "Keep it light and specific." });

  return <MomentActionCard><MomentRouteBadge route={route} /><div className={`mt-4 space-y-3 ${motionTokens.cardTransition}`}>{response.blocks?.map((block, idx) => {
    if (block.type === "momentum_builder") return <MomentumBuilderBlock key={`${block.type}-${idx}`} text={block.text} />;
    if (block.type === "route_transition") return <RouteTransitionBlock key={`${block.type}-${idx}`} text={block.text} />;
    if (block.type === "recovery_prompt") return <RecoveryPromptBlock key={`${block.type}-${idx}`} text={block.text} />;
    return null;
  })}<section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.16em] text-violet-200/70">Current reflection</p><p className="mt-2 text-slate-100">{normalized.blocks[0]?.body}</p></section></div><div className="mt-4 flex flex-wrap gap-2">{quickActions.map((action) => <Link key={action.href + action.label} href={action.href} className="min-h-10 rounded-full border border-white/20 px-3.5 py-2 text-sm text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100">{action.label}</Link>)}</div></MomentActionCard>;
}
