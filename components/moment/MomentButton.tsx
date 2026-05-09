import type { ButtonHTMLAttributes } from "react";

export function MomentButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`min-h-11 rounded-full bg-violet-200 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_-18px_rgba(196,181,253,1)] transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110d21] disabled:opacity-60 ${className}`}
    />
  );
}
