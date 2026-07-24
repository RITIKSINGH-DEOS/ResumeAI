import { clerkClient } from "@clerk/nextjs/server";
import { userPlanFromClerkMetadata } from "@/lib/clerkPremium";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { UserPlan, UserRow } from "@/types/supabase";

const SELECT_WITH_PLAN = "id, clerk_id, email, name, plan, created_at";
const SELECT_LEGACY = "id, clerk_id, email, name, created_at";

/** True when Supabase has not had migration `00002_users_plan.sql` applied yet. */
function isMissingPlanColumnError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("plan") &&
    (m.includes("schema cache") || m.includes("column") || m.includes("could not find"))
  );
}

function clerkProfileFromUser(user: {
  primaryEmailAddress?: { emailAddress: string } | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  publicMetadata: Record<string, unknown> | null | undefined;
}): { email: string; name: string; plan: UserPlan } {
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name =
    user.fullName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    user.username ??
    "";
  const meta = (user.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  const plan = userPlanFromClerkMetadata(meta);
  return { email, name, plan };
}

/**
 * Creates or updates the Supabase `users` row from Clerk (email, name, `plan` free/premium).
 * Use when the table is empty or the row was deleted but the user still exists in Clerk.
 */
export async function ensureUserRowFromClerk(
  clerkId: string
): Promise<{ data: UserRow | null; error: Error | null }> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkId);
  const { email, name, plan } = clerkProfileFromUser(user);
  return upsertUserByClerkId(clerkId, email, name, plan);
}

/** Returns existing row, or creates it from Clerk if missing (e.g. after DB wipe or first API hit). */
export async function getUserByClerkIdOrEnsure(
  clerkId: string
): Promise<{ data: UserRow | null; error: Error | null }> {
  const first = await getUserByClerkId(clerkId);
  if (first.error) return first;
  if (first.data) return first;
  return ensureUserRowFromClerk(clerkId);
}

/**
 * Sync Clerk profile to Supabase. `plan` mirrors Clerk (`userPlanFromClerkMetadata`) so if the
 * `users` row was deleted, the next sync recreates it with the correct `free` / `premium`.
 * Falls back to legacy columns if `plan` migration has not been applied.
 */
export async function upsertUserByClerkId(
  clerkId: string,
  email: string,
  name: string,
  plan: UserPlan
): Promise<{ data: UserRow | null; error: Error | null }> {
  const withPlan = await upsertUserByClerkIdWithPlanColumn(clerkId, email, name, plan);
  if (!withPlan.error || !isMissingPlanColumnError(withPlan.error.message)) {
    return withPlan;
  }
  return upsertUserByClerkIdLegacyNoPlan(clerkId, email, name, plan);
}

async function upsertUserByClerkIdWithPlanColumn(
  clerkId: string,
  email: string,
  name: string,
  plan: UserPlan
): Promise<{ data: UserRow | null; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      data: null,
      error: new Error("Set SUPABASE_SERVICE_ROLE_KEY (server-side Clerk sync)"),
    };
  }

  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (selErr) return { data: null, error: new Error(selErr.message) };

  if (existing) {
    const { data, error } = await supabase
      .from("users")
      .update({ email, name, plan })
      .eq("clerk_id", clerkId)
      .select(SELECT_WITH_PLAN)
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as UserRow, error: null };
  }

  const { data, error } = await supabase
    .from("users")
    .insert({ clerk_id: clerkId, email, name, plan })
    .select(SELECT_WITH_PLAN)
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as UserRow, error: null };
}

/** DB without `plan` column: sync email/name only; return `plan` from Clerk for the in-memory row. */
async function upsertUserByClerkIdLegacyNoPlan(
  clerkId: string,
  email: string,
  name: string,
  plan: UserPlan
): Promise<{ data: UserRow | null; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      data: null,
      error: new Error("Set SUPABASE_SERVICE_ROLE_KEY (server-side Clerk sync)"),
    };
  }

  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (selErr) return { data: null, error: new Error(selErr.message) };

  if (existing) {
    const { data, error } = await supabase
      .from("users")
      .update({ email, name })
      .eq("clerk_id", clerkId)
      .select(SELECT_LEGACY)
      .single();

    if (error) return { data: null, error: new Error(error.message) };
    return { data: { ...data, plan } as UserRow, error: null };
  }

  const { data, error } = await supabase
    .from("users")
    .insert({ clerk_id: clerkId, email, name })
    .select(SELECT_LEGACY)
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: { ...data, plan } as UserRow, error: null };
}

export async function getUserByClerkId(
  clerkId: string
): Promise<{ data: UserRow | null; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      data: null,
      error: new Error("Set SUPABASE_SERVICE_ROLE_KEY (server-side Clerk sync)"),
    };
  }

  const { data, error } = await supabase
    .from("users")
    .select(SELECT_WITH_PLAN)
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (!error) {
    return { data: data as UserRow | null, error: null };
  }

  if (!isMissingPlanColumnError(error.message)) {
    return { data: null, error: new Error(error.message) };
  }

  const { data: legacy, error: legacyErr } = await supabase
    .from("users")
    .select(SELECT_LEGACY)
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (legacyErr) return { data: null, error: new Error(legacyErr.message) };
  if (!legacy) return { data: null, error: null };

  return {
    data: { ...legacy, plan: "free" } as UserRow,
    error: null,
  };
}

/**
 * Upsert full row including `plan` — used after Clerk Pro grant/revoke so DB matches purchase state.
 */
export async function upsertUserWithPlan(
  clerkId: string,
  email: string,
  name: string,
  plan: UserPlan
): Promise<{ error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { error: new Error("Set SUPABASE_SERVICE_ROLE_KEY (server-side Clerk sync)") };
  }

  const { error } = await supabase.from("users").upsert(
    { clerk_id: clerkId, email, name, plan },
    { onConflict: "clerk_id" }
  );

  if (!error) return { error: null };

  if (isMissingPlanColumnError(error.message)) {
    const { error: e2 } = await supabase.from("users").upsert(
      { clerk_id: clerkId, email, name },
      { onConflict: "clerk_id" }
    );
    if (e2) return { error: new Error(e2.message) };
    return { error: null };
  }

  return { error: new Error(error.message) };
}
