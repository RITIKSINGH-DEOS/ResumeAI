import type { Metadata } from "next";
import Link from "next/link";
import { ResumeAtsPageClient } from "@/components/resume-ats/ResumeAtsPageClient";

export const metadata: Metadata = {
  title: "Your resume · ResumeAI",
  description: "Your formatted resume with ATS scan or Gemini ATS report.",
};

export default function ResumeAtsPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0D0D0D]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-white transition-transform hover:scale-[1.02]"
          >
            ResumeAI
          </Link>
          <Link href="/" className="text-xs font-medium text-orange-400 hover:text-orange-300 sm:text-sm">
            ← Home
          </Link>
        </div>
      </header>
      <ResumeAtsPageClient />
    </div>
  );
}
