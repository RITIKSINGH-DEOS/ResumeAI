import { clerkClient } from "@clerk/nextjs/server";
import { resolveSubscriptionPlan } from "@/lib/subscriptionPlan";
import { upsertUserWithPlan } from "@/server/supabase/users";

/**
 * Grant Pro in Clerk public metadata (30-day window from payment success).
 * Syncs `users.plan = 'premium'` in Supabase when configured.
 */
export async function grantProToClerkUser(userId: string): Promise<void> {
  const { plan_expiry } = resolveSubscriptionPlan({
    payment_status: "success",
    now: new Date(),
  });
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prev = (user.publicMetadata ?? {}) as Record<string, unknown>;
  await client.users.updateUser(userId, {
    publicMetadata: {
      ...prev,
      premium: true,
      plan: "pro",
      plan_expiry,
    },
  });

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name =
    user.fullName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    user.username ??
    "";

  const { error } = await upsertUserWithPlan(userId, email, name, "premium");
  if (error) {
    console.error("[grantProToClerkUser] Supabase plan sync:", error.message);
  }
}
