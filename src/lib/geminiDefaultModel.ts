/**
 * Default Gemini model when `GEMINI_MODEL` is unset.
 * Override per deployment via env: GEMINI_MODEL=gemini-2.5-flash
 */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function resolveGeminiModel(envValue: string | undefined): string {
  const t = envValue?.trim();
  return t || DEFAULT_GEMINI_MODEL;
}
