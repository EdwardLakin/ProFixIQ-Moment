import type { ReactNode } from "react";
import { MomentCard } from "@/components/moment/MomentCard";

export function MomentPromptCard({ children }: { children: ReactNode }) {
  return <MomentCard className="space-y-4">{children}</MomentCard>;
}
