import { NextResponse } from "next/server";

/**
 * Best-effort Gemini usage limits for serverless (in-process store).
 * For multi-instance production, back this with Redis/Upstash and the same key scheme.
 */

const MS_PER_MIN = 60_000;

function numEnv(name: string, fallback: number): number {
  const v = process.env[name]?.trim();
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Max Gemini requests per minute per user (or per IP if anonymous). */
export function getGeminiRpmLimit(): number {
  return numEnv("GEMINI_RL_RPM", 18);
}

/** Estimated output tokens per call (Gemini bills input+output; we budget conservatively). */
export function getOutputTokenEstimate(): number {
  return numEnv("GEMINI_RL_OUTPUT_TOKEN_ESTIMATE", 2800);
}

/** Daily estimated token budget (input+output) for signed-in free / anonymous usage. */
export function getDailyTokenLimitFree(): number {
  return numEnv("GEMINI_RL_DAILY_TOKEN_BUDGET_FREE", 120_000);
}

/** Daily estimated token budget for Pro / paid features. */
export function getDailyTokenLimitPro(): number {
  return numEnv("GEMINI_RL_DAILY_TOKEN_BUDGET_PRO", 900_000);
}

/** Optional global cap on Gemini calls per minute (all keys). 0 = disabled. */
export function getGlobalRpmLimit(): number {
  return numEnv("GEMINI_RL_GLOBAL_RPM", 180);
}

/** Rough token estimate: ~4 chars per token for English + small overhead. */
export function estimateGeminiTokensFromChars(inputChars: number, systemChars = 0): number {
  const raw = Math.ceil((Math.max(0, inputChars) + Math.max(0, systemChars)) * 0.28);
  return raw + getOutputTokenEstimate();
}

export function getClientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return null;
}

function utcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

type DayRow = { date: string; tokens: number };

const minuteHits = new Map<string, number[]>();
const dayTokens = new Map<string, DayRow>();
let globalMinuteHits: number[] = [];

function pruneMinute(arr: number[], now: number): number[] {
  return arr.filter((t) => now - t < MS_PER_MIN);
}

function rateLimitKey(userId: string | null, ip: string | null): string {
  if (userId) return `u:${userId}`;
  return `ip:${ip ?? "unknown"}`;
}

export type GeminiRateCheck =
  | { ok: true }
  | { ok: false; retryAfterSec: number; message: string };

/**
 * Call once per Gemini-bound request before `generateContent`.
 * Uses RPM + estimated daily token budget (UTC day).
 */
export function checkGeminiRateLimit(opts: {
  userId: string | null;
  clientIp: string | null;
  isPro: boolean;
  /** Precomputed estimate (input+system chars → tokens + output buffer). */
  estimatedTokens: number;
}): GeminiRateCheck {
  const rpm = getGeminiRpmLimit();
  const globalCap = getGlobalRpmLimit();
  const dailyLimit = opts.isPro ? getDailyTokenLimitPro() : getDailyTokenLimitFree();
  const key = rateLimitKey(opts.userId, opts.clientIp);
  const now = Date.now();

  if (globalCap > 0) {
    globalMinuteHits = pruneMinute(globalMinuteHits, now);
    if (globalMinuteHits.length >= globalCap) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((MS_PER_MIN - (now - globalMinuteHits[0]!)) / 1000)),
        message: "Service is busy. Please retry in a minute.",
      };
    }
  }

  let arr = minuteHits.get(key) ?? [];
  arr = pruneMinute(arr, now);
  if (arr.length >= rpm) {
    const oldest = arr[0]!;
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((MS_PER_MIN - (now - oldest)) / 1000)),
      message: "Too many AI requests. Please wait before trying again.",
    };
  }

  const today = utcDateString();
  let row = dayTokens.get(key);
  if (!row || row.date !== today) {
    row = { date: today, tokens: 0 };
  }
  const tokens = Math.max(1, Math.ceil(opts.estimatedTokens));
  if (row.tokens + tokens > dailyLimit) {
    return {
      ok: false,
      retryAfterSec: 3600,
      message: "Daily AI usage limit reached. Try again tomorrow or upgrade your plan.",
    };
  }

  row.tokens += tokens;
  dayTokens.set(key, row);

  arr.push(now);
  minuteHits.set(key, arr);

  if (globalCap > 0) {
    globalMinuteHits.push(now);
  }

  return { ok: true };
}

export function geminiRateLimitJsonResponse(check: Extract<GeminiRateCheck, { ok: false }>): NextResponse {
  return NextResponse.json(
    { error: check.message, code: "RATE_LIMIT" },
    {
      status: 429,
      headers: { "Retry-After": String(check.retryAfterSec) },
    }
  );
}
