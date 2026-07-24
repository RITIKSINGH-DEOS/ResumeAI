"use client";

import Link from "next/link";
import type { RecruiterBrief } from "@/lib/recruiterBrief";

type RecruiterBriefPanelProps = {
  brief: RecruiterBrief;
  /** Pro users see full Strengths / Weaknesses / Quick Fix. Free users see Score only. */
  isPro: boolean;
};

export function RecruiterBriefPanel({ brief, isPro }: RecruiterBriefPanelProps) {
  return (
    <div className="mt-4 rounded-xl border border-orange-500/20 bg-zinc-950/60 px-4 py-4 text-left shadow-[0_12px_40px_-20px_rgba(249,115,22,0.12)] sm:px-5 sm:py-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/90">Recruiter snapshot</p>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
        <section>
          <h3 className="mb-1.5 flex items-center gap-2 font-semibold text-orange-400">
            <span aria-hidden>📊</span> Score
          </h3>
          <p className="text-zinc-300">
            <span className="font-mono text-lg font-bold tabular-nums text-orange-400">{brief.score}</span>
            <span className="text-zinc-500">/100</span>
            <span className="text-zinc-500"> — </span>
            {brief.scoreReason}
          </p>
        </section>

        {!isPro ? (
          <div className="rounded-lg border border-sky-500/25 bg-sky-500/[0.06] px-3 py-3">
            <p className="text-xs text-zinc-400">
              <span className="font-semibold text-sky-300/95">Free plan:</span> full recruiter feedback (Strengths,
              Weaknesses, Quick fixes) is on{" "}
              <Link href="/pricing" className="font-medium text-sky-400 underline-offset-2 hover:underline">
                Pro
              </Link>
              . Upgrade to see the sections below for this resume.
            </p>
          </div>
        ) : (
          <>
            <hr className="border-white/10" />
            <section>
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-orange-400">
                <span aria-hidden>✅</span> Strengths
              </h3>
              <ul className="list-inside list-disc space-y-1.5 text-zinc-400 marker:text-orange-400/80">
                {brief.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>

            <hr className="border-white/10" />
            <section>
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-orange-400">
                <span aria-hidden>❌</span> Weaknesses
              </h3>
              <ul className="list-inside list-disc space-y-1.5 text-zinc-400 marker:text-orange-400/80">
                {brief.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </section>

            <hr className="border-white/10" />
            <section>
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-orange-400">
                <span aria-hidden>💡</span> Quick fix
              </h3>
              <ul className="list-inside list-disc space-y-1.5 text-zinc-400 marker:text-orange-400/80">
                {brief.quickFixes.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
