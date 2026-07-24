"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { EditorTabs, type EditorTabId } from "@/components/editor/EditorTabs";
import { NavbarUserButton } from "@/components/NavbarUserButton";
import { cn } from "@/lib/cn";

type CareerNavbarProps = {
  variant: "career";
};

type FullNavbarProps = {
  variant?: "editor";
  activeTab: EditorTabId;
  onTabChange: (id: EditorTabId) => void;
};

export type EditorNavbarProps = CareerNavbarProps | FullNavbarProps;

function NavbarProfileSlot() {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <SignedIn>
        <NavbarUserButton />
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-up"
          className="text-xs font-medium text-zinc-400 transition-colors hover:text-white sm:text-sm"
        >
          Sign in
        </Link>
      </SignedOut>
    </div>
  );
}

export function EditorNavbar(props: EditorNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = cn(
    "sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md transition-all duration-300 ease-out",
    scrolled ? "bg-black/70 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]" : "bg-black/60"
  );

  if (props.variant === "career") {
    return (
      <header id="editor-navbar" className={headerClass}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 md:px-6 md:py-3">
          <Link
            className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
            href="/"
          >
            ResumeAI
          </Link>
          <div className="ml-auto flex flex-wrap items-center justify-end">
            <Link
              href="/"
              className="shrink-0 text-xs font-medium text-orange-400 transition-colors hover:text-orange-300 sm:text-sm"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const { activeTab, onTabChange } = props;

  return (
    <header id="editor-navbar" className={headerClass}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 md:px-6 md:py-3">
        <Link
          className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
          href="/"
        >
          ResumeAI
        </Link>

        <nav
          className="flex min-w-0 flex-1 justify-center overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Editor views"
        >
          <EditorTabs active={activeTab} onChange={onTabChange} variant="navbar" />
        </nav>

        <NavbarProfileSlot />
      </div>
    </header>
  );
}
