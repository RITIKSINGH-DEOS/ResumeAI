"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  /** Subtle hover lift + glow (cards in dashboard) */
  hoverLift?: boolean;
  /** Section label above children */
  eyebrow?: string;
  title?: string;
  titleIcon?: ReactNode;
};

export function SurfaceCard({ children, className, hoverLift, eyebrow, title, titleIcon }: SurfaceCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-sm",
        hoverLift &&
          "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_12px_40px_-16px_rgba(249,115,22,0.18)]",
        className
      )}
    >
      {(eyebrow || title) && (
        <header className="mb-4">
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p>
          )}
          {title && (
            <h3 className="mt-1 flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
              {titleIcon}
              {title}
            </h3>
          )}
        </header>
      )}
      {children}
    </div>
  );
}
