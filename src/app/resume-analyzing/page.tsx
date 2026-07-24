import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { ResumeAnalyzingClient } from "@/components/resume-analyzing/ResumeAnalyzingClient";

export const metadata: Metadata = {
  title: "Resume insights · ResumeAI",
  description: "Skills, projects, and certificates from your resume.",
};

export default function ResumeAnalyzingPage() {
  return (
    <MarketingShell>
      <ResumeAnalyzingClient />
    </MarketingShell>
  );
}
