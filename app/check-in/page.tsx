import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { MomentShell } from "@/components/moment/MomentShell";
import { ModuleFlowClient } from "@/features/moment/ModuleFlowClient";
export default function CheckInPage({ searchParams }: { searchParams: { from?: string; contextId?: string; summary?: string } }) {
  return <MomentShell><section className="mx-auto max-w-3xl"><MomentPageHeader eyebrow="Check-in" title="Name it, then reset" subtitle="Short guided check-in for heavy moments." /><ModuleFlowClient title="check-in" searchParams={searchParams} apiPath="/api/ai/check-in" fields={[{ name: "text", label: "What feels heaviest right now?", area: true }, { name: "selectedStates", label: "Optional states (comma-separated)" }]} /></section></MomentShell>;
}
