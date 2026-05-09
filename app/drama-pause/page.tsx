import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { ModuleFlowClient } from "@/features/moment/ModuleFlowClient";
export default async function DramaPausePage({ searchParams }: { searchParams: Promise<{ from?: string; contextId?: string; summary?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return <MomentAppShell title="Drama pause" subtitle="Create calm boundaries before reacting."><section className="mx-auto max-w-3xl"><MomentPageHeader eyebrow="Drama Pause" title="Pause the escalation" subtitle="Protect your energy with calm boundaries." /><ModuleFlowClient title="drama-pause" searchParams={resolvedSearchParams} apiPath="/api/ai/drama-pause" fields={[{ name: "situation_text", label: "What happened?", area: true }, { name: "relationship", label: "Who is involved?" }, { name: "goal", label: "Best outcome for you" }]} /></section></MomentAppShell>;
}
