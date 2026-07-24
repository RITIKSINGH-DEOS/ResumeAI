"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { successToast } from "@/lib/toast";

/** Fires once when session goes from signed-out → signed-in (not on initial SSR hydration). */
export function AuthToastListener() {
  const { isSignedIn, isLoaded } = useAuth();
  const prev = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (prev.current === null) {
      prev.current = isSignedIn;
      return;
    }
    if (prev.current === false && isSignedIn) {
      successToast("Login successful");
    }
    prev.current = isSignedIn;
  }, [isLoaded, isSignedIn]);

  return null;
}
