import type { Metadata } from "next";
import { FeaturesPageClient } from "./FeaturesPageClient";

export const metadata: Metadata = {
  title: "Features · ResumeAI",
  description:
    "ATS optimization, scoring, JD alignment, career guide, Gemini polish on paid plans, and secure checkout with Razorpay.",
};

export default function FeaturesPage() {
  return <FeaturesPageClient />;
}
