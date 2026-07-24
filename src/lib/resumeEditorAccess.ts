import { loadStoredAnalysisFromStorage } from "@/lib/analysisStorage";
import { loadEditorPayload } from "@/lib/editorSession";

/** True when this user has completed an analysis upload (or has editor session text). */
export function hasResumeEditorAccess(userId: string | null | undefined): boolean {
  if (!userId || typeof window === "undefined") return false;
  if (loadStoredAnalysisFromStorage(userId)) return true;
  const p = loadEditorPayload(userId);
  return Boolean(p?.content?.trim());
}
