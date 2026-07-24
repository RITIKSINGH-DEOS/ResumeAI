#!/usr/bin/env bash
# Run from resume-ai/: bash scripts/git-50-commits.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

c() {
  local msg="$1"; shift
  git add -- "$@"
  if git diff --cached --quiet; then
    echo "WARN: empty commit skipped: $msg"
    return 0
  fi
  git commit -m "$msg"
}

# --- 50 commits (granular history) ---
c "chore: gitignore (tsbuildinfo, archives) and drop tracked tsbuildinfo" .gitignore tsconfig.tsbuildinfo
c "chore(deps): update package.json and lockfile" package.json package-lock.json
c "chore: Next.js config" next.config.ts
c "docs: refresh README" README.md
c "docs: env example template" .env.example
c "docs: payments notes" docs/PAYMENTS.md
c "feat(auth): middleware for protected routes" src/middleware.ts
c "lib: cn helper and per-user analysis storage" src/lib/cn.ts src/lib/analysisStorage.ts
c "lib: editor session + resume editor access (Clerk-scoped)" src/lib/editorSession.ts src/lib/resumeEditorAccess.ts
c "lib: build editor payload from analysis" src/lib/buildEditorPayload.ts
c "lib: map rule analysis to editor" src/lib/mapRuleAnalysisToEditor.ts
c "lib: extract resume text from files" src/lib/extractResumeText.ts
c "lib: format resume text" src/lib/formatResumeText.ts
c "lib: recruiter brief builder" src/lib/recruiterBrief.ts
c "lib: Clerk premium metadata" src/lib/clerkPremium.ts
c "lib: subscription plan + limits" src/lib/subscriptionPlan.ts src/lib/planLimits.ts
c "lib: resume apply, sections, upload bridge" src/lib/resumeApply.ts src/lib/resumeSections.ts src/lib/resumeUploadBridge.ts
c "lib: fetch resume insights (Gemini)" src/lib/fetchResumeInsights.ts
c "lib: analyzer core (index, parse, extract, analyze)" src/lib/analyzer/index.ts src/lib/analyzer/parseResume.ts src/lib/analyzer/extractText.ts src/lib/analyzer/analyzeResume.ts
c "lib: analyzer datasets and Gemini suggest" src/lib/analyzer/skillDataset.ts src/lib/analyzer/jdKeywords.ts src/lib/analyzer/geminiSuggest.ts
c "lib: OCR PDF extraction" src/lib/ocr/extractPdfWithOcr.ts
c "lib: Razorpay payments (grant, revoke, sync, env)" src/lib/payments/grantPro.ts src/lib/payments/revokePro.ts src/lib/payments/syncPlanExpiry.ts src/lib/payments/razorpayEnv.ts
c "lib: deep ATS report prompt" src/lib/prompts/deepAtsReport.ts
c "types: demo report + Razorpay checkout" src/types/demoReport.ts src/types/razorpay-checkout.d.ts
c "data: marketing features and job title hints" src/data/features.ts src/data/jobTitleSuggestions.ts src/data/resumeInsightsArchive.ts
c "api: POST analyze resume" src/app/api/analyze/route.ts
c "api: extract PDF text" src/app/api/extract-pdf/route.ts
c "api: Gemini proxy" src/app/api/gemini/route.ts
c "api: switch account to free plan" src/app/api/account/switch-to-free/route.ts
c "api: Razorpay checkout create" src/app/api/checkout/razorpay/route.ts
c "api: Razorpay payment verify" src/app/api/checkout/razorpay/verify/route.ts
c "api: Razorpay webhooks" src/app/api/webhooks/razorpay/route.ts
c "api: plan sync endpoint" src/app/api/plan/route.ts
c "api: resume deep report + roast" src/app/api/resume-deep-report/route.ts src/app/api/roast-resume/route.ts
c "api: resume upload (per-user storage)" src/app/api/resumes/upload/route.ts
c "server: Supabase resumes helpers" src/server/supabase/resumes.ts
c "app: sign-up flow" src/app/sign-up/page.tsx src/app/sign-up/SignUpPageClient.tsx
c "app: analyze, editor, resume-editor, resume-analyzing pages" src/app/analyze/page.tsx src/app/editor/page.tsx src/app/resume-editor/page.tsx src/app/resume-analyzing/page.tsx
c "app: documentation pages" src/app/docs/page.tsx src/app/docs/DocsPageClient.tsx
c "components: landing feature grid (FeatureCard, FeaturesSection)" src/components/landing/FeatureCard.tsx src/components/landing/FeaturesSection.tsx
c "components: landing How it works + pricing blocks" src/components/landing/HowItWorksSection.tsx src/components/landing/PricingSection.tsx
c "components: editor workspace" src/components/editor/EditorNavbar.tsx src/components/editor/EditorPageSkeleton.tsx src/components/editor/EditorTabs.tsx src/components/editor/PostAnalysisEditorClient.tsx src/components/editor/RecruiterInsightsDashboard.tsx src/components/editor/ResumeCodeEditor.tsx
c "components: resume insights panels" src/components/ProDeepReportPanel.tsx src/components/RecruiterBriefPanel.tsx src/components/ResumePreviewPanel.tsx src/components/ResumeRoastPanel.tsx src/components/ResumeDemoModal.tsx
c "components: navbar, job autocomplete, user button" src/components/Navbar.tsx src/components/NavbarClerkFallback.tsx src/components/NavbarUserButton.tsx src/components/JobTitleAutocomplete.tsx
c "components: landing shell + home + footer" src/components/LandingPage.tsx src/components/LandingFooter.tsx src/components/HomeClient.tsx src/components/GoogleSignInButton.tsx
c "components: analysis terminal + resume analyzer" src/components/AnalysisTerminal.tsx src/components/ResumeAnalyzer.tsx
c "app: dashboard, features, pricing pages" src/app/dashboard/page.tsx src/app/features/page.tsx src/app/features/FeaturesPageClient.tsx src/app/pricing/PricingPageClient.tsx
c "components: dashboard resume section" src/components/dashboard/DashboardResumeSection.tsx
c "components: docs nav and UI card primitives" src/components/docs/DocsNav.tsx src/components/ui/ProjectCard.tsx src/components/ui/ScoreCard.tsx src/components/ui/SurfaceCard.tsx
c "components: resume analyzing client" src/components/resume-analyzing/ResumeAnalyzingClient.tsx scripts/git-50-commits.sh

echo "Done. Commits created (50 new on top of current branch):"
git log --oneline -52
