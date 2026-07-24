"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { DocsNav } from "@/components/docs/DocsNav";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-white/[0.06] py-12 last:border-b-0 lg:scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-[1.7]">{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ children }: { children: ReactNode }) {
  return <ul className="list-inside list-disc space-y-2 text-zinc-400 marker:text-orange-500/80">{children}</ul>;
}

function Li({ children }: { children: ReactNode }) {
  return <li className="pl-1">{children}</li>;
}

export function DocsPageClient() {
  return (
    <MarketingShell>
      <div className="relative min-h-[calc(100dvh-4rem)] bg-[#070707]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.08),transparent)]" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:flex lg:gap-12 lg:px-8 lg:pt-10">
          {/* Mobile section pills */}
          <div className="mb-8 lg:hidden">
            <DocsNav variant="mobile" />
          </div>

          {/* Sidebar */}
          <aside className="mb-10 hidden w-56 shrink-0 lg:block xl:w-64">
            <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2">
              <DocsNav variant="sidebar" />
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0 flex-1 max-w-3xl">
            <header className="border-b border-white/[0.06] pb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-400/90">Documentation</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">ResumeAI</h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-500">
                How to get started, what each surface does (home scan, resume report, career guide), how scoring works,
                and how we handle your data.
              </p>
            </header>

            <Section id="getting-started" title="Getting Started">
              <P>
                ResumeAI centers on a fast <strong className="font-medium text-zinc-300">home pipeline</strong>: upload
                a resume, optionally add a target title and job description, and get a rule-based score with strengths,
                gaps, and suggestions.
              </P>
              <Ul>
                <Li>
                  <strong className="font-medium text-zinc-300">Sign in</strong> with Google (required to upload and save
                  per-account state).
                </Li>
                <Li>
                  <strong className="font-medium text-zinc-300">Upload</strong> a PDF, DOCX, or TXT resume from the home
                  page and run analysis.
                </Li>
                <Li>
                  Optionally add a <strong className="font-medium text-zinc-300">target job title</strong> and paste a{" "}
                  <strong className="font-medium text-zinc-300">job description</strong> for keyword and fit signals.
                </Li>
                <Li>
                  After the run, open <strong className="font-medium text-zinc-300">View resume</strong> to see your{" "}
                  <Link href="/resume-ats" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                    resume &amp; ATS report
                  </Link>{" "}
                  (stored scan results and, when enabled, a Gemini JSON ATS report on paid plans).
                </Li>
                <Li>
                  Use the{" "}
                  <Link href="/editor" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                    Career guide
                  </Link>{" "}
                  (<code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[13px] text-zinc-300">/editor</code>) for
                  a separate flow: enter comma-separated skills and generate a structured career path with Gemini.
                </Li>
              </Ul>
            </Section>

            <Section id="features" title="Features">
              <Ul>
                <Li>
                  <strong className="font-medium text-zinc-300">ATS-style scan</strong> — rule-based score (0–100),
                  strengths, gaps, and actionable suggestions from your resume text and optional JD.
                </Li>
                <Li>
                  <strong className="font-medium text-zinc-300">Resume &amp; ATS report</strong> —{" "}
                  <Link href="/resume-ats" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                    /resume-ats
                  </Link>{" "}
                  shows the latest stored results; with Gemini polish enabled on a paid plan, you also get a structured
                  JSON ATS report (score breakdown, suggestions, strengths, summary).
                </Li>
                <Li>
                  <strong className="font-medium text-zinc-300">Career guide</strong> —{" "}
                  <Link href="/editor" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                    /editor
                  </Link>{" "}
                  generates a skills-based career path (Gemini); separate from the upload pipeline.
                </Li>
                <Li>
                  <strong className="font-medium text-zinc-300">Gemini polish</strong> — optional on home analysis for
                  paid plans: enhances the analyze response and triggers the ATS JSON report after your run (usage
                  limits apply).
                </Li>
              </Ul>
              <p className="text-zinc-500">
                Short marketing overview:{" "}
                <Link href="/features" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                  Features page
                </Link>
                .
              </p>
            </Section>

            <Section id="scoring" title="How Scoring Works">
              <P>
                Your <strong className="font-medium text-zinc-300">score (0–100)</strong> is produced by rule-based
                analysis: we infer a role category, detect skills and structure from your resume, and—if you supplied
                them—compare against your job title and job description (keyword coverage and gaps).
              </P>
              <P>
                The score reflects <strong className="font-medium text-zinc-300">alignment and completeness signals</strong>, not a
                guarantee of interviews. Use it as a prioritized checklist: fix the highest-impact gaps first, then
                iterate.
              </P>
              <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-zinc-500">
                Paid plans may add Gemini-enhanced suggestions; they still build on the same extracted resume text and
                rules.
              </p>
            </Section>

            <Section id="pricing" title="Pricing">
              <P>
                We offer a <strong className="font-medium text-zinc-300">free tier</strong> with core analysis and paid
                plans (e.g. <strong className="font-medium text-zinc-300">Pro</strong>) for higher limits, deeper fit,
                and Gemini polish where enabled. Billing may use Razorpay where configured.
              </P>
              <p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 font-medium text-orange-400/95 underline-offset-2 hover:underline"
                >
                  View pricing &amp; plans →
                </Link>
              </p>
            </Section>

            <Section id="privacy" title="Privacy">
              <P>
                Your resume is processed so we can return analysis, reports, and account-scoped storage. We don’t use your file content for
                public marketing or third-party advertising. API-backed features (e.g. Gemini) send only the text needed
                for that request, subject to your plan and our providers’ terms.
              </P>
              <P>
                For account, billing, and data questions, contact support through the channels listed on your receipt
                or dashboard when available.
              </P>
            </Section>

            <Section id="faq" title="FAQ">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Do I need an account?</h3>
                  <p className="mt-2">
                    Yes. Sign-in is required to upload resumes and use the career guide and dashboard—so we can protect
                    your data and apply plan limits fairly.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">What file types are supported?</h3>
                  <p className="mt-2">PDF, Word (DOC/DOCX), and plain text (TXT) are supported for upload and parsing.</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Is the score an official ATS score?</h3>
                  <p className="mt-2">
                    No. It’s an internal composite for guidance. Real employers use many different systems and
                    criteria.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">What do paid plans add?</h3>
                  <p className="mt-2">
                    Typically higher usage limits, deeper fit signals, and Gemini polish (including the JSON ATS
                    report on <Link href="/resume-ats" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">resume &amp; ATS</Link>) where enabled—see the{" "}
                    <Link href="/pricing" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                      pricing page
                    </Link>
                    .
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Can I use this for any role?</h3>
                  <p className="mt-2">
                    Analysis is tuned for general professional resumes; results are strongest when your target role and
                    optional JD match what you paste.
                  </p>
                </div>
              </div>
            </Section>

            <Section id="about" title="About">
              <P>
                <strong className="font-medium text-zinc-300">ResumeAI</strong> combines fast ATS-style checks on the
                home pipeline, a dedicated page for your scan and optional Gemini ATS report, and a career guide for
                skills-based planning—so you can iterate without juggling generic advice in multiple tabs.
              </P>
              <p className="text-zinc-500">
                Product by Ritik Singh · © {new Date().getFullYear()} ResumeAI
              </p>
            </Section>
          </article>
        </div>
      </div>
    </MarketingShell>
  );
}
