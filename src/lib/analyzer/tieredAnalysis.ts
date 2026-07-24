import type { AnalyzeResult } from "./analyzeResume";

export type AnalysisTier = "free" | "pro";

const MAX_FREE_INSIGHTS = 4;
const MAX_FREE_SKILLS_EACH = 5;
const MAX_FREE_JD_TERMS = 4;

/**
 * Free plan: expose ATS score, light skill context, and a short list of insights (no full gap lists / long copy).
 * Pro plan: callers should attach `analysisTier: "pro"` and return the full `AnalyzeResult` unchanged.
 */
export function applyFreeTierSummary(full: AnalyzeResult): AnalyzeResult {
  const insights: string[] = [];
  const push = (line: string) => {
    const t = line.trim();
    if (!t || insights.includes(t)) return;
    if (insights.length >= MAX_FREE_INSIGHTS) return;
    insights.push(t);
  };

  for (const ai of full.aiSuggestions ?? []) {
    push(ai);
    if (insights.length >= MAX_FREE_INSIGHTS) break;
  }
  for (const w of full.weaknesses) {
    push(w);
    if (insights.length >= MAX_FREE_INSIGHTS) break;
  }
  for (const s of full.suggestions) {
    push(s);
    if (insights.length >= MAX_FREE_INSIGHTS) break;
  }
  for (const st of full.strengths) {
    push(st);
    if (insights.length >= MAX_FREE_INSIGHTS) break;
  }

  if (insights.length === 0) {
    insights.push(
      `ATS-style score ${full.score}/100 — add measurable outcomes and role-relevant keywords to climb higher.`
    );
  }

  return {
    ...full,
    analysisTier: "free",
    matchedSkills: full.matchedSkills.slice(0, MAX_FREE_SKILLS_EACH),
    missingSkills: full.missingSkills.slice(0, MAX_FREE_SKILLS_EACH),
    strengths: [],
    weaknesses: [],
    suggestions: insights,
    jdMatchedKeywords: full.jdMatchedKeywords?.slice(0, MAX_FREE_JD_TERMS),
    jdMissingKeywords: full.jdMissingKeywords?.slice(0, MAX_FREE_JD_TERMS),
    aiSuggestions: undefined,
    scanMode: full.scanMode ?? "rule",
  };
}

export function withProTier(full: AnalyzeResult): AnalyzeResult {
  return { ...full, analysisTier: "pro" };
}
