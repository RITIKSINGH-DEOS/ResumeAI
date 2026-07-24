"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { Navbar } from "@/components/Navbar";
import { PlanBadge } from "@/components/PlanBadge";
import { DashboardResumeSection } from "@/components/dashboard/DashboardResumeSection";
import { GeminiKeyCard } from "@/components/dashboard/GeminiKeyCard";

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (isLoaded && !user) router.replace("/");
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="pb-safe-page relative min-h-[100dvh] overflow-hidden bg-black text-zinc-100">
        <Navbar />
        <div className="relative z-10 flex min-h-[60dvh] items-center justify-center px-4 text-zinc-500">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-[min(420px,90vw)] w-[min(420px,90vw)] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[100px]"
            animate={reduce ? undefined : { opacity: [0.35, 0.5, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            Loading…
          </motion.p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const meta = user.publicMetadata as Record<string, unknown> | undefined;
  const isPro = isPremiumPublicMetadata(meta);

  return (
    <div className="pb-safe-page relative min-h-[100dvh] overflow-hidden bg-black text-zinc-100">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] h-[min(480px,95vw)] w-[min(480px,95vw)] -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[120px]"
        animate={reduce ? undefined : { opacity: [0.38, 0.55, 0.38] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <Navbar />

      <motion.div
        className="dashboard-main-pad relative z-10 mx-auto min-w-0 max-w-4xl pt-5 sm:pt-8"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease }}
      >
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-6 md:p-8"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Dashboard</p>
              <PlanBadge isPro={isPro} />
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Welcome back</h1>
            <p className="mt-3 max-w-full break-words text-sm leading-relaxed text-zinc-400">
              {user.primaryEmailAddress?.emailAddress ?? user.username ?? user.id}
            </p>
            {!isPro && (
              <p className="mt-2 max-w-full text-pretty text-xs leading-relaxed text-zinc-500">
                You&apos;re on the <span className="font-medium text-sky-400/95">Free</span> plan — up to 2 resumes on the dashboard and basic analysis limits. Add your Gemini API key below to unlock AI features for free, or{" "}
                <Link href="/pricing" className="font-medium text-sky-400/95 underline-offset-2 hover:underline">
                  upgrade to Pro (₹29/mo)
                </Link>
              </p>
            )}
          </motion.div>

          <DashboardResumeSection />

          <GeminiKeyCard />
        </motion.div>
      </motion.div>
    </div>
  );
}
