import { redirect } from "next/navigation";
import { requireInternalReviewer } from "@/lib/internalReviewAuth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SafeTraceMetadata = {
  routedBrain?: string;
  supportStyle?: string;
  pacingProfile?: string;
  clarificationUsed?: boolean;
  responseDepth?: string;
  supportFatigueReduction?: boolean;
  fallbackPath?: string;
  confidence?: string;
  qualityFlags?: string[];
};

function sanitizeTraceMetadata(value: unknown): SafeTraceMetadata {
  if (!value || typeof value !== "object") return {};
  const source = value as Record<string, unknown>;
  return {
    routedBrain: typeof source.routedBrain === "string" ? source.routedBrain : undefined,
    supportStyle: typeof source.supportStyle === "string" ? source.supportStyle : undefined,
    pacingProfile: typeof source.pacingProfile === "string" ? source.pacingProfile : undefined,
    clarificationUsed: typeof source.clarificationUsed === "boolean" ? source.clarificationUsed : undefined,
    responseDepth: typeof source.responseDepth === "string" ? source.responseDepth : undefined,
    supportFatigueReduction: typeof source.supportFatigueReduction === "boolean" ? source.supportFatigueReduction : undefined,
    fallbackPath: typeof source.fallbackPath === "string" ? source.fallbackPath : undefined,
    confidence: typeof source.confidence === "string" ? source.confidence : undefined,
    qualityFlags: Array.isArray(source.qualityFlags) ? source.qualityFlags.filter((item): item is string => typeof item === "string") : undefined,
  };
}

export default async function InternalReviewPage() {
  const reviewer = await requireInternalReviewer();
  if (!reviewer.authorized) redirect("/dashboard");

  const supabase = await createSupabaseServerClient();
  const events = await supabase.from("moment_orchestration_events").select("created_at,trace_summary,trace_metadata").order("created_at", { ascending: false }).limit(40);
  const feedback = await supabase.from("moment_support_feedback").select("created_at,signal,pacing_mismatch,overprompting_signal").order("created_at", { ascending: false }).limit(40);

  return <main className="mx-auto max-w-4xl space-y-4 p-6 text-[#efe8ff]"><h1 className="text-xl">Internal support quality review</h1>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Recent orchestration trace summaries</h2>
      <div className="space-y-2 text-sm">{(events.data ?? []).map((item, idx) => {
        const safeMetadata = sanitizeTraceMetadata(item.trace_metadata);
        return <div key={idx} className="rounded-xl bg-white/5 p-2"><p>{item.trace_summary}</p><pre className="mt-1 whitespace-pre-wrap text-xs text-[#c9bedf]">{JSON.stringify(safeMetadata, null, 2)}</pre></div>;
      })}</div></section>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Recent feedback signals</h2>
      <div className="space-y-2 text-sm">{(feedback.data ?? []).map((item, idx) => <div key={idx} className="rounded-xl bg-white/5 p-2">{item.signal} · pacing mismatch: {item.pacing_mismatch ? "yes" : "no"} · overprompting: {item.overprompting_signal ? "yes" : "no"}</div>)}</div>
    </section>
  </main>;
}
