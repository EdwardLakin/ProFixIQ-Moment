import type { ReactNode } from "react";

export function MomentActionCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">{children}</div>;
}
