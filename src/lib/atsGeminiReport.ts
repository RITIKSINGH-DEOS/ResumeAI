/** Gemini ATS JSON report (Gemini polish / paid-plan flow). */

export type AtsBreakdownSlice = {
  score: number;
  feedback: string;
};

export type AtsSuggestionItem = {
  category: string;
  issue: string;
  recommendation: string;
  priority: string;
};

export type AtsGeminiReport = {
  atsScore: number;
  scoreBreakdown: {
    formatting: AtsBreakdownSlice;
    keywords: AtsBreakdownSlice;
    structure: AtsBreakdownSlice;
    readability: AtsBreakdownSlice;
  };
  suggestions: AtsSuggestionItem[];
  strengths: string[];
  summary: string;
};

const MAX_RESUME_CHARS = 14_000;

/** Full instruction block sent to Gemini for the ATS JSON report (Gemini polish → /api/ats-gemini). */
export const ATS_GEMINI_PROMPT = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
and provide:
1. An ATS compatibility score (0-100)
2. Detailed suggestions to improve the resume for better ATS performance

Your entire response must be in valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.

The JSON object should have the following structure:
{
  "atsScore": 85,
  "scoreBreakdown": {
    "formatting": {
      "score": 90,
      "feedback": "Brief feedback on formatting"
    },
    "keywords": {
      "score": 80,
      "feedback": "Brief feedback on keyword usage"
    },
    "structure": {
      "score": 85,
      "feedback": "Brief feedback on resume structure"
    },
    "readability": {
      "score": 88,
      "feedback": "Brief feedback on readability"
    }
  },
  "suggestions": [
    {
      "category": "Category name (e.g., 'Formatting', 'Content', 'Keywords', 'Structure')",
      "issue": "Description of the issue found",
      "recommendation": "Specific actionable recommendation to fix it",
      "priority": "high/medium/low"
    }
  ],
  "strengths": [
    "List of things the resume does well for ATS"
  ],
  "summary": "A brief 2-3 sentence summary of the overall ATS performance"
}

Focus on: - File format and structure compatibility - Proper use of standard section headings - Keyword optimization - Formatting issues (tables, columns, graphics, special characters) - Contact information placement - Date formatting - Use of action verbs and quantifiable achievements - Section organization and flow`;

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function sliceFromUnknown(x: unknown): AtsBreakdownSlice {
  if (!isRecord(x)) return { score: 0, feedback: "" };
  return {
    score: typeof x.score === "number" ? Math.min(100, Math.max(0, x.score)) : 0,
    feedback: typeof x.feedback === "string" ? x.feedback : "",
  };
}

function parseSuggestions(raw: unknown): AtsSuggestionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord).map((s) => ({
    category: typeof s.category === "string" ? s.category : "",
    issue: typeof s.issue === "string" ? s.issue : "",
    recommendation: typeof s.recommendation === "string" ? s.recommendation : "",
    priority: typeof s.priority === "string" ? s.priority : "medium",
  }));
}

export function parseAtsGeminiJson(raw: string): AtsGeminiReport {
  let text = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const fenced = text.match(fence);
  if (fenced?.[1]) text = fenced[1].trim();
  else {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) text = text.slice(start, end + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Could not parse ATS report JSON from Gemini.");
  }
  if (!isRecord(parsed)) throw new Error("Invalid ATS report: root must be an object.");

  const sb = isRecord(parsed.scoreBreakdown) ? parsed.scoreBreakdown : {};
  const atsScore =
    typeof parsed.atsScore === "number"
      ? Math.min(100, Math.max(0, parsed.atsScore))
      : typeof parsed.atsScore === "string"
        ? Math.min(100, Math.max(0, parseInt(parsed.atsScore, 10) || 0))
        : 0;

  return {
    atsScore,
    scoreBreakdown: {
      formatting: sliceFromUnknown(sb.formatting),
      keywords: sliceFromUnknown(sb.keywords),
      structure: sliceFromUnknown(sb.structure),
      readability: sliceFromUnknown(sb.readability),
    },
    suggestions: parseSuggestions(parsed.suggestions),
    strengths: Array.isArray(parsed.strengths)
      ? parsed.strengths.filter((x): x is string => typeof x === "string")
      : [],
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
  };
}

export function buildAtsGeminiUserPrompt(resumeText: string): string {
  const body = resumeText.slice(0, MAX_RESUME_CHARS);
  return `${ATS_GEMINI_PROMPT}

---
Resume to analyze:

${body}`;
}
