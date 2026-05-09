import type { ReactNode } from "react";

export function MomentPageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-violet-200/60">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-slate-300">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
