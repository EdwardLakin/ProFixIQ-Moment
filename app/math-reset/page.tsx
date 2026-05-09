import { CarriedContextCard } from "@/components/moment/CarriedContextCard";
import { MomentCard } from "@/components/moment/MomentCard";
import { MomentShell } from "@/components/moment/MomentShell";

export default function MathResetPage({ searchParams }: { searchParams: { from?: string; contextId?: string; summary?: string } }) {
  return <MomentShell><section className="mx-auto max-w-3xl space-y-4"><CarriedContextCard searchParams={searchParams} /><MomentCard><h1 className="text-2xl font-semibold">Math Reset</h1><p className="mt-2 text-slate-300">Routed from: {searchParams.from ?? "direct"}</p><p className="mt-4 text-slate-300">We will break the problem into understandable chunks without pressure.</p><p className="mt-3 text-sm text-slate-400">If context was carried, use it as your first problem example.</p></MomentCard></section></MomentShell>;
}
