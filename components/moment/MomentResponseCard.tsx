import Link from "next/link";
import type { MomentCheckInResponse, MomentRouteResult } from "@/features/ai/types";
import { MomentActionCard } from "@/components/moment/MomentActionCard";
import { MomentRouteBadge } from "@/components/moment/MomentRouteBadge";
import { normalizeResponse } from "@/features/moment/orchestration/engine";

export function MomentResponseCard({ route, response, quickActions }: { route: MomentRouteResult; response: MomentCheckInResponse; quickActions: { label: string; href: string }[] }) {
  const normalized = normalizeResponse({ reflection: response.reflection, tinyNextStep: response.tinyNextStep, steps: response.steps, supportiveNote: response.supportiveNote });

  return <MomentActionCard><MomentRouteBadge route={route} /><div className="mt-4 space-y-3">{normalized.blocks.map((block) => <section key={block.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3"><p className="text-xs uppercase tracking-[0.16em] text-violet-200/70">{block.title}</p><p className="mt-2 text-slate-200">{block.body}</p>{block.items ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">{block.items.map((item) => <li key={item}>{item}</li>)}</ul> : null}</section>)}</div><div className="mt-4 flex flex-wrap gap-2">{quickActions.map((action) => <Link key={action.href + action.label} href={action.href} className="rounded-full border border-white/15 px-3 py-2 text-sm">{action.label}</Link>)}</div></MomentActionCard>;
}
