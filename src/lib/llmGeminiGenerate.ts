import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiModel } from "@/lib/geminiDefaultModel";

/** Server-only Gemini text generation (Pro tier). */
export async function geminiGenerateText(opts: {
  systemInstruction?: string;
  userPrompt: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Advanced AI features are not live yet. Coming soon 🚀");

  const modelName = resolveGeminiModel(process.env.GEMINI_MODEL);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(opts.systemInstruction?.trim() ? { systemInstruction: opts.systemInstruction.trim() } : {}),
  });

  try {
    const result = await model.generateContent(opts.userPrompt);
    const text = result.response.text();
    return text?.trim() ?? "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
      throw new Error("Advanced AI features are not live yet. Coming soon 🚀");
    }
    throw e;
  }
}
