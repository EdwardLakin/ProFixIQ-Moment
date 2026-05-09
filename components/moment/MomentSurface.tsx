import type { ReactNode } from "react";

export function MomentSurface({ children }: { children: ReactNode }) {
  return <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 md:p-6">{children}</section>;
}
