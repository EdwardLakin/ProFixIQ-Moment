import { CarriedContextCard } from "@/components/moment/CarriedContextCard";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentShell } from "@/components/moment/MomentShell";

export default function DramaPausePage({ searchParams }: { searchParams: { from?: string; contextId?: string; summary?: string } }) {
  return <MomentShell><section className="mx-auto max-w-3xl space-y-4"><CarriedContextCard searchParams={searchParams} /><MomentCard><h1 className="text-2xl font-semibold">Drama Pause</h1><p className="mt-2 text-slate-300">Routed from: {searchParams.from ?? "direct"}</p><p className="mt-4 text-slate-300">Use this flow to stay out of escalation and protect your attention.</p><p className="mt-3 text-sm text-slate-400">If context was carried, anchor your first message draft to that summary.</p></MomentCard></section></MomentShell>;
}
