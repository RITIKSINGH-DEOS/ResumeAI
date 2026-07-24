import { clerkClient } from "@clerk/nextjs/server";
import { upsertUserWithPlan } from "@/server/supabase/users";

/** Clear Pro flags (e.g. admin revoke or future subscription end). Syncs `users.plan = 'free'`. */
export async function revokeProFromClerkUser(userId: string): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prev = (user.publicMetadata ?? {}) as Record<string, unknown>;
  await client.users.updateUser(userId, {
    publicMetadata: {
      ...prev,
      premium: false,
      plan: "free",
      plan_expiry: null,
    },
  });

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name =
    user.fullName ??
    [user.firstName, user.lastName].filter(Boolean).join(" ") ??
    user.username ??
    "";

  const { error } = await upsertUserWithPlan(userId, email, name, "free");
  if (error) {
    console.error("[revokeProFromClerkUser] Supabase plan sync:", error.message);
  }
}
