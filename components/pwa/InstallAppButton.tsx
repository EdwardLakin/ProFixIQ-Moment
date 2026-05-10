"use client";

import { useEffect, useMemo, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsIos(ios);
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const canPromptInstall = useMemo(() => Boolean(deferredPrompt) && !isStandalone, [deferredPrompt, isStandalone]);

  const handleInstallClick = async () => {
    if (isStandalone) return;

    if (!deferredPrompt) {
      setShowInstructions(true);
      return;
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted" || choiceResult.outcome === "dismissed") {
      setDeferredPrompt(null);
    }
  };

  const closeInstructions = () => setShowInstructions(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isStandalone}
        className="moment-btn-secondary disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isStandalone ? "App installed" : "Download App"}
      </button>

      {showInstructions && !canPromptInstall && !isStandalone ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="install-moment-title">
          <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" aria-label="Close install help" onClick={closeInstructions} />
          <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_20%_0%,rgba(196,181,253,0.26),transparent_55%),linear-gradient(155deg,rgba(18,15,38,0.95),rgba(17,24,39,0.96))] p-5 text-violet-50 shadow-[0_34px_90px_-48px_rgba(167,139,250,1),inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-white/20 backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/20" />
            <div className="flex items-start justify-between gap-4">
              <h3 id="install-moment-title" className="text-lg font-semibold text-white">
                Install Moment
              </h3>
              <button
                type="button"
                onClick={closeInstructions}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-violet-100 ring-1 ring-white/20 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
                aria-label="Close install help"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-100/95">On iPhone or iPad Safari, the Share button is in the browser toolbar. It looks like a square with an arrow pointing up. Tap it, then choose Add to Home Screen.</p>

            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-white/[0.09] px-3 py-2.5 text-sm font-medium text-white ring-1 ring-white/20">
              <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/14 text-base">⬆︎</span>
              <span className="tracking-wide">Share → Add to Home Screen</span>
            </div>
            <p className="mt-3 rounded-2xl bg-white/[0.08] px-3 py-2 text-xs leading-relaxed text-violet-100/95 ring-1 ring-white/20 sm:text-sm">
              On Android or desktop Chrome, this button opens the install prompt when available.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
