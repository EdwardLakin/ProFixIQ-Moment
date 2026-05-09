import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { ModuleFlowClient } from "@/features/moment/ModuleFlowClient";
export default function MathResetPage({ searchParams }: { searchParams: { from?: string; contextId?: string; summary?: string } }) {
  return <MomentShell><section className="mx-auto max-w-3xl"><MomentPageHeader eyebrow="Math Reset" title="Shrink the math pressure" subtitle="One clear move at a time. Not therapy or crisis care." /><ModuleFlowClient title="math-reset" searchParams={searchParams} apiPath="/api/ai/math-reset" fields={[{ name: "problem_text", label: "What math problem feels stuck?", area: true }, { name: "stress_level", label: "Stress level right now" }, { name: "test_context", label: "Quiz/test/homework context" }]} /></section></MomentShell>;
}
