"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";

type PricingSectionProps = {
  onPickFile?: () => void;
  onPro?: () => void;
  /** Optional fallback if Razorpay API / env is not configured */
  onCheckoutRazorpay?: () => void;
};

function RazorpayMark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight ${className ?? ""}`}
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <span className="text-sky-400">razor</span>
      <span className="text-white">pay</span>
    </span>
  );
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function PricingSection({ onPickFile, onPro, onCheckoutRazorpay }: PricingSectionProps) {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [razorpayBusy, setRazorpayBusy] = useState(false);

  const razorpayUrl = process.env.NEXT_PUBLIC_RAZORPAY_PRO_URL?.trim();
  const isPro = isPremiumPublicMetadata(user?.publicMetadata as Record<string, unknown> | undefined);

  const handleRazorpay = useCallback(async () => {
    if (!isLoaded) return;
    /** Already paid — don’t open checkout or external pay link again */
    if (userId && isPro) {
      toast.success("You're on Pro — taking you to the app.");
      onPro?.();
      return;
    }
    if (razorpayUrl) {
      window.open(razorpayUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!userId) {
      router.push("/");
      return;
    }
    setRazorpayBusy(true);
    try {
      const res = await fetch("/api/checkout/razorpay", { method: "POST" });
      const data = (await res.json()) as {
        keyId?: string;
        orderId?: string;
        amount?: number;
        currency?: string;
        error?: string;
      };
      if (res.status === 409 && (data as { code?: string }).code === "ALREADY_PRO") {
        toast.success("You're on Pro — taking you to the app.");
        onPro?.();
        return;
      }
      if (!res.ok) {
        toast.error(data.error || "Razorpay checkout unavailable");
        (onCheckoutRazorpay ?? onPro)?.();
        return;
      }
      if (!data.keyId || !data.orderId || data.amount == null || !data.currency) {
        toast.error("Invalid order response");
        return;
      }
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        toast.error("Could not load Razorpay Checkout");
        return;
      }
      const email = user?.primaryEmailAddress?.emailAddress;
      const rawPhone =
        user?.primaryPhoneNumber?.phoneNumber ?? user?.phoneNumbers?.[0]?.phoneNumber ?? undefined;
      const contact = rawPhone?.replace(/\D/g, "").slice(-10);
      const prefill =
        email || contact
          ? {
              ...(email ? { email } : {}),
              ...(contact && contact.length >= 10 ? { contact } : {}),
            }
          : undefined;

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ResumeAI",
        description: "Pro",
        order_id: data.orderId,
        prefill,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: true,
        },
        theme: { color: "#0ea5e9" },
        handler: async (response) => {
          try {
            const v = await fetch("/api/checkout/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const out = (await v.json().catch(() => ({}))) as { error?: string };
            if (!v.ok) {
              toast.error(out.error || "Could not verify payment");
              return;
            }
            toast.success("You're on Pro — enjoy!");
            window.location.href = "/pricing?success=razorpay";
          } catch {
            toast.error("Verification failed");
          }
        },
      });
      rzp.on("payment.failed", (resp) => {
        toast.error(resp.error?.description || "Payment failed");
      });
      rzp.open();
    } catch {
      toast.error("Network error");
      (onCheckoutRazorpay ?? onPro)?.();
    } finally {
      setRazorpayBusy(false);
    }
  }, [isLoaded, userId, isPro, razorpayUrl, user, router, onCheckoutRazorpay, onPro]);

  return (
    <section className="border-t border-white/[0.04] py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">Simple pricing</h1>
          <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
            Start free. Upgrade when you&apos;re ready to move faster.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 sm:mt-12 sm:gap-6 md:grid-cols-3">
          {/* ── Free ── */}
          <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition-all duration-300 hover:border-white/[0.12] sm:p-8">
            <h2 className="text-lg font-semibold text-white">Free</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ₹0<span className="text-base font-normal text-zinc-500">/forever</span>
            </p>
            <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-zinc-400">
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> 3 analyses / month
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> ATS score &amp; summary
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> Basic suggestions
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> Up to 2 resumes on dashboard
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> Resume builder (2 templates)
              </li>
            </ul>
            <button
              type="button"
              className="btn btn-outline mt-8 min-h-[48px] w-full rounded-xl border-white/15 transition-all duration-300 hover:border-orange-500/40 hover:bg-orange-500/[0.08] sm:mt-10"
              onClick={onPickFile}
              title={
                userId
                  ? "Open the app — your plan (Pro or Free) is unchanged here."
                  : undefined
              }
            >
              {userId ? "Open app" : "Get started"}
            </button>
          </div>

          {/* ── Bring Your Own Key ── */}
          <div className="flex flex-col rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.06] to-transparent p-6 transition-all duration-300 hover:border-emerald-400/45 sm:p-8">
            <span className="mb-2 w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Free + AI
            </span>
            <h2 className="text-lg font-semibold text-white">Your API Key</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ₹0<span className="text-base font-normal text-zinc-500">/forever</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Add your own Gemini API key in Dashboard — all AI features unlocked, zero cost from us.
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Everything in Free
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Gemini polish &amp; deep ATS report
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> AI-powered suggestions
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Your key, your quota
              </li>
            </ul>
            <button
              type="button"
              className="btn mt-6 min-h-[48px] w-full rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-sm font-semibold text-emerald-100 transition-all hover:bg-emerald-500/20 active:scale-[0.99] sm:mt-8"
              onClick={() => router.push(userId ? "/dashboard" : "/")}
            >
              Add key in Dashboard
            </button>
          </div>

          {/* ── Pro ── */}
          <div className="relative flex flex-col rounded-2xl border border-orange-500/40 bg-gradient-to-b from-orange-500/[0.08] to-transparent p-6 shadow-[0_0_50px_-18px_rgba(249,115,22,0.35)] transition-all duration-300 hover:border-orange-400/55 sm:p-8">
            <span className="badge badge-primary badge-sm mb-2 w-fit">Popular</span>
            <h2 className="text-lg font-semibold text-white">Pro</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              ₹29<span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Unlimited analyses
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Deep keyword &amp; role fit
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Rewrite blocks &amp; export
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Priority processing
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Gemini polish — no key needed
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Unlimited dashboard resumes
              </li>
            </ul>

            <button
              type="button"
              onClick={handleRazorpay}
              disabled={razorpayBusy}
              className={
                isPro && userId
                  ? "btn mt-6 min-h-[48px] w-full rounded-xl border border-emerald-500/45 bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-100 transition-all hover:bg-emerald-500/25 active:scale-[0.99] disabled:opacity-60 sm:mt-8"
                  : "btn mt-6 min-h-[48px] w-full rounded-xl border border-sky-500/40 bg-sky-500/15 px-3 text-sm font-semibold text-sky-100 transition-all hover:bg-sky-500/25 active:scale-[0.99] disabled:opacity-60 sm:mt-8"
              }
            >
              {razorpayBusy ? (
                "Opening…"
              ) : isPro && userId ? (
                "Continue — you're on Pro"
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  Pay with <RazorpayMark className="text-base" />
                </span>
              )}
            </button>
            {!isPro || !userId ? (
              <button
                type="button"
                className="btn btn-ghost mt-2 min-h-10 w-full rounded-lg border border-white/10 text-xs font-normal text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                onClick={onPro}
              >
                Or continue on web — same plan
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
