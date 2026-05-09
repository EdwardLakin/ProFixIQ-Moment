import type { MomentEnvironmentState } from "@/features/moment/context/types";

export function TinyWinCard({ label }: { label?: string }) { return <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3 text-sm text-emerald-100">{label ?? "No completed tiny wins yet. Your next small action will appear here."}</div>; }
export function RecoverySignal({ text }: { text: string }) { return <p className="text-sm text-slate-300">{text}</p>; }
export function RestartHistoryCard({ dateText }: { dateText?: string }) { return <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">Last restart: {dateText ?? "Not logged yet"}</div>; }

export function MomentumRail({ state }: { state: MomentEnvironmentState }) {
  return <aside className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-[0.16em] text-violet-200/70">Recovery momentum</p><TinyWinCard label={state.lastSuccessfulRestart ? "You came back instead of avoiding it." : undefined} /><RecoverySignal text={state.unresolvedLoops[0] ? `Unfinished loop: ${state.unresolvedLoops[0].label}` : "No recent resets yet. A gentle reset will show up after your first module run."} /><RestartHistoryCard dateText={state.lastSuccessfulRestart ? new Date(state.lastSuccessfulRestart).toLocaleString() : undefined} /></aside>;
}
