# Razorpay

Pro checkout uses **Razorpay** (orders + Checkout + verify). Successful payment sets **Clerk Pro** (`publicMetadata.premium` / `plan: pro`).

| Step | Route |
|------|--------|
| Create order | `POST /api/checkout/razorpay` |
| Verify payment & grant Pro | `POST /api/checkout/razorpay/verify` |
| Webhook (optional redundancy) | `POST /api/webhooks/razorpay` |

## Environment variables

See **`.env.example`**. Minimum:

- `RAZORPAY_KEY_ID` (or `razorpay_key_id`)  
- `RAZORPAY_KEY_SECRET` (or `razorpay_key_secret`)  
- `RAZORPAY_PRO_AMOUNT_PAISE` — amount in paise (e.g. `2900` = ₹29). If omitted but keys are set, the app defaults to ₹29 and logs a warning.  
- `RAZORPAY_WEBHOOK_SECRET` — Razorpay Dashboard → Webhooks  
- `NEXT_PUBLIC_APP_URL` — optional; useful for production redirects  

**Optional:** `NEXT_PUBLIC_RAZORPAY_PRO_URL` — opens a hosted Razorpay link in a new tab instead of the API order flow.

## Webhook URL

`https://<your-domain>/api/webhooks/razorpay` — subscribe to `payment.captured`.

## Google Pay, PhonePe, UPI

In India, **Google Pay** appears under **UPI** in Razorpay Checkout. If the UPI section is missing, enable **UPI** in Razorpay Dashboard → Payment methods and complete KYC.

See earlier troubleshooting in repo history or Razorpay docs.

## Console: `localhost:7071` image errors

Razorpay’s scripts may request assets on `localhost:7071`; nothing listens there in dev. Usually harmless.

## Clerk & subscription

On successful payment, the app sets **Pro for 30 days**:

```json
{
  "premium": true,
  "plan": "pro",
  "plan_expiry": "<ISO-8601 — now + 30 days>"
}
```

- **`plan_expiry` in the past** → user is treated as **Free** (feature gates).  
- **`GET /api/plan`** — returns `{ plan, plan_expiry, reason }` and persists a downgrade if the period ended.  
- **`POST /api/plan`** — body `{ "payment_status": "success" }` grants Pro + 30d (same as checkout); `"failed"` returns current plan without revoking an existing Pro subscription.

Manual revoke: Clerk Dashboard or **Switch to Free** on pricing (calls revoke).
