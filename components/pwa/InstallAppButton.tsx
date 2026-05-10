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
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted" || choiceResult.outcome === "dismissed") {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) {
    return null;
  }

  if (canPromptInstall) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-white/8 px-6 py-3 text-sm font-medium text-violet-50/95 ring-1 ring-white/20 transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100"
      >
        Install App
      </button>
    );
  }

  if (isIos) {
    return (
      <p className="inline-flex min-h-12 items-center rounded-full bg-white/8 px-5 py-3 text-xs text-violet-50/95 ring-1 ring-white/20 sm:text-sm">
        On iPhone/iPad: tap Share, then Add to Home Screen.
      </p>
    );
  }

  return null;
}
