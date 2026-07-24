/** Razorpay Checkout script (https://checkout.razorpay.com/v1/checkout.js) */

export type RazorpaySuccessPayload = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

/** Turn payment rails on/off in Checkout (UPI = Google Pay, PhonePe, etc. in India). */
export type RazorpayMethodFlags = {
  upi?: boolean;
  card?: boolean;
  netbanking?: boolean;
  wallet?: boolean;
  emi?: boolean;
  paylater?: boolean;
};

export type RazorpayConstructorOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpaySuccessPayload) => void | Promise<void>;
  prefill?: { email?: string; name?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  /** Prefer all true so UPI (Google Pay / PhonePe) can appear when enabled on your Razorpay account. */
  method?: RazorpayMethodFlags;
};

export type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error: { description: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayConstructorOptions) => RazorpayInstance;
  }
}

export {};
