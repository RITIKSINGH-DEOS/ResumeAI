"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-500/50 focus:ring-2 focus:ring-zinc-500/25";

type SkillsCareerGuideFormProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
  error: string | null;
  disabled?: boolean;
  /** Show a Clear control when a guide response exists (clears output only, not skills). */
  hasGuideResponse?: boolean;
  onClearResponse?: () => void;
  /** Signed-in user can see Gemini polish row; Pro can enable it (same idea as home analyze). */
  showGeminiPolishRow?: boolean;
  canUseGeminiPolish?: boolean;
  enhanceWithGemini?: boolean;
  onEnhanceWithGeminiChange?: (value: boolean) => void;
};

export function SkillsCareerGuideForm({
  value,
  onChange,
  onGenerate,
  loading,
  error,
  disabled,
  hasGuideResponse = false,
  onClearResponse,
  showGeminiPolishRow = false,
  canUseGeminiPolish = false,
  enhanceWithGemini = true,
  onEnhanceWithGeminiChange,
}: SkillsCareerGuideFormProps) {
  return (
    <div
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      aria-busy={loading}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">Generate your path</h2>
        {hasGuideResponse && onClearResponse ? (
          <button
            type="button"
            onClick={onClearResponse}
            disabled={disabled || loading}
            className="shrink-0 rounded-lg border border-white/15 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-500/50 hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-40"
          >
            Clear
          </button>
        ) : null}
      </div>
      <label htmlFor="career-skills-input" className="mt-4 block text-[11px] uppercase tracking-wide text-zinc-500">
        Skills
      </label>
      <input
        id="career-skills-input"
        type="text"
        className={cn(fieldClass, "mt-1.5 font-mono text-[13px]")}
        placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        autoComplete="off"
      />
      {showGeminiPolishRow ? (
        <div className="mt-3 flex flex-col gap-1.5">
          <label
            className={`flex items-start gap-2 text-left text-sm ${
              canUseGeminiPolish ? "cursor-pointer text-zinc-400" : "cursor-not-allowed text-zinc-600"
            }`}
          >
            <input
              type="checkbox"
              className="mt-1 rounded border-white/20 disabled:opacity-40"
              checked={enhanceWithGemini}
              onChange={(e) => onEnhanceWithGeminiChange?.(e.target.checked)}
              disabled={loading || !canUseGeminiPolish}
            />
            <span>
              Add <span className="text-orange-400/95">Gemini</span> polish.
            </span>
          </label>
          {!canUseGeminiPolish ? (
            <p className="text-[11px] text-zinc-500">
              Upgrade to enable —{" "}
              <Link href="/pricing" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                view plans
              </Link>
              .
            </p>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-amber-400/95" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={disabled || loading || !value.trim()}
        onClick={() => {
          void onGenerate();
        }}
        aria-busy={loading}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/14 bg-zinc-800 px-4 text-sm font-semibold text-zinc-100 shadow-[0_0_20px_-10px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-[1.01] hover:border-orange-300/40 hover:bg-orange-400/95 hover:text-zinc-950 hover:shadow-[0_0_28px_-6px_rgba(251,146,60,0.35)] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 disabled:hover:scale-100 disabled:hover:border-white/14 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-100 disabled:hover:shadow-[0_0_20px_-10px_rgba(0,0,0,0.35)]"
      >
        {loading ? (
          <>
            <span
              className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-500 border-t-orange-400"
              aria-hidden
            />
            <span>Generating…</span>
          </>
        ) : (
          "Generate guide"
        )}
      </button>
      {loading ? (
        <p className="mt-3 text-center text-xs text-zinc-500">This can take a few seconds — please wait.</p>
      ) : null}
    </div>
  );
}
