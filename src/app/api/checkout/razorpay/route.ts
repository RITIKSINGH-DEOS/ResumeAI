import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { getRazorpayKeyId, getRazorpayKeySecret, resolveRazorpayAmountPaise } from "@/lib/payments/razorpayEnv";

export const runtime = "nodejs";

/**
 * Creates a Razorpay Order for one-time Pro checkout (INR by default).
 * Client completes payment via Razorpay Checkout, then POST /api/checkout/razorpay/verify.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const meta = clerkUser?.publicMetadata as Record<string, unknown> | undefined;
  if (isPremiumPublicMetadata(meta)) {
    return NextResponse.json(
      { error: "You're already on Pro.", code: "ALREADY_PRO" },
      { status: 409 }
    );
  }

  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  const { amount, usedDefault } = resolveRazorpayAmountPaise(keyId, keySecret);

  if (!keyId || !keySecret || amount < 100) {
    return NextResponse.json(
      {
        error: "Razorpay is not configured",
        hint:
          "Set RAZORPAY_KEY_ID (or razorpay_key_id), RAZORPAY_KEY_SECRET (or razorpay_key_secret), and RAZORPAY_PRO_AMOUNT_PAISE (paise, min 100). Example: RAZORPAY_PRO_AMOUNT_PAISE=2900 for ₹29.",
      },
      { status: 503 }
    );
  }

  if (usedDefault) {
    console.warn(
      "[razorpay] RAZORPAY_PRO_AMOUNT_PAISE not set — using default ₹29 (2900 paise). Set RAZORPAY_PRO_AMOUNT_PAISE explicitly if you need a different price."
    );
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const currency = (process.env.RAZORPAY_CURRENCY || "INR").trim().toUpperCase();

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `pro_${userId.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40)}`,
    notes: {
      clerk_user_id: userId,
    },
  });

  return NextResponse.json({
    keyId,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });
}
