"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { NavbarClerkFallback } from "./NavbarClerkFallback";
import { NavbarUserButton } from "./NavbarUserButton";
import { SectionLink } from "./SectionLink";
import { GoogleSignInButton } from "./GoogleSignInButton";

const googleBtnClass =
  "btn min-h-[44px] rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-3 text-xs font-medium text-[#f0f0f0] transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[#f97316]/40 hover:bg-[#1a1a1a] sm:min-h-10 sm:px-4 sm:text-sm";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <NavbarClerkFallback />;
  }

  return (
    <header
      id="site-navbar"
      className={`sticky top-0 z-50 w-full border-b border-[#2a2a2a] backdrop-blur-md transition-all duration-300 ease-out ${
        scrolled ? "bg-[#0a0a0a]/90 shadow-[0_1px_0_0_#2a2a2a]" : "bg-[#0a0a0a]/80"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-4 md:px-6 md:py-3.5">
        <SignedOut>
          <Link
            className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
            href="/"
          >
            <span className="text-[#f0f0f0]">Resume</span>
            <span className="text-[#f97316]">AI</span>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
            href="/"
          >
            <span className="text-[#f0f0f0]">Resume</span>
            <span className="text-[#f97316]">AI</span>
          </Link>
        </SignedIn>

        <nav
          className="flex min-w-0 flex-1 justify-center gap-1 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-2 [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          <SectionLink
            section="features"
            className="shrink-0 cursor-pointer whitespace-nowrap px-2 py-2 text-xs font-medium text-[#666666] transition-all duration-300 ease-out hover:text-[#f0f0f0] sm:px-3 sm:text-sm"
          >
            Features
          </SectionLink>
          <SectionLink
            section="pricing"
            className="shrink-0 cursor-pointer whitespace-nowrap px-2 py-2 text-xs font-medium text-[#666666] transition-all duration-300 ease-out hover:text-[#f0f0f0] sm:px-3 sm:text-sm"
          >
            Pricing
          </SectionLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SignedOut>
            <GoogleSignInButton className={googleBtnClass} />
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="btn btn-ghost inline-flex min-h-0 px-2 text-xs text-[#666666] transition-all duration-300 ease-out hover:text-[#f0f0f0] sm:px-3 sm:text-sm"
            >
              Dashboard
            </Link>
            <NavbarUserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
