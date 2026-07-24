import { clerkClient } from "@clerk/nextjs/server";
import {
  isProExpiredInMetadata,
  resolveSubscriptionPlan,
  type PlanResolution,
} from "@/lib/subscriptionPlan";
import { revokeProFromClerkUser } from "@/lib/payments/revokePro";

function metaInput(meta: Record<string, unknown>) {
  return {
    stored_plan: typeof meta.plan === "string" ? meta.plan : null,
    stored_premium: meta.premium === true ? true : null,
    plan_expiry: typeof meta.plan_expiry === "string" ? meta.plan_expiry : null,
  };
}

/**
 * If Clerk says Pro but `plan_expiry` is in the past, persist downgrade to Free.
 * Returns the effective plan after sync.
 */
export async function syncExpiredPlanForUser(userId: string): Promise<PlanResolution> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
  const input = metaInput(meta);

  if (isProExpiredInMetadata(input)) {
    await revokeProFromClerkUser(userId);
    const refreshed = await client.users.getUser(userId);
    const m = (refreshed.publicMetadata ?? {}) as Record<string, unknown>;
    return resolveSubscriptionPlan(metaInput(m));
  }

  return resolveSubscriptionPlan(input);
}
