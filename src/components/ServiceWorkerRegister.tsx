"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let mounted = true;

    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.onstatechange = () => {
            if (
              mounted &&
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          };
        };
      })
      .catch(() => {
        // Keep silent in production if SW registration fails.
      });

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
