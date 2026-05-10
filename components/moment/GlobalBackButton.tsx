"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

type GlobalBackButtonProps = {
  fallbackHref?: string;
  className?: string;
};

function isSafeInternalReferrer() {
  if (typeof window === "undefined") return false;
  if (!document.referrer) return true;

  try {
    const referrerUrl = new URL(document.referrer);
    return referrerUrl.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function GlobalBackButton({ fallbackHref, className = "" }: GlobalBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const safeFallback = useMemo(() => {
    if (fallbackHref) return fallbackHref;
    if (pathname.startsWith("/check-in")) return "/check-in";
    return "/dashboard";
  }, [fallbackHref, pathname]);

  function handleBack() {
    if (typeof window === "undefined") {
      router.push(safeFallback);
      return;
    }

    const hasHistory = window.history.length > 1;
    if (hasHistory && isSafeInternalReferrer()) {
      router.back();
      return;
    }

    router.push(safeFallback);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back"
      className={`fixed left-3 z-40 inline-flex min-h-11 min-w-11 items-center gap-2 rounded-full border border-white/20 bg-[#1a2438]/88 px-3 py-2 text-sm font-medium text-[#f8f1e7] shadow-[0_8px_26px_-16px_rgba(0,0,0,0.85)] backdrop-blur transition hover:bg-[#243252]/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-200/60 ${className}`}
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <span aria-hidden>←</span>
      <span>Back</span>
    </button>
  );
}
