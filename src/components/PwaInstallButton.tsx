"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

const DISMISS_STORAGE_KEY = "resumeai-pwa-install-dismissed";

export function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);

  const ios = useMemo(() => isIosDevice(), []);

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem(DISMISS_STORAGE_KEY) === "1") {
        setUserDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setPromptEvent(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canShow = !userDismissed && !isStandalone && (Boolean(promptEvent) || ios);
  if (!canShow) return null;

  function dismissBanner() {
    setUserDismissed(true);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function onInstallClick() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setPromptEvent(null);
  }

  /** iOS Safari has no `beforeinstallprompt`; show steps in the banner (no toast — avoids double-fire duplicates). */
  if (ios) {
    return (
      <div
        className={cn(
          "fixed bottom-4 right-4 z-[70] flex max-w-[min(100vw-2rem,19rem)] overflow-hidden rounded-xl border border-orange-300/35 bg-orange-500 shadow-lg shadow-orange-500/20"
        )}
        role="group"
        aria-label="Add to Home Screen instructions"
      >
        <div className="min-w-0 flex-1 px-3 py-2.5 text-left text-black">
          <p className="text-sm font-semibold leading-snug">Add to Home Screen</p>
          <p className="mt-0.5 text-xs font-medium leading-snug text-black/85">
            Tap <span className="font-semibold text-black">Share</span>, then <span className="font-semibold text-black">Add to Home Screen</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissBanner}
          className="flex w-10 shrink-0 items-center justify-center border-l border-orange-300/35 text-black/80 transition hover:bg-orange-400 hover:text-black"
          aria-label="Dismiss"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[70] flex overflow-hidden rounded-xl border border-orange-300/35 bg-orange-500 shadow-lg shadow-orange-500/20"
      )}
      role="group"
      aria-label="Install app"
    >
      <button
        type="button"
        onClick={() => {
          void onInstallClick();
        }}
        className="px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400 active:scale-[0.98]"
      >
        Install App
      </button>
      <button
        type="button"
        onClick={dismissBanner}
        className="flex w-10 shrink-0 items-center justify-center border-l border-orange-300/35 text-black/80 transition hover:bg-orange-400 hover:text-black"
        aria-label="Dismiss install suggestion"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
