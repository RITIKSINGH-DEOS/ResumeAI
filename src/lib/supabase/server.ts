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
