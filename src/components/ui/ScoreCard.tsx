"use client";

import { motion } from "framer-motion";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type ScoreCardProps = {
  score: number;
  /** Shown under the progress bar */
  topIssueLine: string;
  className?: string;
};

export function ScoreCard({ score, topIssueLine, className }: ScoreCardProps) {
  const pct = Math.min(100, Math.max(0, score));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <SurfaceCard
        hoverLift
        eyebrow="ATS signal"
        title="Match score"
        titleIcon={<span className="text-orange-400">◎</span>}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-full">
            <p className="flex items-baseline gap-1 font-mono tabular-nums">
              <span className="text-5xl font-bold tracking-tight text-white sm:text-6xl">{score}</span>
              <span className="text-lg font-medium text-zinc-500">/100</span>
            </p>
            <div className="mt-4 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-zinc-800/90 ring-1 ring-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300 shadow-[0_0_24px_-4px_rgba(249,115,22,0.7)]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
            <p className="mt-4 text-xs font-medium leading-relaxed text-zinc-400">
              <span className="text-zinc-500">Top issue blocking you: </span>
              <span className="text-zinc-200">{topIssueLine}</span>
            </p>
          </div>
        </div>
      </SurfaceCard>
    </motion.div>
  );
}
