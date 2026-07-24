import Link from "next/link";
import { SectionLink } from "./SectionLink";

export function LandingFooter() {
  return (
    <footer className="relative z-10 mt-10 border-t border-[#2a2a2a] bg-[#0a0a0a]/90 text-base-content backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            className="resume-ai-logo-static text-base font-medium tracking-tight transition-transform duration-300 ease-out hover:scale-[1.02]"
          >
            <span className="text-[#f0f0f0]">Resume</span>
            <span className="text-[#f97316]">AI</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:gap-x-10">
            <SectionLink
              section="features"
              className="cursor-pointer font-medium text-[#666666] transition-all duration-300 ease-out hover:text-[#f0f0f0]"
            >
              Features
            </SectionLink>
            <SectionLink
              section="pricing"
              className="cursor-pointer font-medium text-[#666666] transition-all duration-300 ease-out hover:text-[#f0f0f0]"
            >
              Pricing
            </SectionLink>
            <Link
              href="/docs"
              className="font-medium text-[#666666] transition-all duration-300 ease-out hover:text-[#f0f0f0]"
            >
              Docs
            </Link>
          </nav>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="badge badge-outline badge-sm rounded-full border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#666666] transition-all duration-300 ease-out md:text-[11px]">
              ATS
            </span>
            <span className="badge badge-sm rounded-full border border-[#f97316]/35 bg-[#f97316]/[0.1] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#f97316] md:text-[11px]">
              AI-powered
            </span>
          </div>

          <p className="text-xs font-normal tracking-wide text-[#666666]">
            © 2026 ResumeAI · Built by Ritik Singh
          </p>
        </div>
      </div>
    </footer>
  );
}
