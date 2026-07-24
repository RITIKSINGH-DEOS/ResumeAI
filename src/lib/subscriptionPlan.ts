/**
 * Subscription plan resolution (payment outcome + stored Clerk metadata + expiry).
 */

export type PlanId = "free" | "pro";

export type PlanResolution = {
  plan: PlanId;
  /** ISO 8601 end of Pro period, or null for Free / unknown */
  plan_expiry: string | null;
  reason: string;
};

export type ResolveSubscriptionInput = {
  /** When a payment gateway reports an outcome in this request */
  payment_status?: "success" | "failed" | null;
  /** Clerk `publicMetadata` */
  stored_plan?: string | null;
  stored_premium?: boolean | null;
  plan_expiry?: string | null;
  /** Defaults to now (UTC) */
  now?: Date;
};

function hasProFlags(input: ResolveSubscriptionInput): boolean {
  if (input.stored_premium === true) return true;
  const p = typeof input.stored_plan === "string" ? input.stored_plan.toLowerCase().trim() : "";
  return p === "pro" || p === "premium" || p === "paid";
}

function addDaysUtc(from: Date, days: number): Date {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Core rules:
 * 1. payment_status = "success" → pro, plan_expiry = now + 30 days
 * 2. payment_status = "failed" → free
 * 3. pro + plan_expiry in the past → free (expiry downgrade)
 * 4. never paid / no pro flags → free
 * Legacy: pro flags but no plan_expiry → still pro (grandfathered until expiry is set)
 */
export function resolveSubscriptionPlan(input: ResolveSubscriptionInput): PlanResolution {
  const now = input.now ?? new Date();

  if (input.payment_status === "success") {
    const plan_expiry = addDaysUtc(now, 30).toISOString();
    return {
      plan: "pro",
      plan_expiry,
      reason: "Payment succeeded; Pro active for 30 days from purchase.",
    };
  }

  if (input.payment_status === "failed") {
    return {
      plan: "free",
      plan_expiry: null,
      reason: "Payment failed; staying on Free plan.",
    };
  }

  const proFlags = hasProFlags(input);
  if (!proFlags) {
    return {
      plan: "free",
      plan_expiry: null,
      reason: "No successful subscription on record; Free plan.",
    };
  }

  const expiryRaw = input.plan_expiry;
  if (typeof expiryRaw === "string" && expiryRaw.length > 0) {
    const end = new Date(expiryRaw);
    if (Number.isFinite(end.getTime()) && now.getTime() > end.getTime()) {
      return {
        plan: "free",
        plan_expiry: expiryRaw,
        reason: "Pro period ended; downgraded to Free.",
      };
    }
  }

  return {
    plan: "pro",
    plan_expiry: typeof expiryRaw === "string" && expiryRaw.length > 0 ? expiryRaw : null,
    reason:
      typeof expiryRaw === "string" && expiryRaw.length > 0
        ? "Pro active until expiry."
        : "Pro active (no expiry set yet — legacy or manual).",
  };
}

/** True if stored metadata says Pro but the expiry date is in the past (needs Clerk downgrade). */
export function isProExpiredInMetadata(input: ResolveSubscriptionInput): boolean {
  if (input.payment_status) return false;
  if (!hasProFlags(input)) return false;
  const expiryRaw = input.plan_expiry;
  if (typeof expiryRaw !== "string" || expiryRaw.length === 0) return false;
  const end = new Date(expiryRaw);
  const now = input.now ?? new Date();
  return Number.isFinite(end.getTime()) && now.getTime() > end.getTime();
}
