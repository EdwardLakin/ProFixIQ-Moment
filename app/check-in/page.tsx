import { MomentAppShell } from "@/components/moment/MomentAppShell";
import { MomentPageHeader } from "@/components/moment/MomentPageHeader";
import { ModuleFlowClient } from "@/features/moment/ModuleFlowClient";

const stateChips = ["Overwhelmed", "Avoiding homework", "Math makes no sense", "Too many thoughts", "Friend drama", "Can’t start", "Shutting down", "Anxious", "Tired", "Embarrassed"];

export default async function CheckInPage({ searchParams }: { searchParams: Promise<{ from?: string; contextId?: string; summary?: string }> }) {
  const resolvedSearchParams = await searchParams;
  return <MomentAppShell title="Check in" subtitle="Name what is heavy and get a clear reset path."><section className="mx-auto max-w-3xl"><MomentPageHeader eyebrow="Check-in" title="Name it, then reset" subtitle="Short guided check-in for heavy moments." /><ModuleFlowClient title="check-in" searchParams={resolvedSearchParams} apiPath="/api/ai/check-in" fields={[{ name: "text", label: "What feels heaviest right now?", area: true }, { name: "selectedStates", label: "Optional states", chipOptions: stateChips }]} /></section></MomentAppShell>;
}
