export type LandingFeatureLayout = "hero" | "pro" | "default";

export type LandingFeatureItem = {
  icon: string;
  title: string;
  description: string;
  /** Short category label above the title */
  tag: string;
  layout?: LandingFeatureLayout;
};

/** Marketing features — home pipeline, `/resume-ats`, `/editor` career guide, Gemini polish, BYOK, builder. */
export const LANDING_FEATURES: readonly LandingFeatureItem[] = [
  {
    icon: "📄",
    tag: "ATS",
    title: "ATS-ready analysis",
    description:
      "Upload your resume → get an instant ATS score, keyword gaps, and structure issues. Works with PDF, DOCX, and TXT files.",
    layout: "hero",
  },
  {
    icon: "⚡",
    tag: "Speed",
    title: "Instant scoring",
    description: "See your score, strengths, and weaknesses in seconds — not hours of guessing what recruiters see.",
    layout: "default",
  },
  {
    icon: "🎯",
    tag: "Role fit",
    title: "JD match & alignment",
    description: "Paste a job description + target title on the home page → we show exactly which keywords you're missing and how well you match.",
    layout: "default",
  },
  {
    icon: "🔑",
    tag: "Free AI",
    title: "Bring your own Gemini key",
    description:
      "Go to Dashboard → add your free Google AI Studio API key → unlock Gemini polish and deep ATS reports at zero cost. No Pro plan needed.",
    layout: "default",
  },
  {
    icon: "✦",
    tag: "AI",
    title: "Gemini polish",
    description:
      "Toggle 'Gemini polish' on the home page before uploading → get 6–10 AI-powered suggestions + a deep ATS JSON report. Works with your own key or Pro plan.",
    layout: "pro",
  },
  {
    icon: "📝",
    tag: "Builder",
    title: "Resume builder",
    description:
      "Click 'Build My Resume' → pick Modern or LaTeX template → fill the form → see live preview → download as PDF. 100% free. More templates coming soon!",
    layout: "default",
  },
  {
    icon: "🧭",
    tag: "Guide",
    title: "Career guide",
    description:
      "Click 'Career guide' → enter your skills → get a structured career path with milestones, learning resources, and next steps.",
    layout: "default",
  },
  {
    icon: "📊",
    tag: "Dashboard",
    title: "Your dashboard",
    description: "All your analyzed resumes, scores, and reports in one place. Add your Gemini key here to unlock AI features for free.",
    layout: "default",
  },
  {
    icon: "🔒",
    tag: "Privacy",
    title: "Private & secure",
    description: "Your resume is processed for analysis only — we don't store copies. Your API key stays in your browser's localStorage, never on our servers.",
    layout: "default",
  },
] as const;
