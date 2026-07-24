"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { getPendingResumeFile, clearPendingResumeStorage } from "@/lib/resumeUploadBridge";
import { fetchResumeInsights, insightsToAnalyzeInput, type ResumeInsights } from "@/lib/fetchResumeInsights";
import { buildEditorPayloadFromAnalysis } from "@/lib/buildEditorPayload";
import { saveEditorPayload } from "@/lib/editorSession";
import { errorToast } from "@/lib/toast";

const glass = "rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md";

function looksLikePdfBinary(s: string): boolean {
  const t = s.trimStart();
  return t.startsWith("%PDF");
}

export function ResumeAnalyzingClient() {
  const router = useRouter();
  const { user } = useUser();
  const [booted, setBooted] = useState(false);
  const [missingUpload, setMissingUpload] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [needsPaste, setNeedsPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState<ResumeInsights | null>(null);
  const autoAnalyzed = useRef(false);

  const runAnalysis = useCallback(async (text: string) => {
    if (!text.trim()) {
      errorToast("Add resume text first.");
      return;
    }
    setError("");
    setLoading(true);
    setInsights(null);
    try {
      const data = await fetchResumeInsights(text);
      setInsights(data);
      clearPendingResumeStorage();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed.";
      setError(msg.length < 280 ? msg : "Analysis failed. Check GEMINI_API_KEY and try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const f = getPendingResumeFile();
    if (!f) {
      setMissingUpload(true);
      setBooted(true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const t = String(reader.result ?? "");
      if (!t.trim() || looksLikePdfBinary(t)) {
        setNeedsPaste(true);
        setResumeText("");
      } else {
        setResumeText(t);
      }
      setBooted(true);
    };
    reader.onerror = () => {
      setNeedsPaste(true);
      setBooted(true);
    };
    reader.readAsText(f);
  }, []);

  useEffect(() => {
    if (!booted || needsPaste || !resumeText.trim() || autoAnalyzed.current) return;
    autoAnalyzed.current = true;
    void runAnalysis(resumeText);
  }, [booted, needsPaste, resumeText, runAnalysis]);

  const openEditor = () => {
    if (!insights) return;
    const uid = user?.id;
    if (!uid) return;
    saveEditorPayload(
      buildEditorPayloadFromAnalysis(resumeText, insightsToAnalyzeInput(insights)),
      uid
    );
    router.push("/editor");
  };

  if (!booted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <span className="loading loading-lg loading-spinner text-orange-500" />
      </div>
    );
  }

  if (missingUpload && !insights) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className={glass}>
          <p className="text-sm text-zinc-300">
            No resume loaded. Go home, upload a file, wait for the preview, then tap <strong className="text-white">Resume Analyzer</strong>.
          </p>
          <Link href="/" className="btn btn-primary mt-4 w-full rounded-xl border-0">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs font-medium text-zinc-500 hover:text-white">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Resume insights</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Skills, projects & certificates (AI + archive reference data).
          </p>
        </div>
        {insights && (
          <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">ATS estimate</p>
            <p className="text-2xl font-bold tabular-nums text-orange-400">{insights.score}/100</p>
          </div>
        )}
      </div>

      {needsPaste && (
        <div className={`mb-6 ${glass}`}>
          <p className="mb-2 text-sm text-amber-200/90">
            This file is PDF or unreadable as plain text. Paste your resume text below.
          </p>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[180px] w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-[13px] text-zinc-100 outline-none focus:border-orange-500/40"
            placeholder="Paste resume text…"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void runAnalysis(resumeText)}
            className="btn btn-primary mt-3 w-full rounded-xl border-0 bg-orange-500 text-black hover:bg-orange-400"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : "Analyze resume"}
          </button>
        </div>
      )}

      {loading && !insights && (
        <div className="flex flex-col items-center gap-3 py-16">
          <span className="loading loading-lg loading-spinner text-orange-500" />
          <p className="text-sm text-zinc-500">Extracting insights…</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
      )}

      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className={glass}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Summary</h2>
            <p className="text-sm leading-relaxed text-zinc-300">{insights.summary || "—"}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className={glass}>
              <h2 className="mb-3 text-sm font-semibold text-orange-300">Skills</h2>
              <ul className="flex flex-wrap gap-2">
                {insights.skills.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-100"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            <section className={glass}>
              <h2 className="mb-3 text-sm font-semibold text-sky-300">Projects</h2>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-300">
                {insights.projects.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </section>

            <section className={glass}>
              <h2 className="mb-3 text-sm font-semibold text-emerald-300">Certificates</h2>
              <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-300">
                {insights.certificates.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={glass}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Strengths</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-300">
                {insights.strengths.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div className={glass}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Improvements</h2>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-300">
                {insights.improvements.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={glass}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Gaps / missing keywords</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-zinc-300">
              {insights.keywords_missing.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openEditor}
              className="btn rounded-xl border-0 bg-orange-500 px-6 text-black hover:bg-orange-400"
            >
              Open career guide
            </button>
            <Link href="/" className="btn btn-outline rounded-xl border-white/20 text-white">
              Home
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
