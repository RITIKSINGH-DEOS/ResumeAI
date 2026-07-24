import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiModel } from "@/lib/geminiDefaultModel";
import type { AnalyzeResult } from "./analyzeResume";

const MAX_RESUME = 5_000;
const MAX_JD = 4_000;

const PRO_SYSTEM = `You are an expert resume coach for experienced hiring managers and ATS systems.
Return ONLY valid JSON: {"suggestions": string[]}. No markdown fences, no commentary outside JSON.
Pro tier: produce 6–10 distinct, high-value suggestions. Cover: headline/summary, impact metrics, JD keyword weaving,
section order, ATS-safe formatting, and one networking/LinkedIn angle where relevant. Do not repeat the RULE_BASED_JSON
strings verbatim; extend and sharpen them with specifics from RESUME_TEXT and JOB_DESCRIPTION.`;

/**
 * Pro-only Gemini pass: full-context prompt for deeper suggestions (requires paid plan + toggle on client).
 */
export async function enhanceAnalyzeWithGemini(
  base: AnalyzeResult,
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  userProvidedKey?: string
): Promise<string[] | null> {
  const apiKey = userProvidedKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const modelName = resolveGeminiModel(process.env.GEMINI_MODEL);

  const userPrompt = `RULE_BASED_JSON (do not copy verbatim; use as signals only):
${JSON.stringify({
  score: base.score,
  category: base.category,
  matchedSkills: base.matchedSkills,
  missingSkills: base.missingSkills,
  weaknesses: base.weaknesses,
  strengths: base.strengths,
  suggestions: base.suggestions,
  jdMissingKeywords: base.jdMissingKeywords ?? [],
  jdMatchedKeywords: base.jdMatchedKeywords ?? [],
  jdCoverage: base.jdCoverage,
})}

TARGET_ROLE / JOB_TITLE:
${jobTitle || "(not provided)"}

JOB_DESCRIPTION (align when relevant):
${(jobDescription || "(not provided)").slice(0, MAX_JD)}

RESUME_TEXT (primary evidence):
${resumeText.slice(0, MAX_RESUME)}

Return ONLY valid JSON: {"suggestions": string[]}
Requirements:
- 6–10 strings; each is one concrete edit (rewrite, add metric, reorder section, keyword placement).
- Prefer quantified outcomes where the resume allows inference; never invent employers or degrees.
- If JD is empty, focus on role clarity, ATS keywords for ${base.category}, and impact bullets.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: PRO_SYSTEM,
    });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    const parsed = JSON.parse(
      text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim()
    ) as { suggestions?: unknown };

    if (!Array.isArray(parsed.suggestions)) return null;
    const out = parsed.suggestions
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 12);
    return out.length ? out : null;
  } catch {
    return null;
  }
}
