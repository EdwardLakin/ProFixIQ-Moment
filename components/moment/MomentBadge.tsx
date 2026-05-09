import type { ReactNode } from "react";

export function MomentBadge({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-violet-200/40 px-3 py-1 text-xs text-violet-100">{children}</span>;
}
