import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { grantProToClerkUser } from "@/lib/payments/grantPro";
import { getRazorpayKeyId, getRazorpayKeySecret } from "@/lib/payments/razorpayEnv";

export const runtime = "nodejs";

type VerifyBody = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

/**
 * Verifies Razorpay payment signature and that the order belongs to the signed-in user, then grants Pro.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = getRazorpayKeySecret();
  const keyId = getRazorpayKeyId();
  if (!secret || !keyId) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 503 });
  }

  const body = (await request.json()) as VerifyBody;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const generated = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: secret });
  const order = await razorpay.orders.fetch(razorpay_order_id);
  const noteUid =
    order.notes && typeof order.notes === "object"
      ? (order.notes as Record<string, string>).clerk_user_id
      : undefined;

  if (noteUid !== userId) {
    return NextResponse.json({ error: "Order does not match signed-in user" }, { status: 403 });
  }

  await grantProToClerkUser(userId);
  return NextResponse.json({ ok: true });
}
