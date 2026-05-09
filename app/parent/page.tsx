import { MomentAppShell } from "@/components/moment/MomentAppShell";

export default async function ParentPage() {
  return (
    <MomentAppShell title="Parent" subtitle="Pattern summaries, not surveillance.">
      <section className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Parent foundation</p>
          <h2 className="mt-2 text-2xl font-semibold">Pattern summaries, not surveillance.</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-300">Moment does not expose every private entry by default. Parent views are designed around patterns and support so families can coach routines without reading each private moment.</p>
        </div>
      </section>
    </MomentAppShell>
  );
}
