"use client";

import { cn } from "@/lib/cn";

export const DOCS_NAV = [
  { id: "getting-started", label: "Getting Started" },
  { id: "features", label: "Features" },
  { id: "scoring", label: "How Scoring Works" },
  { id: "pricing", label: "Pricing" },
  { id: "privacy", label: "Privacy" },
  { id: "faq", label: "FAQ" },
  { id: "about", label: "About" },
] as const;

type DocsNavProps = {
  className?: string;
  /** Vertical list (sidebar) or horizontal pills (mobile) */
  variant?: "sidebar" | "mobile";
};

export function DocsNav({ className, variant = "sidebar" }: DocsNavProps) {
  if (variant === "mobile") {
    return (
      <nav
        className={cn(
          "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
        aria-label="Documentation sections"
      >
        {DOCS_NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </nav>
    );
  }

  return (
    <nav className={cn("space-y-0.5", className)} aria-label="Documentation">
      <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">On this page</p>
      {DOCS_NAV.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="block rounded-lg border border-transparent px-2 py-2 text-sm text-zinc-400 transition-all duration-200 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-white"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
