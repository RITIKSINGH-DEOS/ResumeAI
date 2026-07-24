"use client";

import Link from "next/link";
import type { RecruiterBrief } from "@/lib/recruiterBrief";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ScoreCard } from "@/components/ui/ScoreCard";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { cn } from "@/lib/cn";

function SkillBadges({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "matched" | "gap";
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 10).map((s) => (
          <span
            key={s}
            className={cn(
              "inline-flex max-w-full truncate rounded-lg border px-2 py-0.5 text-[11px] font-medium",
              variant === "matched"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/95"
                : "border-amber-500/25 bg-amber-500/10 text-amber-200/90"
            )}
            title={s}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function BulletList({ items, markerClass }: { items: string[]; markerClass: string }) {
  return (
    <ul className="space-y-2.5">
      {items.map((line, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-zinc-300">
          <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", markerClass)} aria-hidden />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

export type RecruiterInsightsDashboardProps = {
  brief: RecruiterBrief | null;
  isPro: boolean;
  /** Fallback when brief missing */
  score: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  /** Optional portfolio suggestions from editor payload */
  projectIdeas?: string[];
};

export function RecruiterInsightsDashboard({
  brief,
  isPro,
  score,
  matchedSkills = [],
  missingSkills = [],
  projectIdeas = [],
}: RecruiterInsightsDashboardProps) {
  const displayScore = brief?.score ?? score;
  const topIssue =
    brief?.weaknesses[0] ??
    "Add measurable outcomes to your strongest role — recruiters scan for impact first.";

  if (!brief) {
    return (
      <div className="flex flex-col gap-4">
        <SurfaceCard className="border-dashed border-white/[0.12] bg-white/[0.01]">
          <p className="text-sm font-medium text-zinc-300">No analysis loaded</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Run the pipeline on the{" "}
            <Link href="/" className="font-medium text-orange-400 underline-offset-2 hover:underline">
              home page
            </Link>{" "}
            to unlock your score, strengths, and ATS-aligned fixes.
          </p>
        </SurfaceCard>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-zinc-900/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ScoreCard score={displayScore} topIssueLine={topIssue} />

      {/* Skills snapshot */}
      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <SurfaceCard eyebrow="Skills" title="Keyword snapshot" hoverLift>
          <div className="space-y-5">
            <SkillBadges label="Aligned" items={matchedSkills} variant="matched" />
            <SkillBadges label="Gaps to close" items={missingSkills} variant="gap" />
          </div>
        </SurfaceCard>
      )}

      {!isPro ? (
        <SurfaceCard className="border-sky-500/20 bg-sky-500/[0.04]">
          <p className="text-sm text-zinc-300">
            <span className="font-semibold text-sky-300">Free plan:</span> full strengths, weaknesses, and quick fixes
            are on{" "}
            <Link href="/pricing" className="font-medium text-sky-400 underline-offset-2 hover:underline">
              Pro
            </Link>
            .
          </p>
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard eyebrow="Signals" title="Strengths" titleIcon={<span className="text-emerald-400">✓</span>} hoverLift>
            <BulletList items={brief.strengths} markerClass="bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </SurfaceCard>

          <SurfaceCard eyebrow="Risks" title="Weaknesses" titleIcon={<span className="text-amber-400">!</span>} hoverLift>
            <BulletList items={brief.weaknesses} markerClass="bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.45)]" />
          </SurfaceCard>

          <SurfaceCard eyebrow="Next step" title="Quick fixes" titleIcon={<span className="text-orange-400">⚡</span>} hoverLift>
            <BulletList items={brief.quickFixes} markerClass="bg-orange-400/90 shadow-[0_0_8px_rgba(249,115,22,0.45)]" />
          </SurfaceCard>

          <ProjectCard ideas={projectIdeas} />
        </>
      )}
    </div>
  );
}
