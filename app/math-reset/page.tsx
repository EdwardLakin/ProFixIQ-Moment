import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { ModuleFlowClient } from "@/features/moment/ModuleFlowClient";
export default async function MathResetPage({ searchParams }: { searchParams: Promise<{ from?: string; contextId?: string; summary?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return <MomentAppShell title="Math reset" subtitle="Reduce pressure and find one solvable move."><section className="mx-auto max-w-3xl"><MomentPageHeader eyebrow="Math Reset" title="Shrink the math pressure" subtitle="One clear move at a time. Not therapy or crisis care." /><ModuleFlowClient title="math-reset" searchParams={resolvedSearchParams} apiPath="/api/ai/math-reset" fields={[{ name: "problem_text", label: "What math problem feels stuck?", area: true }, { name: "stress_level", label: "Stress level right now" }, { name: "test_context", label: "Quiz/test/homework context" }]} /></section></MomentAppShell>;
}
