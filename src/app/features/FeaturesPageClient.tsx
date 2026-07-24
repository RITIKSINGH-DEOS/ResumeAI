"use client";

import { MarketingShell } from "@/components/MarketingShell";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";

export function FeaturesPageClient() {
  return (
    <MarketingShell>
      <FeaturesSection />
      <HowItWorksSection />
    </MarketingShell>
  );
}
