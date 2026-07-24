/**
 * Normalize @google/generative-ai failures for HTTP responses and UI copy.
 * Common case: free-tier quota exhausted or billing not enabled (Google returns 429 in message text).
 */

export function isGeminiQuotaOrRateLimitError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("quota") ||
    m.includes("429") ||
    m.includes("too many requests") ||
    m.includes("rate limit") ||
    m.includes("resource exhausted") ||
    m.includes("exceeded your current quota")
  );
}

/**
 * Short message for JSON `error` field when Google blocks the request.
 */
export function friendlyGeminiErrorMessage(raw: string): string {
  if (isGeminiQuotaOrRateLimitError(raw)) {
    return (
      "Gemini API quota or rate limit reached for this project. " +
      "Enable billing or raise quotas in Google AI Studio, or set GEMINI_MODEL to a model your key can use (default in app: gemini-2.5-flash)."
    );
  }
  return raw.length > 500 ? `${raw.slice(0, 497)}...` : raw;
}

/** Prefer 503 when Google is throttling / out of quota (retry may work later). */
export function httpStatusForGeminiFailure(message: string): 502 | 503 {
  return isGeminiQuotaOrRateLimitError(message) ? 503 : 502;
}
