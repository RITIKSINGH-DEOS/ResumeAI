/** Build editor session from real ATS analysis (no fake data). */

export type AnalyzeInput = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywords_missing: string[];
};

export type EditorMistakes = {
  weakSummary: string;
  missingKeywords: string[];
  formatting: string;
};

export type EditorSuggestions = {
  skills: string[];
  learning: string[];
  projects: string[];
  resume: string[];
};

export type ResumeEditorPayloadV2 = {
  v: 2;
  content: string;
  score: number;
  missingSkills: string[];
  suggestions: EditorSuggestions;
  mistakes: EditorMistakes;
};

function pickFormattingHint(improvements: string[]): string {
  const hit = improvements.find((i) => /format|layout|spacing|bullet|font|pdf/i.test(i));
  return hit ?? "Use clear section headings, consistent bullets, and scannable line length.";
}

function pickWeakSummary(analysis: AnalyzeInput): string {
  const fromImp = analysis.improvements.find((i) => /summary|headline|objective|profile/i.test(i));
  if (fromImp) return fromImp;
  return analysis.summary || "Strengthen your professional summary with role-specific keywords and a clear value proposition.";
}

export function buildEditorPayloadFromAnalysis(
  resumeText: string,
  analysis: AnalyzeInput
): ResumeEditorPayloadV2 {
  const missingSkills = [...analysis.keywords_missing];

  const skills = missingSkills;

  const learning = analysis.improvements.map((imp) => {
    if (/learn|study|course|practice|build|deep/i.test(imp)) return imp;
    return `Address gap: ${imp}`;
  });

  const projects = missingSkills.slice(0, 6).map(
    (kw) => `Build a small portfolio project showcasing ${kw} (API + README + metrics if possible).`
  );

  const resume = analysis.improvements.map((x) => `Apply to resume: ${x}`);

  return {
    v: 2,
    content: resumeText,
    score: analysis.score,
    missingSkills,
    suggestions: {
      skills,
      learning,
      projects,
      resume,
    },
    mistakes: {
      weakSummary: pickWeakSummary(analysis),
      missingKeywords: [...analysis.keywords_missing],
      formatting: pickFormattingHint(analysis.improvements),
    },
  };
}
