"use client";

import { LandingBackground } from "@/components/LandingBackground";
import { GoogleSignUpButton } from "@/components/GoogleSignInButton";

const logoClass =
  "resume-ai-logo-static inline-block cursor-default text-base font-semibold tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg";

const primaryBtn =
  "btn min-h-[52px] w-full max-w-sm rounded-xl border-0 bg-gradient-to-b from-orange-500 to-orange-600 px-8 text-sm font-semibold text-white shadow-[0_0_28px_-8px_rgba(249,115,22,0.45)] transition-all duration-300 ease-out hover:scale-[1.02] hover:from-orange-400 hover:to-orange-500 active:scale-[0.99] sm:min-w-[280px]";

export function SignUpPageClient() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-gradient-to-b from-black via-black to-gray-950 pb-[env(safe-area-inset-bottom)] font-sans text-zinc-100">
      <LandingBackground />
      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto flex min-h-[min(560px,100dvh)] w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:p-10">
            <div className="flex justify-center">
              <span className={logoClass}>ResumeAI</span>
            </div>
            <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
              Create your account
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-zinc-400">
              Sign in with Google to continue.
            </p>

            <div className="mt-8 flex justify-center">
              <GoogleSignUpButton className={primaryBtn} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
