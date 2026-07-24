"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { API_LOADING_MESSAGES, API_LOADING_ROTATE_MS } from "@/lib/apiLoadingMessages";

/** Matches `lib/toast.ts` brand accent (login success). */
const baseStyle: CSSProperties = {
  background: "#18181b",
  color: "#fafafa",
  borderRadius: "0.5rem",
  boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.55)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  fontSize: "14px",
  padding: "12px 16px",
  maxWidth: "min(100vw - 2rem, 22rem)",
  borderLeft: "3px solid #f97316",
};

/** Resume analyze / ATS API wait — dismissed when the request ends (terminal shows the result). */
export const ANALYZE_API_ROTATING_TOAST_ID = "resume-ai-rotating-analyze";

/** Career guide — same id for rotating loader, then `replaceLoadingWith*` on completion. */
export const CAREER_GUIDE_ROTATING_TOAST_ID = "resume-ai-rotating-career";

const ROTATE_MS = API_LOADING_ROTATE_MS;

function showRotatingLoadingToast(text: string, toastId: string) {
  toast.loading(text, {
    id: toastId,
    duration: Infinity,
    position: "top-right",
    style: baseStyle,
  });
}

type UseRotatingLoadingToastOptions = {
  /** When false, cleanup only stops the interval (use when you replace this toast with success/error). Default true. */
  dismissWhenInactive?: boolean;
};

/**
 * One toast; text rotates on `API_LOADING_ROTATE_MS` while `active` is true.
 * - Analyze: default `dismissWhenInactive` so the toast goes away when the API returns.
 * - Career guide: pass `dismissWhenInactive: false` and finish with `replaceLoadingWithSuccess` / `replaceLoadingWithError` on `toastId`.
 */
export function useRotatingLoadingToast(
  active: boolean,
  toastId: string,
  options?: UseRotatingLoadingToastOptions
) {
  const dismissWhenInactive = options?.dismissWhenInactive ?? true;

  useEffect(() => {
    if (!active) return;

    let i = 0;
    showRotatingLoadingToast(API_LOADING_MESSAGES[0], toastId);

    const intervalId = window.setInterval(() => {
      i = (i + 1) % API_LOADING_MESSAGES.length;
      showRotatingLoadingToast(API_LOADING_MESSAGES[i], toastId);
    }, ROTATE_MS);

    return () => {
      window.clearInterval(intervalId);
      if (dismissWhenInactive) toast.dismiss(toastId);
    };
  }, [active, toastId, dismissWhenInactive]);
}
