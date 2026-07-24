"use client";

import { Navbar } from "./Navbar";
import { LandingFooter } from "./LandingFooter";
import { LandingBackground } from "./LandingBackground";

type MarketingShellProps = {
  children: React.ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-x-clip bg-[#0a0a0a] pb-[env(safe-area-inset-bottom)] font-sans text-[#f0f0f0]">
      <LandingBackground />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
