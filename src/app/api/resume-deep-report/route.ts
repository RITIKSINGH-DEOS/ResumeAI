import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { DEEP_ATS_REPORT_SYSTEM } from "@/lib/prompts/deepAtsReport";
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
const MAX_JD = 12_000;

/**
 * Pro-only: Gemini-generated deep ATS + recruiter report (structured markdown).
 * POST { text, jobTitle?, jobDescription? }
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required.", code: "AUTH" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const meta = (clerkUser?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  if (!isPremiumPublicMetadata(meta)) {
    return NextResponse.json(
      { error: "Pro plan required for full ATS report.", code: "PREMIUM_REQUIRED" },
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

  const b = body as {
    text?: unknown;
    jobTitle?: unknown;
    jobDescription?: unknown;
  };

  const text = typeof b.text === "string" ? b.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const jobTitle = typeof b.jobTitle === "string" ? b.jobTitle.trim().slice(0, 500) : "";
  const jobDescription =
    typeof b.jobDescription === "string" ? b.jobDescription.trim().slice(0, MAX_JD) : "";

  const userPayload = [
    "=== RESUME TEXT ===",
    text.slice(0, MAX_TEXT),
    "",
    "=== TARGET JOB TITLE (optional) ===",
    jobTitle || "(not provided)",
    "",
    "=== JOB DESCRIPTION (optional) ===",
    jobDescription || "(not provided)",
  ].join("\n");

  const ip = getClientIp(req);
  const rl = checkGeminiRateLimit({
    userId,
    clientIp: ip,
    isPro: true,
    estimatedTokens: estimateGeminiTokensFromChars(userPayload.length, DEEP_ATS_REPORT_SYSTEM.length),
  });
  if (!rl.ok) return geminiRateLimitJsonResponse(rl);

  const modelName = resolveGeminiModel(
    process.env.GEMINI_DEEP_REPORT_MODEL?.trim() || process.env.GEMINI_MODEL
  );

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: DEEP_ATS_REPORT_SYSTEM,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPayload }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.65,
      },
    });

    const markdown = result.response.text();

    if (!markdown?.trim()) {
      return NextResponse.json(
        { error: "Empty response from Gemini. Try again or set GEMINI_DEEP_REPORT_MODEL / GEMINI_MODEL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ markdown: markdown.trim() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Deep report failed";
    console.error("[resume-deep-report]", message);
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
