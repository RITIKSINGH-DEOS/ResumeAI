import { buildEditorPayloadFromAnalysis, type ResumeEditorPayloadV2 } from "@/lib/buildEditorPayload";

/** Legacy session key — migrated once */
export const LEGACY_EDITOR_SESSION_KEY = "resumeai-editor-payload";

/** Per Clerk user — keeps each user’s editor session separate */
export function getEditorSessionKey(userId: string | null | undefined): string {
  if (!userId) return "resumeai-editor-guest";
  return `resumeai-editor-${userId}`;
}

/** Legacy v1 — kept for migration */
export type EditorAnalysisPayload = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywords_missing: string[];
};

export type ResumeEditorSessionV1 = {
  v: 1;
  resumeText: string;
  analysis: EditorAnalysisPayload;
};

export type ResumeEditorSession = ResumeEditorSessionV1 | ResumeEditorPayloadV2;

export function saveEditorPayload(payload: ResumeEditorPayloadV2, userId?: string | null): void {
  if (typeof window === "undefined") return;
  if (!userId) return;
  try {
    const key = getEditorSessionKey(userId);
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* quota */
  }
}

/** @deprecated use saveEditorPayload(payload, userId) with Clerk user id */
export function saveEditorSession(): void {
  /* no-op — per-user storage requires Clerk userId */
}

function migrateV1(raw: ResumeEditorSessionV1): ResumeEditorPayloadV2 {
  return buildEditorPayloadFromAnalysis(raw.resumeText, {
    score: raw.analysis.score,
    summary: raw.analysis.summary,
    strengths: raw.analysis.strengths,
    improvements: raw.analysis.improvements,
    keywords_missing: raw.analysis.keywords_missing,
  });
}

export function loadEditorPayload(userId?: string | null): ResumeEditorPayloadV2 | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const key = getEditorSessionKey(userId);
    let raw = sessionStorage.getItem(key);
    if (!raw) {
      const legacy = sessionStorage.getItem(LEGACY_EDITOR_SESSION_KEY);
      if (legacy) {
        sessionStorage.setItem(key, legacy);
        sessionStorage.removeItem(LEGACY_EDITOR_SESSION_KEY);
        raw = legacy;
      }
    }
    if (!raw) return null;
    const p = JSON.parse(raw) as ResumeEditorSession;
    if (p?.v === 2 && typeof (p as ResumeEditorPayloadV2).content === "string") {
      const x = p as ResumeEditorPayloadV2;
      if (typeof x.score !== "number" || !x.suggestions || !x.mistakes) return null;
      return x;
    }
    if (p?.v === 1 && typeof (p as ResumeEditorSessionV1).resumeText === "string") {
      return migrateV1(p as ResumeEditorSessionV1);
    }
    return null;
  } catch {
    return null;
  }
}

/** @deprecated */
export function loadEditorSession(): ResumeEditorSessionV1 | null {
  return null;
}
