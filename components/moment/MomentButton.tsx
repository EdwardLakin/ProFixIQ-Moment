import type { ButtonHTMLAttributes } from "react";

export function MomentButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`min-h-11 rounded-full bg-[#c4b5fd] px-5 py-2.5 text-sm font-semibold text-[#1a1730] shadow-[0_12px_30px_-18px_rgba(167,139,250,0.9)] transition hover:bg-[#ddd3ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4b5fd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] disabled:cursor-not-allowed disabled:bg-[#9f93c9] disabled:text-[#241f3a] ${className}`}
    />
  );
}
