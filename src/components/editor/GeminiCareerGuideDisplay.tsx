"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { GeminiCareerGuide } from "@/lib/careerGuideGemini";
import { cn } from "@/lib/cn";

function searchHref(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query + " jobs")}`;
}

type GeminiCareerGuideDisplayProps = {
  guide: GeminiCareerGuide;
  className?: string;
};

export function GeminiCareerGuideDisplay({ guide, className }: GeminiCareerGuideDisplayProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <section
        id="career-guide-summary"
        className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] via-[#111]/90 to-[#0a0a0a] p-4 shadow-[0_0_48px_-24px_rgba(249,115,22,0.35)] sm:p-5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/90">Overview</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200 sm:text-[15px]">{guide.summary}</p>
      </section>

      {guide.jobOptions.length > 0 && (
        <section id="career-guide-jobs" className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Job paths</p>
          <div className="grid gap-3 sm:grid-cols-1">
            {guide.jobOptions.map((job, i) => (
              <motion.div
                key={`${job.title}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-orange-500/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                  <Link
                    href={searchHref(job.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[11px] font-medium text-orange-400/95 underline-offset-2 hover:text-orange-300 hover:underline"
                  >
                    Explore role →
                  </Link>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{job.responsibilities}</p>
                <p className="mt-2 border-t border-white/[0.06] pt-2 text-xs leading-relaxed text-zinc-500">
                  <span className="font-medium text-zinc-400">Why it fits: </span>
                  {job.why}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {guide.skillsToLearn.length > 0 && (
        <section id="career-guide-skills" className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Skills to build</p>
          {guide.skillsToLearn.map((cat, ci) => (
            <div
              key={`${cat.category}-${ci}`}
              className="rounded-xl border border-white/[0.07] bg-[#0f0f0f] p-4"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wide text-orange-300/90">{cat.category}</h4>
              <ul className="mt-3 space-y-3">
                {cat.skills.map((s, si) => (
                  <li key={`${s.title}-${si}`} className="border-l-2 border-orange-500/30 pl-3">
                    <p className="text-sm font-medium text-zinc-200">{s.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{s.why}</p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{s.how}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {guide.learningApproach.points.length > 0 && (
        <section
          id="career-guide-learning"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
            {guide.learningApproach.title}
          </h4>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-300">
            {guide.learningApproach.points.map((p, i) => (
              <li key={i} className="marker:text-emerald-500/80">
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
