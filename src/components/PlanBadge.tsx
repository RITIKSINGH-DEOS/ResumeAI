"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type PlanBadgeProps = {
  isPro: boolean;
  className?: string;
} & Pick<HTMLAttributes<HTMLSpanElement>, "aria-label">;

/**
 * Optional “Free” pill for contexts like dashboard. Navbar uses avatar styling only (no Free label).
 */
export function PlanBadge({ isPro, className, "aria-label": ariaLabel }: PlanBadgeProps) {
  if (isPro) return null;

  return (
    <span
      aria-label={ariaLabel ?? "Free plan"}
      className={cn(
        "inline-flex items-center rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300 shadow-[0_0_14px_-4px_rgba(56,189,248,0.3)]",
        className
      )}
    >
      Free
    </span>
  );
}
