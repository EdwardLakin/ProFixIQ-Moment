import type { ReactNode } from "react";

export function MomentShell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-[#0b1020] px-4 py-6 text-[#f8f1e7] md:px-6">{children}</main>;
}
