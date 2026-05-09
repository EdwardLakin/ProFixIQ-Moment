import type { ButtonHTMLAttributes } from "react";

export function MomentButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-violet-200 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60 ${className}`}
    />
  );
}
