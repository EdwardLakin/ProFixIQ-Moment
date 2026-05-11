import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { ModuleFlowClient } from "@/features/moment/ModuleFlowClient";
export default async function MathResetPage({ searchParams }: { searchParams: Promise<{ from?: string; contextId?: string; summary?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return <MomentAppShell title="Tutor" subtitle="Homework help with calm, step-by-step support."><section className="mx-auto max-w-3xl"><MomentPageHeader eyebrow="Tutor" title="Homework help, without the shame spiral" subtitle="Math, writing, science, studying, and test prep." /><ModuleFlowClient title="math-reset" searchParams={resolvedSearchParams} apiPath="/api/ai/math-reset" fields={[{ name: "problem_text", label: "What math problem feels stuck?", area: true }, { name: "stress_level", label: "Stress level right now" }, { name: "test_context", label: "Quiz/test/homework context" }]} /></section></MomentAppShell>;
}
