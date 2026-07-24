import type { GeminiCareerGuide } from "@/lib/careerGuideGemini";

const PREFIX = "resumeai-gemini-career-guide-v1-";

export function getCareerGuideStorageKey(userId: string | null | undefined): string | null {
  if (!userId) return null;
  return `${PREFIX}${userId}`;
}

export type StoredCareerGuideSession = {
  skills: string;
  guide: GeminiCareerGuide;
};

export function loadStoredCareerGuide(userId: string | null | undefined): StoredCareerGuideSession | null {
  if (typeof window === "undefined" || !userId) return null;
  const key = getCareerGuideStorageKey(userId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCareerGuideSession>;
    if (typeof parsed.skills !== "string" || !parsed.guide || typeof parsed.guide !== "object") return null;
    return { skills: parsed.skills, guide: parsed.guide as GeminiCareerGuide };
  } catch {
    return null;
  }
}

export function saveStoredCareerGuide(userId: string, data: StoredCareerGuideSession): void {
  const key = getCareerGuideStorageKey(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function clearStoredCareerGuide(userId: string | null | undefined): void {
  if (typeof window === "undefined" || !userId) return;
  const key = getCareerGuideStorageKey(userId);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
