import type { ReactNode } from "react";

export function MomentTopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3 border-b border-white/10 pb-4">
      <div>
        <h1 className="text-xl font-semibold text-[#f8f1e7]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}
