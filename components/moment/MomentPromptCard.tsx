import type { ReactNode } from "react";
import { MomentCard } from "@/components/moment/MomentCard";

export function MomentPromptCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <MomentCard className={`space-y-4 ${className}`}>{children}</MomentCard>;
}
