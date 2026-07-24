import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildCareerAdvisorPrompt, parseGeminiCareerGuideJson } from "@/lib/careerGuideGemini";
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

const MAX_SKILLS_CHARS = 4_000;

/** Pro + `useGeminiPolish` (default true) → Gemini. Otherwise → Hugging Face. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = body as { skills?: unknown; useGeminiPolish?: unknown };

  const skills = typeof b.skills === "string" ? b.skills.trim() : "";

  if (!skills) {
    return NextResponse.json({ error: "skills is required (comma-separated list)." }, { status: 400 });
  }

  /** Pro only: when false, use Hugging Face like free tier. Omitted defaults to true. */
  const useGeminiPolish = typeof b.useGeminiPolish === "boolean" ? b.useGeminiPolish : true;

  const skillsTruncated = skills.slice(0, MAX_SKILLS_CHARS);
  const userPrompt = buildCareerAdvisorPrompt(skillsTruncated);

  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;
  const meta = (clerkUser?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  const isPro = Boolean(userId && isPremiumPublicMetadata(meta));

  const routeWithGemini = isPro && useGeminiPolish;

  if (routeWithGemini && !process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "Advanced AI features are not live yet. Coming soon 🚀", code: "GEMINI_CONFIG" },
      { status: 503 }
    );
  }
  if (!routeWithGemini && !getHuggingFaceToken()) {
    return NextResponse.json(
      {
        error:
          "Career guide without Gemini polish uses Hugging Face. Set HUGGINGFACE_API_TOKEN in .env.local. Optional: HUGGINGFACE_MODEL overrides the default model.",
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
    estimatedTokens: estimateGeminiTokensFromChars(userPrompt.length, 400),
  });
  if (!rl.ok) return geminiRateLimitJsonResponse(rl);

  try {
    const { text } = await generateTextBySubscription({
      isPro: routeWithGemini,
      userPrompt,
      maxNewTokens: 3072,
    });

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Empty model response. Try again or check provider configuration.", code: "LLM_EMPTY" },
        { status: 502 }
      );
    }

    const guide = parseGeminiCareerGuideJson(text);
    return NextResponse.json({ guide, skillsUsed: skillsTruncated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Career guide generation failed";
    console.error("[career-guide]", message);
    if (routeWithGemini) {
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
