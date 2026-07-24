import { geminiGenerateText } from "@/lib/llmGeminiGenerate";
import { huggingfaceGenerateText } from "@/lib/huggingfaceInference";

export type LlmProviderId = "gemini" | "huggingface";

/**
 * Paid (Clerk premium) → Google Gemini. Free / anonymous → Hugging Face Inference API.
 */
export async function generateTextBySubscription(opts: {
  isPro: boolean;
  systemInstruction?: string;
  userPrompt: string;
  /** Only passed to Hugging Face path */
  maxNewTokens?: number;
}): Promise<{ provider: LlmProviderId; text: string }> {
  if (opts.isPro) {
    const text = await geminiGenerateText({
      systemInstruction: opts.systemInstruction,
      userPrompt: opts.userPrompt,
    });
    return { provider: "gemini", text };
  }

  const text = await huggingfaceGenerateText({
    systemInstruction: opts.systemInstruction,
    userPrompt: opts.userPrompt,
    maxNewTokens: opts.maxNewTokens,
  });
  return { provider: "huggingface", text };
}
