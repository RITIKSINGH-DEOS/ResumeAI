"use client";

import { cn } from "@/lib/cn";

export type EditorTabId = "edit" | "preview" | "recruiter";

const TABS: { id: EditorTabId; label: string }[] = [
  { id: "edit", label: "Edit" },
  { id: "preview", label: "Preview" },
  { id: "recruiter", label: "Recruiter view" },
];

type EditorTabsProps = {
  active: EditorTabId;
  onChange: (id: EditorTabId) => void;
  /** Wider home-style navbar: slightly tighter padding */
  variant?: "default" | "navbar";
};

export function EditorTabs({ active, onChange, variant = "default" }: EditorTabsProps) {
  const isNav = variant === "navbar";
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-white/[0.08] bg-[#141414] p-1 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]",
        isNav && "max-w-full"
      )}
      role="tablist"
      aria-label="Editor mode"
    >
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "relative rounded-lg font-medium transition-all duration-200",
              isNav ? "px-2.5 py-1.5 text-[11px] sm:px-3 sm:py-2 sm:text-xs" : "px-4 py-2 text-xs sm:text-[13px]",
              isActive
                ? "text-white shadow-[0_0_0_1px_rgba(249,115,22,0.35),0_4px_20px_-4px_rgba(249,115,22,0.35)]"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {isActive && (
              <span
                className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-b from-orange-500/25 to-orange-600/10 ring-1 ring-orange-500/30"
                aria-hidden
              />
            )}
            {isNav && id === "recruiter" ? (
              <>
                <span className="sm:hidden">Recruiter</span>
                <span className="hidden sm:inline">Recruiter view</span>
              </>
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
}
