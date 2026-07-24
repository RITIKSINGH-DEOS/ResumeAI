"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Ensures a Supabase `users` row exists for the signed-in Clerk user (including correct
 * `plan` from Clerk metadata). Runs on each new session (login or sign-up), not only first mount.
 */
export function SupabaseUserSync() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();
  const lastSyncedSession = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      lastSyncedSession.current = null;
      return;
    }
    if (!sessionId) return;
    if (lastSyncedSession.current === sessionId) return;
    lastSyncedSession.current = sessionId;
    void fetch("/api/users/sync", { method: "POST" }).catch(() => {});
  }, [isLoaded, isSignedIn, userId, sessionId]);

  return null;
}
