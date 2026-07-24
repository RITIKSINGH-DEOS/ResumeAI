"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { brandToast } from "@/lib/toast";
import { isValidResumeFile } from "@/lib/validateResumeFile";
import { MarketingShell } from "./MarketingShell";
import { AnalysisTerminal } from "./AnalysisTerminal";
import { JobTitleAutocomplete } from "./JobTitleAutocomplete";
import { hasUserGeminiKey } from "@/lib/userGeminiKey";

const heroPrimarySignedIn =
  "btn btn-primary min-h-[48px] w-full rounded-xl border-0 px-6 text-sm font-medium transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:min-w-[200px] sm:px-8";

const outlineBtn =
  "btn btn-outline min-h-[48px] w-full rounded-xl border-white/20 bg-transparent px-6 text-white transition-all duration-300 ease-out hover:scale-[1.03] hover:border-orange-500/35 hover:bg-white/[0.04] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:min-w-[160px] sm:px-8";

const ctaBottomBtn =
  "inline-flex w-full max-w-xs items-center justify-center rounded-lg border-0 bg-orange-500 px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:bg-orange-400 disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:max-w-none";

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20";

export default function LandingPage() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const isPremium = useMemo(
    () => isPremiumPublicMetadata(user?.publicMetadata as Record<string, unknown> | undefined),
    [user]
  );
  const [hasOwnKey, setHasOwnKey] = useState(false);
  useEffect(() => { setHasOwnKey(hasUserGeminiKey()); }, []);
  const canUseGeminiPolish = Boolean(isSignedIn && (isPremium || hasOwnKey));

  const inputRef = useRef<HTMLInputElement>(null);
  const pickFile = () => inputRef.current?.click();

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [enhanceWithGemini, setEnhanceWithGemini] = useState(false);

  useEffect(() => {
    if (!canUseGeminiPolish) setEnhanceWithGemini(false);
  }, [canUseGeminiPolish]);

  const onAnalysisComplete = useCallback(() => {
    setAnalysisBusy(false);
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!isSignedIn) return;
    const file = files?.[0];
    if (!file) return;
    if (!isValidResumeFile(file)) {
      brandToast("Please upload a valid resume (PDF, DOCX, DOC, or TXT, max 10MB).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setUploadFile(file);
    setRunKey((k) => k + 1);
    setAnalysisBusy(true);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-balance text-[clamp(1.625rem,6vw+0.35rem,3.25rem)] font-bold leading-tight tracking-tight text-white">
            Analyze your{" "}
            <span className="text-orange-500">resume</span> with{" "}
            <span className="relative inline-block px-0.5">
              <span
                className="animate-glow-ai-halo pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[2em] w-[2.25em] rounded-full bg-orange-500/25 blur-xl motion-reduce:animate-none"
                aria-hidden
              />
              <span className="animate-glow-ai-text relative inline-block text-orange-500 motion-reduce:animate-none">
                AI
              </span>
            </span>
          </h1>
          <p className="mx-auto mb-4 max-w-md text-pretty text-sm leading-relaxed text-zinc-400 sm:max-w-lg md:max-w-xl md:text-base">
            Get ATS score and improve instantly
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
                <button type="button" className={`${heroPrimarySignedIn} inline-flex items-center justify-center gap-2`}>
                  Upload Resume
                </button>
              </SignInButton>
              <SignInButton mode="modal" forceRedirectUrl="/editor" signUpForceRedirectUrl="/editor">
                <button type="button" className={outlineBtn}>
                  Career guide
                </button>
              </SignInButton>
              <SignInButton mode="modal" forceRedirectUrl="/builder" signUpForceRedirectUrl="/builder">
                <button type="button" className={outlineBtn}>
                  Build My Resume
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button
                type="button"
                className={`${heroPrimarySignedIn} inline-flex items-center justify-center gap-2`}
                disabled={analysisBusy}
                onClick={pickFile}
                aria-busy={analysisBusy}
              >
                {analysisBusy ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-black/25 border-t-black"
                      aria-hidden
                    />
                    Analyzing…
                  </>
                ) : (
                  "Upload Resume"
                )}
              </button>
              <Link href="/editor" className={outlineBtn}>
                Career guide
              </Link>
              <Link href="/builder" className={outlineBtn}>
                Build My Resume
              </Link>
            </SignedIn>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,application/pdf"
          className="hidden"
            disabled={analysisBusy || !isSignedIn}
            onChange={(e) => handleFiles(e.target.files)}
        />
      </section>

      <section className="mx-auto mt-2 max-w-2xl px-4 sm:px-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Target job title
          </label>
          <JobTitleAutocomplete
            className={`${fieldClass} mb-3`}
            placeholder=" e.g. Senior Full-Stack Engineer"
            value={jobTitle}
            onChange={setJobTitle}
            disabled={analysisBusy}
          />
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            Job description
          </label>
          <textarea
            className={`${fieldClass} mb-3 min-h-[88px] resize-y`}
            placeholder="Paste JD → Get match & insights."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={analysisBusy}
          />
          <div className="flex flex-col gap-1.5">
            <label
              className={`flex items-start gap-2 text-left text-sm ${
                canUseGeminiPolish ? "cursor-pointer text-zinc-400" : "cursor-not-allowed text-zinc-500/60"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 rounded border-white/10 bg-white/5 disabled:opacity-40"
                checked={enhanceWithGemini}
                onChange={(e) => setEnhanceWithGemini(e.target.checked)}
                disabled={analysisBusy || !canUseGeminiPolish}
              />
              <span>
                Add <span className="text-emerald-400">Gemini</span> polish.
              </span>
            </label>
            {!isSignedIn && (
              <p className="text-[11px] text-zinc-500">
                Use <span className="font-medium text-zinc-400">Continue with Google</span> in the header to enable
                Gemini polish.
              </p>
            )}
            {isSignedIn && !isPremium && !hasOwnKey && (
              <p className="text-[11px] text-zinc-500">
                <Link href="/dashboard" className="font-medium text-orange-400 underline-offset-2 hover:underline">
                  Add your Gemini API key
                </Link>{" "}
                for free, or{" "}
                <Link href="/pricing" className="font-medium text-orange-400 underline-offset-2 hover:underline">
                  upgrade
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-6xl px-6 pb-0" aria-label="Analysis preview">
        <p className="mb-3 text-center text-sm font-medium tracking-tight text-zinc-500 md:text-base">
          Pipeline — upload to run
        </p>
        <div className="mb-6">
          <AnalysisTerminal
            key={isSignedIn ? runKey : "preview"}
            file={isSignedIn ? uploadFile : null}
            runKey={isSignedIn ? runKey : 0}
            jobTitle={jobTitle}
            jobDescription={jobDescription}
            enhanceWithGemini={enhanceWithGemini}
            isPro={isPremium}
            onAnalysisComplete={onAnalysisComplete}
            onViewResume={() => (isSignedIn ? router.push("/resume-ats") : undefined)}
          />
        </div>

        <div className="mt-10 border-t border-white/[0.06] py-8">
          <div className="flex flex-col items-center gap-3">
            <p className="w-full text-center text-sm leading-normal text-zinc-500">
              <span className="font-semibold tabular-nums text-orange-400/95">1,000+</span>{" "}
              resumes analyzed successfully
            </p>
            <div className="w-full border-t border-white/[0.06] pt-4">
              <p className="mb-2 text-center text-xs font-medium tracking-tight text-zinc-500 sm:text-sm">
                Trusted by teams at
              </p>
              <div className="grid grid-cols-2 place-items-center gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 md:gap-4">
                {["Acme", "Northwind", "Globex", "Umbrella", "Stark"].map((name) => (
                  <span
                    key={name}
                    className="w-full max-w-[160px] cursor-default rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-500 transition-all duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:border-orange-500/35 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_24px_rgba(249,115,22,0.12)] sm:w-auto sm:max-w-none sm:px-5 sm:py-2.5 sm:text-xs"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl border-t border-white/[0.06] px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Get your resume reviewed in seconds
          </h2>
          <div className="mt-4 flex justify-center">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
                <button type="button" className={ctaBottomBtn}>
                  Start Now
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button
                type="button"
                className={`${ctaBottomBtn} inline-flex items-center justify-center gap-2`}
                disabled={analysisBusy}
                onClick={pickFile}
                aria-busy={analysisBusy}
              >
                {analysisBusy ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-black/25 border-t-black"
                      aria-hidden
                    />
                    Analyzing…
                  </>
                ) : (
                  "Start Now"
                )}
              </button>
            </SignedIn>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
