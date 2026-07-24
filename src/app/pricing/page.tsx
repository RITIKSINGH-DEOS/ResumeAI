import type { Metadata } from "next";
import { PricingPageClient } from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing · ResumeAI",
  description: "Free and Pro plans — start free, upgrade when you are ready.",
};

export default function PricingPage() {
  return <PricingPageClient />;
}
