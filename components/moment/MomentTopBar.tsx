import type { ReactNode } from "react";

export function MomentTopBar({ title, action }: { title: string; action?: ReactNode }) {
  return <header className="mb-4 flex items-center justify-between gap-3"><h1 className="text-lg font-semibold text-[#f8f1e7]">{title}</h1>{action}</header>;
}
