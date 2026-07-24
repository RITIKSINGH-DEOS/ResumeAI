/**
 * Reads Razorpay credentials from env. Supports both UPPER_SNAKE and lowercase keys
 * (some .env files use razorpay_key_id / razorpay_key_secret).
 */
export function getRazorpayKeyId(): string | undefined {
  return (
    process.env.RAZORPAY_KEY_ID?.trim() ||
    process.env.razorpay_key_id?.trim() ||
    undefined
  );
}

export function getRazorpayKeySecret(): string | undefined {
  return (
    process.env.RAZORPAY_KEY_SECRET?.trim() ||
    process.env.razorpay_key_secret?.trim() ||
    undefined
  );
}

/** Amount in paise (₹1 = 100 paise). Default ₹29 if unset but keys are present (matches pricing UI). */
const DEFAULT_PRO_AMOUNT_PAISE = 2900;

export function getRazorpayProAmountPaise(): number {
  const raw = process.env.RAZORPAY_PRO_AMOUNT_PAISE?.trim();
  if (raw) {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function resolveRazorpayAmountPaise(
  keyId: string | undefined,
  keySecret: string | undefined
): { amount: number; usedDefault: boolean } {
  const explicit = getRazorpayProAmountPaise();
  if (explicit >= 100) {
    return { amount: explicit, usedDefault: false };
  }
  if (keyId && keySecret) {
    return { amount: DEFAULT_PRO_AMOUNT_PAISE, usedDefault: true };
  }
  return { amount: 0, usedDefault: false };
}
