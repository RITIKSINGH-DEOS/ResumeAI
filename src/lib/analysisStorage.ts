/** Legacy key (pre per-user isolation) — migrated once per browser */
export const LEGACY_ANALYSIS_STORAGE_KEY = "analysis";

export type StoredAnalysis = import("@/lib/analyzer").AnalyzeResult & {
  resumeText: string;
  /** From landing job fields — used by editor Pro deep report */
  jobTitle?: string;
  jobDescription?: string;
};

/** Per signed-in user — avoids leaking data across accounts on the same device. */
export function getAnalysisStorageKey(userId: string | null | undefined): string {
  if (!userId) return "resumeai-analysis-guest";
  return `resumeai-analysis-${userId}`;
}

/** Load stored analysis for this Clerk user; migrates legacy `analysis` once. */
export function loadStoredAnalysisFromStorage(userId: string | null | undefined): StoredAnalysis | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const key = getAnalysisStorageKey(userId);
    let raw = localStorage.getItem(key);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_ANALYSIS_STORAGE_KEY);
      if (legacy) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(LEGACY_ANALYSIS_STORAGE_KEY);
        raw = legacy;
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAnalysis>;
    const resumeText = typeof parsed.resumeText === "string" ? parsed.resumeText : "";
    const score = typeof parsed.score === "number" ? parsed.score : undefined;
    if (resumeText && score !== undefined && parsed.category) {
      return parsed as StoredAnalysis;
    }
  } catch {
    /* ignore */
  }
  return null;
}
