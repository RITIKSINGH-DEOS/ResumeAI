"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MarketingShell } from "@/components/MarketingShell";
import { PricingSection } from "@/components/landing/PricingSection";

export function PricingPageClient() {
  const router = useRouter();
  /** Open app → home (same landing as navbar logo) */
  const goApp = () => router.push("/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    if (success === "razorpay") {
      toast.success("Welcome to Pro!");
      window.history.replaceState({}, "", "/pricing");
    }
    if (params.get("canceled") === "1") {
      toast("Checkout canceled", { icon: "ℹ️" });
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  return (
    <MarketingShell>
      <PricingSection onPickFile={goApp} onPro={goApp} onCheckoutRazorpay={goApp} />
    </MarketingShell>
  );
}
