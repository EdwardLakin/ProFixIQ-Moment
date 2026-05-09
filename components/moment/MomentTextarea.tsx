import type { TextareaHTMLAttributes } from "react";

export function MomentTextarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-white/15 bg-[#202a40] px-3 py-2 text-sm text-[#f8f1e7] outline-none placeholder:text-[#a7a8bd] focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#c4b5fd]/40 ${className}`}
    />
  );
}
