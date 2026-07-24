import { cleanText } from "@/lib/analyzer/extractText";
import { parseResume } from "@/lib/analyzer/parseResume";
import type { AnalyzeResult } from "@/lib/analyzer";
import { buildEditorPayloadFromAnalysis, type ResumeEditorPayloadV2 } from "@/lib/buildEditorPayload";

/**
 * Map rule-based analyzer output + resume text to editor payload.
 */
export function mapRuleAnalysisToEditorPayload(
  resumeText: string,
  data: AnalyzeResult
): ResumeEditorPayloadV2 {
  const parsed = parseResume(cleanText(resumeText));
  const jdExtra = data.jdMissingKeywords ?? [];
  const keywordsMissing = [
    ...new Set([...data.missingSkills, ...jdExtra.map((k) => k.trim())].filter(Boolean)),
  ];
  const improvements = [
    ...data.weaknesses,
    ...data.suggestions,
    ...(data.aiSuggestions ?? []),
  ];

  return buildEditorPayloadFromAnalysis(resumeText, {
    score: data.score,
    summary: parsed.summary || "",
    strengths: data.strengths,
    improvements,
    keywords_missing: keywordsMissing,
  });
}
