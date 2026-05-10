import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function InternalReviewPage() {
  const supabase = await createSupabaseServerClient();
  const events = await supabase.from("moment_orchestration_events").select("created_at,trace_summary,trace_metadata").order("created_at", { ascending: false }).limit(40);
  const feedback = await supabase.from("moment_support_feedback").select("created_at,signal,pacing_mismatch,overprompting_signal").order("created_at", { ascending: false }).limit(40);
  return <main className="mx-auto max-w-4xl space-y-4 p-6 text-[#efe8ff]"><h1 className="text-xl">Internal support quality review</h1>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Recent orchestration traces</h2>
      <div className="space-y-2 text-sm">{(events.data ?? []).map((item, idx) => <div key={idx} className="rounded-xl bg-white/5 p-2"><p>{item.trace_summary}</p><pre className="mt-1 whitespace-pre-wrap text-xs text-[#c9bedf]">{JSON.stringify(item.trace_metadata ?? {}, null, 2)}</pre></div>)}</div></section>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Recent feedback signals</h2>
      <div className="space-y-2 text-sm">{(feedback.data ?? []).map((item, idx) => <div key={idx} className="rounded-xl bg-white/5 p-2">{item.signal} · pacing mismatch: {item.pacing_mismatch ? "yes" : "no"} · overprompting: {item.overprompting_signal ? "yes" : "no"}</div>)}</div>
    </section>
  </main>;
}
