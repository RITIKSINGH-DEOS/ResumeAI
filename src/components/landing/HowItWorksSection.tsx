export function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Sign in & upload",
      body: "Sign in with Google → click 'Upload Resume' on the home page → pick your PDF or DOCX file.",
    },
    {
      step: "2",
      title: "Add job details (optional)",
      body: "Enter a target job title and paste the job description → the analyzer compares your resume against the role.",
    },
    {
      step: "3",
      title: "Get your score",
      body: "In seconds you'll see an ATS score, strengths, weaknesses, missing keywords, and actionable suggestions.",
    },
    {
      step: "4",
      title: "Enable Gemini AI (free)",
      body: "Go to Dashboard → paste your free Google AI Studio API key → tick 'Gemini polish' before uploading → get 6–10 AI suggestions + a deep ATS report.",
    },
    {
      step: "5",
      title: "Build your resume",
      body: "Click 'Build My Resume' → choose Modern or LaTeX template → fill the form with live preview → download as PDF.",
    },
    {
      step: "6",
      title: "Career guide",
      body: "Click 'Career guide' → enter your skills → get a personalized career roadmap with milestones and learning resources.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-3 py-12 sm:px-4 sm:py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          How it{" "}
          <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">works</span>
        </h2>
        <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
          From upload to AI analysis in 6 simple steps — add your own Gemini key to unlock AI features for free.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5 transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 hover:border-orange-500/35 hover:shadow-[0_24px_48px_-16px_rgba(249,115,22,0.22)] active:scale-[0.99] sm:p-6"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-orange-500/[0.05] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <span className="relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/35 bg-orange-500/10 text-sm font-bold text-orange-400 shadow-[0_0_24px_-8px_rgba(249,115,22,0.4)] transition-all duration-300 motion-safe:group-hover:scale-110">
              {item.step}
            </span>
            <h3 className="relative z-[1] mt-4 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-orange-50">
              {item.title}
            </h3>
            <p className="relative z-[1] mt-2 text-sm leading-relaxed text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
