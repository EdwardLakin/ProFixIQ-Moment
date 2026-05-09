import Link from "next/link";
import type { MomentCheckInResponse, MomentRouteResult, OperationalBlock } from "@/features/ai/types";
import { MomentActionCard } from "@/components/moment/MomentActionCard";
import { MomentRouteBadge } from "@/components/moment/MomentRouteBadge";
import { normalizeResponse } from "@/features/moment/orchestration/engine";
import { motionTokens } from "@/features/ui/momentTheme";

const knownBlockTypes = new Set(["reflection", "tiny_step", "route_transition", "grounding", "boundary_prompt", "decision_frame", "money_clarity", "work_reset", "relationship_reflection", "school_reset", "confidence_repair", "life_admin_sort", "momentum_builder", "recovery_prompt", "next_step", "steps", "support", "emotional_presence", "gentle_next_step"]);

function safeBlocks(blocks: MomentCheckInResponse["blocks"], normalizedReflection: string, tinyNextStep: string): OperationalBlock[] {
  if (Array.isArray(blocks) && blocks.length > 0) return blocks;
  return [{ type: "reflection", text: normalizedReflection }, { type: "tiny_step", text: tinyNextStep }];
}

export function MomentResponseCard({ route, response, quickActions }: { route: MomentRouteResult; response: MomentCheckInResponse; quickActions: { label: string; href: string }[] }) {
  const normalized = normalizeResponse({ reflection: response.reflection, tinyNextStep: response.tinyNextStep, steps: response.steps ?? [], supportiveNote: response.supportiveNote ?? "Keep it light and specific." });
  const blocks = safeBlocks(response.blocks, normalized.blocks[0]?.body ?? response.reflection, response.tinyNextStep);
  const emotionalRoutes = new Set(["grief_support_brain", "emotional_presence_brain", "loneliness_support_brain", "overwhelm_grounding_brain"]);
  const isEmotional = emotionalRoutes.has(route.primaryBrainId);

  return <MomentActionCard><MomentRouteBadge route={route} /><div className={`mt-4 ${isEmotional ? "space-y-4" : "space-y-3"} ${motionTokens.cardTransition}`}>{blocks.map((block, idx) => <section key={`${block.type}-${idx}`} className={`rounded-2xl border p-4 ${isEmotional ? "border-violet-100/20 bg-violet-100/[0.04]" : "border-white/12 bg-white/[0.03]"}`}><p className={`text-xs uppercase tracking-[0.16em] ${isEmotional ? "text-violet-100/80" : "text-violet-200/70"}`}>{knownBlockTypes.has(block.type) ? block.type.replace(/_/g, " ") : "support"}</p><p className={`mt-2 ${isEmotional ? "text-slate-50 leading-7" : "text-slate-100"}`}>{block.text || "Take one calm breath and pick a tiny next action."}</p></section>)}<section className={`rounded-2xl border p-4 ${isEmotional ? "border-violet-100/20 bg-violet-100/[0.04]" : "border-white/12 bg-white/[0.03]"}`}><p className={`text-xs uppercase tracking-[0.16em] ${isEmotional ? "text-violet-100/80" : "text-violet-200/70"}`}>Current reflection</p><p className={`mt-2 ${isEmotional ? "text-slate-50 leading-7" : "text-slate-100"}`}>{normalized.blocks[0]?.body}</p></section></div><div className="mt-4 flex flex-wrap gap-2">{quickActions.map((action) => <Link key={action.href + action.label} href={action.href} className={`min-h-10 rounded-full px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 ${isEmotional ? "border border-violet-100/30 text-violet-50 hover:bg-violet-100/10" : "border border-white/20 text-slate-100 hover:bg-white/10"}`}>{action.label}</Link>)}</div></MomentActionCard>;
}
