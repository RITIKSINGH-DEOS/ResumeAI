import type { AnalyzeResult } from "./analyzeResume";
import { getHuggingFaceToken, huggingfaceGenerateText } from "@/lib/huggingfaceInference";

const MAX_RESUME = 4000;
const MAX_JD = 2500;

const HF_SYSTEM = `You are a resume coach.
Return ONLY valid JSON in this exact shape: {"suggestions": string[]}
No markdown, no extra keys, no explanation outside JSON.`;

function parseSuggestionsJson(raw: string): string[] | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const jsonText = fenced?.[1]?.trim() || trimmed;
  try {
    const parsed = JSON.parse(jsonText) as { suggestions?: unknown };
    if (!Array.isArray(parsed.suggestions)) return null;
    const out = parsed.suggestions
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 8);
    return out.length ? out : null;
  } catch {
    return null;
  }
}

/** Free-tier HF pass for extra actionable suggestions. Safe no-op if HF isn't configured/fails. */
export async function enhanceAnalyzeWithHuggingFace(
  base: AnalyzeResult,
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): Promise<string[] | null> {
  if (!getHuggingFaceToken()) return null;

  const userPrompt = `RULE_BASED_JSON:
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

JOB_DESCRIPTION:
${(jobDescription || "(not provided)").slice(0, MAX_JD)}

RESUME_TEXT:
${resumeText.slice(0, MAX_RESUME)}

Task:
- Return 4-8 high-value suggestions that are specific and actionable.
- Focus on missing metrics, clearer impact bullets, keyword alignment, and ATS-safe wording.
- Never invent employers, education, or certifications.

Return ONLY:
{"suggestions":["..."]}`;

  try {
    const text = await huggingfaceGenerateText({
      systemInstruction: HF_SYSTEM,
      userPrompt,
      maxNewTokens: 900,
    });
    return parseSuggestionsJson(text);
  } catch {
    return null;
  }
}
