import type { AtsGeminiReport } from "@/lib/atsGeminiReport";

const PREFIX = "resumeai-ats-gemini-report-v1-";

export function getAtsReportStorageKey(userId: string | null | undefined): string | null {
  if (!userId) return null;
  return `${PREFIX}${userId}`;
}

export type StoredAtsReportSession = {
  resumeText: string;
  report: AtsGeminiReport;
  updatedAt: number;
};

export function loadStoredAtsReport(userId: string | null | undefined): StoredAtsReportSession | null {
  if (typeof window === "undefined" || !userId) return null;
  const key = getAtsReportStorageKey(userId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAtsReportSession>;
    if (typeof parsed.resumeText !== "string" || !parsed.report || typeof parsed.updatedAt !== "number") {
      return null;
    }
    return {
      resumeText: parsed.resumeText,
      report: parsed.report as AtsGeminiReport,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function saveStoredAtsReport(userId: string, data: Omit<StoredAtsReportSession, "updatedAt">): void {
  const key = getAtsReportStorageKey(userId);
  if (!key) return;
  try {
    const session: StoredAtsReportSession = {
      ...data,
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(session));
  } catch {
    /* quota */
  }
}
