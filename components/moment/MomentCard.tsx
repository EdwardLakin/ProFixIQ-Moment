import type { ReactNode } from "react";

export function MomentCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`moment-glass-panel moment-gradient-border rounded-[1.5rem] p-5 ${className}`}>{children}</div>;
}
