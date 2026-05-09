export function RouteTransitionBlock({ text }: { text: string }) {
  return <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-3"><p className="text-xs uppercase tracking-[0.16em] text-blue-200/70">Route transition</p><p className="mt-2 text-slate-200">{text}</p></section>;
}
