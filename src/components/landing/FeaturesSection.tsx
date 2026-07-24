import Link from "next/link";
import { LANDING_FEATURES } from "@/data/features";
import { FeatureCard, type FeatureCardVariant } from "@/components/landing/FeatureCard";

function layoutToVariant(layout: (typeof LANDING_FEATURES)[number]["layout"]): FeatureCardVariant {
  if (layout === "hero") return "featured";
  if (layout === "pro") return "pro";
  return "default";
}

export function FeaturesSection() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/[0.04] bg-black py-12 sm:py-16 md:py-20"
      aria-labelledby="features-sr-only"
    >
      {/* Black + orange: soft glow from top (same family as Pro card accents) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(249,115,22,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-sr-only"
            className="text-lg font-medium uppercase tracking-[0.08em] text-white sm:text-xl md:text-2xl"
          >
            Smarter resumes
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
            ATS scan, JD fit, resume builder, career guide — unlock <span className="text-orange-400/95">Gemini</span> AI free with your own API key or go Pro.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 items-stretch gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {LANDING_FEATURES.map((f) => {
            const variant = layoutToVariant(f.layout);

            return (
              <FeatureCard
                key={f.title}
                tag={f.tag}
                title={f.title}
                description={f.description}
                icon={f.icon}
                variant={variant}
              />
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-xl rounded-xl border border-orange-500/20 bg-orange-500/[0.04] px-5 py-4 text-center sm:mt-14">
          <p className="text-sm font-medium text-orange-300/90">
            More resume templates coming soon!
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            We&apos;re building new designs — Modern, Minimal, Creative &amp; more. Stay tuned.
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-lg text-center text-xs leading-relaxed text-zinc-500">
          Free forever — add your Gemini key for AI, or go{" "}
          <Link
            href="/pricing"
            className="font-medium text-orange-400 underline-offset-2 transition-colors hover:text-orange-300 hover:underline"
          >
            Pro ₹29/mo
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
