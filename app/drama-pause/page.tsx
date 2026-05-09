import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { ModuleFlowClient } from "@/features/moment/ModuleFlowClient";
export default function DramaPausePage({ searchParams }: { searchParams: { from?: string; contextId?: string; summary?: string } }) {
  return <MomentShell><section className="mx-auto max-w-3xl"><MomentPageHeader eyebrow="Drama Pause" title="Pause the escalation" subtitle="Protect your energy with calm boundaries." /><ModuleFlowClient title="drama-pause" searchParams={searchParams} apiPath="/api/ai/drama-pause" fields={[{ name: "situation_text", label: "What happened?", area: true }, { name: "relationship", label: "Who is involved?" }, { name: "goal", label: "Best outcome for you" }]} /></section></MomentShell>;
}
