import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { revokeProFromClerkUser } from "@/lib/payments/revokePro";

export const runtime = "nodejs";

/**
 * User explicitly chooses the Free plan from pricing — clears Pro flags in Clerk.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await revokeProFromClerkUser(userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[switch-to-free]", e);
    return NextResponse.json({ error: "Could not update plan" }, { status: 500 });
  }
}
