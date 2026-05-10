import { redirect } from "next/navigation";
import { requireInternalReviewer } from "@/lib/internalReviewAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

function isTooRobotic(summary: string, metadata: SafeTraceMetadata) {
  const normalized = summary.toLowerCase();
  return normalized.includes("pattern") || normalized.includes("profile") || normalized.includes("optimiz") || (metadata.qualityFlags ?? []).includes("robotic_tone");
}

function isOverPrompting(summary: string, metadata: SafeTraceMetadata) {
  const normalized = summary.toLowerCase();
  return normalized.includes("choose") && normalized.includes("then") && !metadata.supportFatigueReduction;
}

function isEmotionallyStrong(summary: string) {
  const normalized = summary.toLowerCase();
  return normalized.includes("gentle") || normalized.includes("slow") || normalized.includes("no pressure") || normalized.includes("ground");
}

export default async function InternalReviewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const reviewer = await requireInternalReviewer();
  if (!reviewer.authorized) redirect("/dashboard");

  const params = (await searchParams) ?? {};
  const emotionalCategory = typeof params.category === "string" ? params.category : "all";
  const pacingProfile = typeof params.pacing === "string" ? params.pacing : "all";

  const supabase = createSupabaseAdminClient();
  const events = await supabase.from("moment_orchestration_events").select("created_at,trace_summary,trace_metadata").order("created_at", { ascending: false }).limit(80);
  const feedback = await supabase.from("moment_support_feedback").select("created_at,signal,pacing_mismatch,overprompting_signal").order("created_at", { ascending: false }).limit(80);

  const normalizedEvents = (events.data ?? []).map((item) => {
    const safeMetadata = sanitizeTraceMetadata(item.trace_metadata);
    return {
      createdAt: item.created_at,
      traceSummary: item.trace_summary,
      safeMetadata,
      tooRobotic: isTooRobotic(item.trace_summary ?? "", safeMetadata),
      overPrompting: isOverPrompting(item.trace_summary ?? "", safeMetadata),
      emotionallyStrong: isEmotionallyStrong(item.trace_summary ?? ""),
    };
  }).filter((item) => {
    if (emotionalCategory !== "all" && item.safeMetadata.routedBrain !== emotionalCategory) return false;
    if (pacingProfile !== "all" && item.safeMetadata.pacingProfile !== pacingProfile) return false;
    return true;
  });

  return <main className="mx-auto max-w-4xl space-y-4 p-6 text-[#efe8ff]"><h1 className="text-xl">Internal support quality review</h1>
    <section className="rounded-2xl border border-white/10 p-4 text-xs text-[#d7cceb]"><p>Filters:</p><p>category={emotionalCategory} · pacing={pacingProfile}</p></section>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Recent orchestration trace summaries</h2>
      <div className="space-y-2 text-sm">{normalizedEvents.map((item, idx) => {
        const tags = [item.tooRobotic ? "too robotic" : null, item.overPrompting ? "overprompting" : null, item.emotionallyStrong ? "emotionally strong" : null].filter(Boolean);
        return <div key={idx} className="rounded-xl bg-white/5 p-2"><p>{item.traceSummary}</p><p className="mt-1 text-xs text-[#bcaed8]">{item.createdAt} {tags.length ? `· ${tags.join(" · ")}` : ""}</p><pre className="mt-1 whitespace-pre-wrap text-xs text-[#c9bedf]">{JSON.stringify(item.safeMetadata, null, 2)}</pre></div>;
      })}</div></section>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Recent feedback signals</h2>
      <div className="space-y-2 text-sm">{(feedback.data ?? []).map((item, idx) => <div key={idx} className="rounded-xl bg-white/5 p-2">{item.signal} · pacing mismatch: {item.pacing_mismatch ? "yes" : "no"} · overprompting: {item.overprompting_signal ? "yes" : "no"}</div>)}</div>
    </section>
  </main>;
}
