import { MomentCard } from "@/components/moment/MomentCard";
import { MomentShell } from "@/components/moment/MomentShell";

export default function MathResetPage({ searchParams }: { searchParams: { from?: string } }) {
  return <MomentShell><section className="mx-auto max-w-3xl"><MomentCard><h1 className="text-2xl font-semibold">Math Reset</h1><p className="mt-2 text-slate-300">Routed from: {searchParams.from ?? "direct"}</p><p className="mt-4 text-slate-300">We will break the problem into understandable chunks without pressure.</p></MomentCard></section></MomentShell>;
}
