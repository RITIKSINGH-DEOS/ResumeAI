"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

type ResumeRoastPanelProps = {
  resumeText: string;
  isPro: boolean;
  /** Extra classes for the outer card (editor dashboard) */
  className?: string;
};

/**
 * Lower panel: Gemini-powered playful roast (POST /api/roast-resume).
 */
export function ResumeRoastPanel({ resumeText, isPro, className = "" }: ResumeRoastPanelProps) {
  const [roast, setRoast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runRoast = useCallback(async () => {
    if (!resumeText.trim()) {
      toast.error("No resume text — run analysis first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/roast-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });
      const data = (await res.json()) as { roast?: string; error?: string; code?: string };
      if (!res.ok) {
        if (data.code === "PREMIUM_REQUIRED") {
          toast.error("Pro required for Gemini roast.");
          return;
        }
        if (data.code === "AUTH") {
          toast.error("Sign in to use roast.");
          return;
        }
        toast.error(data.error || "Roast failed");
        return;
      }
      if (data.roast) {
        setRoast(data.roast);
        toast.success("Fresh roast from Gemini");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [resumeText]);

  if (!resumeText.trim()) return null;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-950/50 via-[#121212] to-[#0D0D0D] px-5 py-5 shadow-[0_0_0_1px_rgba(244,63,94,0.12)_inset,0_20px_50px_-24px_rgba(225,29,72,0.28)] transition-all duration-300 hover:border-rose-400/35 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400/90">Gemini</p>
          <h3 className="mt-1 flex items-center gap-2 text-base font-semibold text-white">
            <span aria-hidden>🔥</span> Lower roast
          </h3>
          <p className="mt-1 max-w-prose text-xs leading-relaxed text-zinc-500">
            Witty call-outs on buzzwords, vague metrics, and weak bullets — powered by the Gemini API (Pro).
          </p>
        </div>
        {isPro ? (
          <button
            type="button"
            onClick={runRoast}
            disabled={loading}
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl border border-rose-500/30 bg-rose-500/15 px-4 py-2.5 text-sm font-semibold text-rose-50 shadow-[0_0_20px_-8px_rgba(244,63,94,0.45)] transition-all duration-300 hover:scale-[1.03] hover:border-rose-400/50 hover:bg-rose-500/25 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rose-300/40 border-t-rose-100" />
                Roasting…
              </>
            ) : (
              <>
                <span aria-hidden>🔥</span>
                {roast ? "Roast again" : "Get roast"}
              </>
            )}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="btn shrink-0 rounded-xl border border-zinc-600 bg-zinc-900/80 px-4 py-2.5 text-center text-sm font-semibold text-zinc-300 hover:border-rose-500/40 hover:text-white"
          >
            Pro — unlock roast
          </Link>
        )}
      </div>

      <AnimatePresence mode="wait">
        {roast && isPro ? (
          <motion.div
            key="roast-body"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-xl border border-white/[0.08] bg-black/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-rose-400/85">Roast output</p>
            <ul className="space-y-2.5">
              {roast
                .split(/\n+/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-zinc-300">
                    <span className="mt-0.5 shrink-0 text-rose-400/70" aria-hidden>
                      ▸
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
            </ul>
          </motion.div>
        ) : !isPro ? (
          <p className="mt-3 text-[11px] text-zinc-600">
            Roast uses your analyzed resume text + Gemini. Available on{" "}
            <Link href="/pricing" className="text-rose-400/90 underline-offset-2 hover:underline">
              Pro
            </Link>
            .
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
