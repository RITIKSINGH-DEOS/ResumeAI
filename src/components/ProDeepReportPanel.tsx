"use client";

import { useState, useCallback, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import toast from "react-hot-toast";

type ProDeepReportPanelProps = {
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  /** Only Pro users see this block */
  isPro: boolean;
};

const mdComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-8 border-b border-white/10 pb-2 text-base font-bold text-white first:mt-0 sm:text-lg">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 text-sm font-semibold text-orange-200/95 sm:text-base">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-2 text-sm leading-relaxed text-zinc-300">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-zinc-400 marker:text-orange-500/80">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm text-zinc-400 marker:text-zinc-500">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children as ReactNode}</li>,
  strong: ({ children }) => <strong className="font-semibold text-zinc-200">{children}</strong>,
  em: ({ children }) => <em className="italic text-zinc-400">{children}</em>,
  hr: () => <hr className="my-6 border-white/10" />,
  code: ({ children }) => (
    <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-orange-300/90">{children}</code>
  ),
};

export function ProDeepReportPanel({ resumeText, jobTitle, jobDescription, isPro }: ProDeepReportPanelProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!resumeText.trim()) {
      toast.error("No resume text — run analysis first.");
      return;
    }
    setLoading(true);
    setMarkdown(null);
    try {
      const res = await fetch("/api/resume-deep-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: resumeText,
          jobTitle,
          jobDescription,
        }),
      });
      const data = (await res.json()) as { markdown?: string; error?: string; code?: string };
      if (!res.ok) {
        if (data.code === "PREMIUM_REQUIRED") {
          toast.error("Pro required for full ATS report.");
          return;
        }
        toast.error(data.error || "Could not generate report");
        return;
      }
      if (data.markdown) {
        setMarkdown(data.markdown);
        toast.success("Full ATS report ready");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [resumeText, jobTitle, jobDescription]);

  if (!isPro) return null;

  return (
    <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] via-[#0f0f0f] to-[#0D0D0D] p-5 shadow-[0_0_0_1px_rgba(249,115,22,0.08)_inset,0_20px_50px_-24px_rgba(249,115,22,0.25)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/90">Pro</p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-white">Full ATS report</h3>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !resumeText.trim()}
          className="group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_-6px_rgba(249,115,22,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45"
        >
          <span
            className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 transition-opacity duration-300 group-hover:opacity-100 group-hover:brightness-110"
            aria-hidden
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" aria-hidden />
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating…
              </>
            ) : (
              <>
                <span aria-hidden>✨</span>
                {markdown ? "Regenerate report" : "Generate full report"}
              </>
            )}
          </span>
        </button>
      </div>

      {loading && !markdown ? (
        <div className="mt-5 space-y-3 rounded-xl border border-white/[0.06] bg-black/30 p-4">
          <div className="h-4 w-3/4 max-w-md animate-pulse rounded-md bg-zinc-800" />
          <div className="h-4 w-full animate-pulse rounded-md bg-zinc-800/80" />
          <div className="h-4 w-5/6 animate-pulse rounded-md bg-zinc-800/60" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-800/50" />
          <p className="text-center text-[10px] text-zinc-600">Generating…</p>
        </div>
      ) : markdown ? (
        <div className="mt-5 max-h-[min(70vh,720px)] overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 sm:p-5">
          <article className="prose-report max-w-none">
            <ReactMarkdown components={mdComponents}>{markdown}</ReactMarkdown>
          </article>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-zinc-600">Run analysis on home first.</p>
      )}
    </div>
  );
}
