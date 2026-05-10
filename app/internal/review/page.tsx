import { redirect } from "next/navigation";
import { requireInternalReviewer } from "@/lib/internalReviewAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type QaTag =
  | "emotionally_warm"
  | "too_robotic"
  | "too_many_prompts"
  | "too_instructional"
  | "emotionally_flat"
  | "emotionally_helpful"
  | "pacing_mismatch"
  | "continuity_creepy"
  | "continuity_comforting";

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
  qaTags?: QaTag[];
  loopSignals?: string[];
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
    qaTags: Array.isArray(source.qaTags) ? source.qaTags.filter((item): item is QaTag => typeof item === "string") : undefined,
    loopSignals: Array.isArray(source.loopSignals) ? source.loopSignals.filter((item): item is string => typeof item === "string") : undefined,
  };
}

export default async function InternalReviewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const reviewer = await requireInternalReviewer();
  if (!reviewer.authorized) redirect("/dashboard");

  const params = (await searchParams) ?? {};
  const pacingProfile = typeof params.pacing === "string" ? params.pacing : "all";

  const supabase = createSupabaseAdminClient();
  const events = await supabase.from("moment_orchestration_events").select("created_at,trace_summary,trace_metadata").order("created_at", { ascending: false }).limit(120);
  const feedback = await supabase.from("moment_support_feedback").select("created_at,signal,pacing_mismatch,overprompting_signal").order("created_at", { ascending: false }).limit(120);

  const normalizedEvents = (events.data ?? []).map((item) => {
    const safeMetadata = sanitizeTraceMetadata(item.trace_metadata);
    const tags = safeMetadata.qaTags ?? [];
    return {
      createdAt: item.created_at,
      traceSummary: item.trace_summary,
      safeMetadata,
      tags,
      hasFatiguePattern: (safeMetadata.loopSignals ?? []).some((signal) => signal.includes("fatigue")),
    };
  }).filter((item) => pacingProfile === "all" || item.safeMetadata.pacingProfile === pacingProfile);

  const roboticQueue = normalizedEvents.filter((item) => item.tags.includes("too_robotic") || item.tags.includes("emotionally_flat"));
  const overGuidanceQueue = normalizedEvents.filter((item) => item.tags.includes("too_many_prompts") || item.tags.includes("too_instructional"));
  const strongResponseQueue = normalizedEvents.filter((item) => item.tags.includes("emotionally_helpful") || item.tags.includes("emotionally_warm"));
  const pacingMismatchQueue = normalizedEvents.filter((item) => item.tags.includes("pacing_mismatch"));
  const fatigueQueue = normalizedEvents.filter((item) => item.hasFatiguePattern);

  return <main className="mx-auto max-w-5xl space-y-4 p-6 text-[#efe8ff]"><h1 className="text-xl">Internal emotional quality review</h1>
    <section className="rounded-2xl border border-white/10 p-4 text-xs text-[#d7cceb]"><p>Filters:</p><p>pacing={pacingProfile}</p><p className="mt-2">Summaries are intentionally sanitized. Raw user content is not shown in this view.</p></section>
    <section className="grid gap-3 md:grid-cols-2">
      <Queue title="Felt robotic / emotionally flat" subtitle="Needs warmer tone and less template feel" items={roboticQueue} />
      <Queue title="Too much guidance" subtitle="Too many instructions or prompts in one pass" items={overGuidanceQueue} />
      <Queue title="Emotionally strong responses" subtitle="Good candidates for style cloning" items={strongResponseQueue} />
      <Queue title="Pacing mismatches" subtitle="Response rhythm did not fit emotional weight" items={pacingMismatchQueue} />
    </section>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Support fatigue patterns</h2>
      <div className="space-y-2 text-sm">{fatigueQueue.map((item, idx) => <div key={idx} className="rounded-xl bg-white/5 p-2"><p>{item.traceSummary}</p><p className="mt-1 text-xs text-[#bcaed8]">{item.createdAt} · {(item.safeMetadata.loopSignals ?? []).join(" · ")}</p></div>)}</div>
    </section>
    <section className="rounded-2xl border border-white/10 p-4"><h2 className="mb-2 text-sm uppercase tracking-[0.18em]">Recent feedback signals</h2>
      <div className="space-y-2 text-sm">{(feedback.data ?? []).map((item, idx) => <div key={idx} className="rounded-xl bg-white/5 p-2">{item.signal} · pacing mismatch: {item.pacing_mismatch ? "yes" : "no"} · overprompting: {item.overprompting_signal ? "yes" : "no"}</div>)}</div>
    </section>
  </main>;
}

function Queue({ title, subtitle, items }: { title: string; subtitle: string; items: { createdAt: string; traceSummary: string | null; tags: QaTag[] }[] }) {
  return <section className="rounded-2xl border border-white/10 p-4"><h2 className="text-sm uppercase tracking-[0.18em]">{title}</h2><p className="mt-1 text-xs text-[#bcaed8]">{subtitle}</p>
    <div className="mt-2 space-y-2 text-sm">{items.slice(0, 20).map((item, idx) => <div key={idx} className="rounded-xl bg-white/5 p-2"><p>{item.traceSummary}</p><p className="mt-1 text-xs text-[#bcaed8]">{item.createdAt} · {item.tags.join(" · ")}</p></div>)}</div>
  </section>;
}
