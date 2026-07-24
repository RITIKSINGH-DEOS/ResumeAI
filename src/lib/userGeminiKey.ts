const STORAGE_KEY = "resumeai_user_gemini_key";

export function getUserGeminiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY)?.trim() ?? "";
}

export function setUserGeminiKey(key: string) {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function removeUserGeminiKey() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasUserGeminiKey(): boolean {
  return getUserGeminiKey().length > 0;
}
