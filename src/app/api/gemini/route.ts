import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import {
  checkGeminiRateLimit,
  estimateGeminiTokensFromChars,
  geminiRateLimitJsonResponse,
  getClientIp,
} from "@/lib/geminiRateLimit";
import { friendlyGeminiErrorMessage, httpStatusForGeminiFailure, isGeminiQuotaOrRateLimitError } from "@/lib/geminiClientError";
import { generateTextBySubscription } from "@/lib/llmProviderGenerate";
import { getHuggingFaceToken } from "@/lib/huggingfaceInference";

const MAX_USER_CHARS = 14_000;
const MAX_SYSTEM_CHARS = 6_000;

/**
 * Server-only LLM proxy: Pro → Gemini, free/anonymous → Hugging Face Inference API.
 * Used by `fetchResumeInsights` and similar callers.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userPrompt, systemPrompt } = body as {
    userPrompt?: unknown;
    systemPrompt?: unknown;
  };

  if (typeof userPrompt !== "string" || !userPrompt.trim()) {
    return NextResponse.json({ error: "userPrompt is required" }, { status: 400 });
  }

  const user = userPrompt.slice(0, MAX_USER_CHARS);
  const system =
    typeof systemPrompt === "string" && systemPrompt.trim()
      ? systemPrompt.slice(0, MAX_SYSTEM_CHARS)
      : undefined;

  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;
  const meta = (clerkUser?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  const isPro = Boolean(userId && isPremiumPublicMetadata(meta));

  if (isPro && !process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Advanced AI features are not live yet. Coming soon 🚀", code: "GEMINI_CONFIG" },
      { status: 503 }
    );
  }
  if (!isPro && !getHuggingFaceToken()) {
    return NextResponse.json(
      {
        error:
          "Free-tier AI uses Hugging Face. Set HUGGINGFACE_API_TOKEN in .env.local (see .env.example). Optional: HUGGINGFACE_MODEL to override the default Mistral-7B-Instruct-v0.2 model.",
        code: "HF_CONFIG",
      },
      { status: 503 }
    );
  }

  const ip = getClientIp(req);
  const rl = checkGeminiRateLimit({
    userId: userId ?? null,
    clientIp: ip,
    isPro,
    estimatedTokens: estimateGeminiTokensFromChars(user.length, system?.length ?? 0),
  });
  if (!rl.ok) return geminiRateLimitJsonResponse(rl);

  try {
    const { text } = await generateTextBySubscription({
      isPro,
      systemInstruction: system,
      userPrompt: user,
      maxNewTokens: 2048,
    });

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Empty model response. Try again or check provider configuration.", code: "LLM_EMPTY" },
        { status: 502 }
      );
    }

    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "LLM request failed";
    console.error("[gemini]", message);
    if (isPro) {
      const status = httpStatusForGeminiFailure(message);
      return NextResponse.json(
        {
          error: friendlyGeminiErrorMessage(message),
          code: isGeminiQuotaOrRateLimitError(message) ? "GEMINI_QUOTA" : "GEMINI_ERROR",
        },
        { status }
      );
    }
    return NextResponse.json(
      { error: message.length > 400 ? `${message.slice(0, 397)}...` : message, code: "HF_ERROR" },
      { status: 502 }
    );
  }
}
