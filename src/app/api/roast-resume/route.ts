import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import {
  checkGeminiRateLimit,
  estimateGeminiTokensFromChars,
  geminiRateLimitJsonResponse,
  getClientIp,
} from "@/lib/geminiRateLimit";
import { friendlyGeminiErrorMessage, httpStatusForGeminiFailure, isGeminiQuotaOrRateLimitError } from "@/lib/geminiClientError";
import { resolveGeminiModel } from "@/lib/geminiDefaultModel";

export const runtime = "nodejs";

const MAX_TEXT = 14_000;

/**
 * Gemini-powered “roast my resume” — same API key as /api/gemini (Google AI Studio / paid tier).
 * Wire a UI later: POST { text } → { roast }.
 */
const ROAST_SYSTEM = `You are a witty but fair resume reviewer. "Roast" the resume: sharp, funny observations about buzzwords, vague metrics, weak bullets, or awkward phrasing. Be entertaining but not cruel, not discriminatory, no slurs, no attacks on protected traits. Under ~220 words. Plain text only (no markdown).`;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required.", code: "AUTH" }, { status: 401 });
  }
  const clerkUser = await currentUser();
  const meta = (clerkUser?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  if (!isPremiumPublicMetadata(meta)) {
    return NextResponse.json(
      { error: "Pro subscription required.", code: "PREMIUM_REQUIRED" },
      { status: 403 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Advanced AI features are not live yet. Coming soon 🚀" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof (body as { text?: unknown }).text === "string" ? (body as { text: string }).text : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const slice = text.slice(0, MAX_TEXT);
  const ip = getClientIp(req);
  const rl = checkGeminiRateLimit({
    userId,
    clientIp: ip,
    isPro: true,
    estimatedTokens: estimateGeminiTokensFromChars(slice.length, ROAST_SYSTEM.length),
  });
  if (!rl.ok) return geminiRateLimitJsonResponse(rl);

  const modelName = resolveGeminiModel(
    process.env.GEMINI_ROAST_MODEL?.trim() || process.env.GEMINI_MODEL
  );

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: ROAST_SYSTEM,
    });

    const result = await model.generateContent(slice);
    const roast = result.response.text();

    if (!roast?.trim()) {
      return NextResponse.json(
        { error: "Empty response from Gemini. Try again or check GEMINI_ROAST_MODEL / GEMINI_MODEL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ roast: roast.trim() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Roast request failed";
    console.error("[roast-resume]", message);
    const status = httpStatusForGeminiFailure(message);
    return NextResponse.json(
      {
        error: friendlyGeminiErrorMessage(message),
        code: isGeminiQuotaOrRateLimitError(message) ? "GEMINI_QUOTA" : "GEMINI_ERROR",
      },
      { status }
    );
  }
}
