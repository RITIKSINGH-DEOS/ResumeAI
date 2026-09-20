import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Anon or service role — for reads that respect RLS when using anon + Clerk JWT (future).
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key);
}

/**
 * Service role only — Clerk-verified API routes; bypasses RLS. Required for users/resumes/storage writes.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key);
}


/**
 * Formats Supabase and PostgreSQL network/connection errors into helpful, user-friendly messages.
 */
export function formatSupabaseError(error: unknown): string {
  if (!error) return "Database error occurred.";

  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  const lower = msg.toLowerCase();
  if (
    lower.includes("fetch failed") ||
    lower.includes("enotfound") ||
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("econnrefused") ||
    lower.includes("connect etimedout")
  ) {
    return "Database connection failed. Your Supabase project may be paused due to inactivity. Please restore it in your Supabase dashboard (supabase.com).";
  }

  return msg;
}