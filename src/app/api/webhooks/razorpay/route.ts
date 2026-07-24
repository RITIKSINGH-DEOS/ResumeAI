import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { grantProToClerkUser } from "@/lib/payments/grantPro";

export const runtime = "nodejs";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        notes?: Record<string, string>;
      };
    };
  };
};

/**
 * Razorpay webhook — Dashboard → Webhooks → add URL, set secret as RAZORPAY_WEBHOOK_SECRET.
 * Subscribe to payment.captured (and optionally order.paid).
 */
export async function POST(request: Request) {
  const body = await request.text();
  const whSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  const sig = (await headers()).get("x-razorpay-signature");

  if (!whSecret) {
    return NextResponse.json({ error: "Razorpay webhook secret not set" }, { status: 503 });
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", whSecret).update(body).digest("hex");

  if (expected !== sig) {
    console.error("[razorpay webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let parsed: RazorpayWebhookPayload;
  try {
    parsed = JSON.parse(body) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (parsed.event === "payment.captured") {
      const uid = parsed.payload?.payment?.entity?.notes?.clerk_user_id;
      if (uid) await grantProToClerkUser(uid);
    }
  } catch (err) {
    console.error("[razorpay webhook] handler:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
