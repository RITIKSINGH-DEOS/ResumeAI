"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { loadStoredAtsReport, type StoredAtsReportSession } from "@/lib/atsReportStorage";
import { loadStoredAnalysisFromStorage, type StoredAnalysis } from "@/lib/analysisStorage";
import { cn } from "@/lib/cn";

function ScoreRing({ score, label = "ATS score" }: { score: number; label?: string }) {
  const s = Math.min(100, Math.max(0, score));
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500/40 bg-orange-500/10 text-3xl font-bold tabular-nums text-white shadow-[0_0_40px_-12px_rgba(249,115,22,0.4)] sm:h-32 sm:w-32 sm:text-4xl"
        aria-label={`Score ${s}`}
      >
        {s}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</span>
    </div>
  );
}

function BreakdownCard({
  title,
  slice,
}: {
  title: string;
  slice: { score: number; feedback: string };
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{title}</h3>
        <span className="tabular-nums text-sm font-semibold text-orange-400/95">{slice.score}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-400">{slice.feedback}</p>
    </div>
  );
}

const priorityColor: Record<string, string> = {
  high: "border-rose-500/30 bg-rose-500/10 text-rose-200/95",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-200/90",
  low: "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/90",
};

function RuleBasedResumeView({ analysis }: { analysis: StoredAnalysis }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6"
    >
      <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/90">Your resume</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Scan results</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Rule-based ATS score and tips. Enable <strong className="text-zinc-300">Gemini polish</strong> on upload for
            a full JSON ATS report.
          </p>
        </div>
        <ScoreRing score={analysis.score} label="ATS score" />
      </div>

      <section>
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Role</h2>
        <p className="text-sm text-zinc-300">{analysis.category.replace(/_/g, " ")}</p>
      </section>

      {analysis.strengths.length > 0 && (
        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Strengths</h2>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400/90" aria-hidden>
                  ✓
                </span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {analysis.weaknesses.length > 0 && (
        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Gaps</h2>
          <ul className="space-y-2">
            {analysis.weaknesses.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-200/90">
                <span aria-hidden>⚠</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {analysis.suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Suggestions</h2>
          <ul className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-zinc-400">
                💡 {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pb-8 text-center">
        <Link href="/" className="text-sm font-medium text-orange-400/95 hover:underline">
          ← Back to home
        </Link>
      </div>
    </motion.div>
  );
}

function GeminiAtsResumeView({ session }: { session: StoredAtsReportSession }) {
  const { report } = session;
  const sb = report.scoreBreakdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6"
    >
      <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/90">Your resume</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">ATS analysis</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">{report.summary}</p>
        </div>
        <ScoreRing score={report.atsScore} />
      </div>

      <section>
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Score breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <BreakdownCard title="Formatting" slice={sb.formatting} />
          <BreakdownCard title="Keywords" slice={sb.keywords} />
          <BreakdownCard title="Structure" slice={sb.structure} />
          <BreakdownCard title="Readability" slice={sb.readability} />
        </div>
      </section>

      {report.strengths.length > 0 && (
        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Strengths</h2>
          <ul className="space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400/90" aria-hidden>
                  ✓
                </span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Suggestions</h2>
          <div className="space-y-3">
            {report.suggestions.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl border p-4",
                  priorityColor[s.priority?.toLowerCase() ?? ""] ?? "border-white/[0.08] bg-white/[0.03]"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{s.category}</span>
                  <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
                    {s.priority}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">Issue: {s.issue}</p>
                <p className="mt-1 text-sm text-zinc-300">{s.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pb-8 text-center">
        <Link href="/" className="text-sm font-medium text-orange-400/95 hover:underline">
          ← Back to home
        </Link>
      </div>
    </motion.div>
  );
}

export function ResumeAtsPageClient() {
  const { user, isLoaded } = useUser();
  const [atsSession, setAtsSession] = useState<StoredAtsReportSession | null>(null);
  const [ruleAnalysis, setRuleAnalysis] = useState<StoredAnalysis | null>(null);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    const ats = loadStoredAtsReport(user.id);
    setAtsSession(ats);
    if (!ats) {
      setRuleAnalysis(loadStoredAnalysisFromStorage(user.id));
    } else {
      setRuleAnalysis(null);
    }
  }, [isLoaded, user?.id]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
        Loading…
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-zinc-400">Sign in to view your resume.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-orange-400 hover:underline">
          Home
        </Link>
      </div>
    );
  }

  if (atsSession) {
    return <GeminiAtsResumeView session={atsSession} />;
  }

  if (ruleAnalysis) {
    return <RuleBasedResumeView analysis={ruleAnalysis} />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="text-zinc-400">No resume yet. Upload a file on the home page to see it here.</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-orange-400"
      >
        Go to home
      </Link>
    </div>
  );
}
