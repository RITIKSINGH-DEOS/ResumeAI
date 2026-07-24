import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { resolveSubscriptionPlan } from "@/lib/subscriptionPlan";
import { grantProToClerkUser } from "@/lib/payments/grantPro";
import { syncExpiredPlanForUser } from "@/lib/payments/syncPlanExpiry";

export const runtime = "nodejs";

type Body = {
  payment_status?: "success" | "failed";
};

/**
 * GET — current plan after expiry sync (rule 3).
 * POST — optional `payment_status`: success grants Pro + 30d; failed is informational (does not revoke active Pro).
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolution = await syncExpiredPlanForUser(userId);
    return NextResponse.json(resolution);
  } catch (e) {
    console.error("[api/plan GET]", e);
    return NextResponse.json({ error: "Plan resolution failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  try {
    if (body.payment_status === "success") {
      await grantProToClerkUser(userId);
      const resolution = await syncExpiredPlanForUser(userId);
      return NextResponse.json(resolution);
    }

    if (body.payment_status === "failed") {
      const user = await currentUser();
      const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
      /** Rule 2: failed payment does not remove an existing Pro subscription */
      const current = resolveSubscriptionPlan({
        stored_plan: typeof meta.plan === "string" ? meta.plan : null,
        stored_premium: meta.premium === true ? true : null,
        plan_expiry: typeof meta.plan_expiry === "string" ? meta.plan_expiry : null,
      });
      return NextResponse.json({
        plan: current.plan,
        plan_expiry: current.plan_expiry,
        reason:
          current.plan === "pro"
            ? "Payment attempt failed; your Pro subscription is unchanged."
            : resolveSubscriptionPlan({ payment_status: "failed" }).reason,
      });
    }

    const resolution = await syncExpiredPlanForUser(userId);
    return NextResponse.json(resolution);
  } catch (e) {
    console.error("[api/plan POST]", e);
    return NextResponse.json({ error: "Plan resolution failed" }, { status: 500 });
  }
}
