"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { replaceLoadingWithError, replaceLoadingWithSuccess } from "@/lib/toast";
import { CAREER_GUIDE_ROTATING_TOAST_ID, useRotatingLoadingToast } from "@/lib/rotatingLoadingToast";
import {
  saveStoredCareerGuide,
  loadStoredCareerGuide,
  clearStoredCareerGuide,
  type StoredCareerGuideSession,
} from "@/lib/careerGuideStorage";
import { EditorNavbar } from "@/components/editor/EditorNavbar";
import { EditorPageSkeleton } from "@/components/editor/EditorPageSkeleton";
import { SkillsCareerGuideForm } from "@/components/editor/SkillsCareerGuideForm";
import { GeminiCareerGuideDisplay } from "@/components/editor/GeminiCareerGuideDisplay";

export function PostAnalysisEditorClient() {
  const { user, isLoaded } = useUser();

  const [booted, setBooted] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [geminiSession, setGeminiSession] = useState<StoredCareerGuideSession | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState<string | null>(null);
  const [enhanceWithGemini, setEnhanceWithGemini] = useState(true);
  const prevCanUseGeminiRef = useRef<boolean | null>(null);

  useRotatingLoadingToast(guideLoading, CAREER_GUIDE_ROTATING_TOAST_ID, {
    dismissWhenInactive: false,
  });

  const meta = user?.publicMetadata as Record<string, unknown> | undefined;
  const canUseGeminiPolish = Boolean(user?.id && isPremiumPublicMetadata(meta));

  useEffect(() => {
    if (!canUseGeminiPolish) {
      setEnhanceWithGemini(false);
    } else if (prevCanUseGeminiRef.current === false) {
      setEnhanceWithGemini(true);
    }
    prevCanUseGeminiRef.current = canUseGeminiPolish;
  }, [canUseGeminiPolish]);

  useEffect(() => {
    if (!isLoaded) return;
    if (user?.id) {
      const g = loadStoredCareerGuide(user.id);
      if (g) {
        setGeminiSession(g);
        setSkillsInput(g.skills);
      }
    }
    setBooted(true);
  }, [isLoaded, user?.id]);

  const generateCareerGuide = useCallback(async () => {
    const skills = skillsInput.trim();
    if (!skills) {
      setGuideError("Add at least one skill (comma-separated).");
      return;
    }
    setGuideLoading(true);
    setGuideError(null);
    try {
      const res = await fetch("/api/career-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, useGeminiPolish: enhanceWithGemini }),
      });
      const j = (await res.json()) as { guide?: StoredCareerGuideSession["guide"]; skillsUsed?: string; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Could not generate career guide.");
      if (!j.guide) throw new Error("Invalid response from server.");
      const session: StoredCareerGuideSession = {
        skills: j.skillsUsed ?? skills,
        guide: j.guide,
      };
      const uid = user?.id;
      if (uid) saveStoredCareerGuide(uid, session);
      setGeminiSession(session);
      replaceLoadingWithSuccess(CAREER_GUIDE_ROTATING_TOAST_ID, "Career guide ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setGuideError(msg);
      replaceLoadingWithError(CAREER_GUIDE_ROTATING_TOAST_ID, msg);
    } finally {
      setGuideLoading(false);
    }
  }, [skillsInput, user?.id, enhanceWithGemini]);

  const clearGuideResponse = useCallback(() => {
    setGeminiSession(null);
    setGuideError(null);
    const uid = user?.id;
    if (uid) clearStoredCareerGuide(uid);
  }, [user?.id]);

  if (!booted) {
    return <EditorPageSkeleton />;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0D0D0D]">
      <EditorNavbar variant="career" />

      <div className="flex flex-1 justify-center px-4 py-8 sm:px-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-2xl space-y-6"
        >
          {!user?.id ? (
            <p className="text-center text-xs text-zinc-500">
              <Link href="/" className="font-medium text-orange-400/95 underline-offset-2 hover:underline">
                Sign in from home
              </Link>{" "}
              to save your guide across visits.
            </p>
          ) : null}

          <SkillsCareerGuideForm
            value={skillsInput}
            onChange={setSkillsInput}
            onGenerate={generateCareerGuide}
            loading={guideLoading}
            error={guideError}
            hasGuideResponse={Boolean(geminiSession)}
            onClearResponse={clearGuideResponse}
            showGeminiPolishRow={Boolean(user?.id)}
            canUseGeminiPolish={canUseGeminiPolish}
            enhanceWithGemini={enhanceWithGemini}
            onEnhanceWithGeminiChange={setEnhanceWithGemini}
          />

          {geminiSession ? (
            <div id="gemini-career-guide-output" className="scroll-mt-24">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Your career path</p>
              <GeminiCareerGuideDisplay guide={geminiSession.guide} />
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
