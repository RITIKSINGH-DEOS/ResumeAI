import type { AnalyzeResult } from "@/lib/analyzer";

export type RecruiterBrief = {
  score: number;
  /** One line, specific reason for the score */
  scoreReason: string;
  strengths: string[];
  weaknesses: string[];
  quickFixes: string[];
};

function oneLineScoreReason(score: number, category: string): string {
  const cat = category.replace(/_/g, " ");
  if (score >= 82) return `Strong ATS signals for ${cat}—skills, summary, and experience line up well.`;
  if (score >= 68) return `Solid base for ${cat}; tighten missing keywords and impact bullets to climb higher.`;
  if (score >= 52) return `Mixed fit: visible skills but gaps in summary, metrics, or JD alignment.`;
  return `Needs work: strengthen summary, quantify experience, and align skills to your target role.`;
}

function padStrengths(s: string[]): string[] {
  const out = s.slice(0, 3);
  while (out.length < 2) {
    out.push(
      out.length === 0
        ? "Add a clear summary line tailored to your target role."
        : "Surface 1–2 quantified wins in your experience section."
    );
  }
  return out.slice(0, 3);
}

function padWeaknesses(w: string[]): string[] {
  const out = w.slice(0, 3);
  if (out.length === 0) out.push("No major structural flags—still verify every claim matches the JD.");
  return out.slice(0, 3);
}

/** Short recruiter-style brief from rule analysis (no LLM). */
export function buildRecruiterBrief(data: AnalyzeResult): RecruiterBrief {
  const strengths = padStrengths(data.strengths);
  const weaknesses = padWeaknesses(data.weaknesses);
  const raw = data.suggestions.filter(Boolean);
  const quickFixes: string[] = [];
  if (raw[0]) quickFixes.push(raw[0]);
  if (raw[1]) quickFixes.push(raw[1]);
  if (quickFixes.length === 0) {
    quickFixes.push("Add one metric-driven bullet under your most recent role.");
    quickFixes.push("Align your headline with the job title you apply for.");
  } else if (quickFixes.length === 1) {
    quickFixes.push("Mirror 3–5 JD phrases in Skills or Experience where accurate.");
  }

  return {
    score: data.score,
    scoreReason: oneLineScoreReason(data.score, data.category),
    strengths,
    weaknesses,
    quickFixes: quickFixes.slice(0, 2),
  };
}
