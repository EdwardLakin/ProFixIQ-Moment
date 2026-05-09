import type { TextareaHTMLAttributes } from "react";

export function MomentTextarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/15 bg-[#10172e] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:border-violet-200 ${className}`}
    />
  );
}
