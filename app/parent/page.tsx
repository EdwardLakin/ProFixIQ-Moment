import { MomentAppShell } from "@/components/moment/MomentAppShell";

export default async function ParentPage() {
  return (
    <MomentAppShell title="Parent" subtitle="Pattern-based support summaries are coming soon.">
      <section className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Coming soon</p>
          <h2 className="mt-2 text-2xl font-semibold">Parent insight previews</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Moment will share pattern-based summaries so guardians can support routines without monitoring every check-in.</p>
          <p className="mt-2 text-sm text-slate-300">Privacy stance: we highlight trends and support needs, not surveillance or raw teen session logs.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Preview example (static)</p>
          <h3 className="mt-2 text-lg font-medium">Weekly pattern summary</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Most frequent trigger pattern: homework start friction between 5–7 PM.</li>
            <li>Most effective tiny step: 5-minute reset plus one starter problem.</li>
            <li>Support cue for guardian: ask "want help planning the first step?"</li>
          </ul>
        </div>
        <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200">Invite guardian (placeholder)</button>
      </section>
    </MomentAppShell>
  );
}
