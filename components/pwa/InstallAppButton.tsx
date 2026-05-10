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

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isStandalone}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/8 px-6 py-3 text-sm font-medium text-violet-50/95 ring-1 ring-white/20 transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isStandalone ? "App installed" : "Download App"}
      </button>

      {showInstructions && !canPromptInstall && !isStandalone ? (
        <div className="absolute left-0 top-[calc(100%+0.6rem)] z-20 w-72 rounded-2xl bg-[#120f26]/95 p-3 text-xs text-violet-50/95 shadow-[0_24px_56px_-34px_rgba(167,139,250,1)] ring-1 ring-white/20 backdrop-blur-md sm:w-80 sm:text-sm">
          <p>{isIos ? "Tap Share, then Add to Home Screen." : "Install prompt unavailable. Tap Share, then Add to Home Screen."}</p>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="mt-2 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-violet-100 ring-1 ring-white/20 hover:bg-white/15"
          >
            Got it
          </button>
        </div>
      ) : null}
    </div>
  );
}
