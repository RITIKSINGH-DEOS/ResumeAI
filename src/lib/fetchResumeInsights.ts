import {
  mergeArchiveCertificates,
  mergeArchiveProjects,
  mergeArchiveSkills,
} from "@/data/resumeInsightsArchive";
import type { AnalyzeInput } from "@/lib/buildEditorPayload";

export type ResumeInsights = {
  skills: string[];
  projects: string[];
  certificates: string[];
  summary: string;
  strengths: string[];
  improvements: string[];
  keywords_missing: string[];
  score: number;
};

function parseJson(raw: string): unknown {
  return JSON.parse(raw.replace(/```json|```/g, "").trim()) as unknown;
}

function normalize(ins: Record<string, unknown>): ResumeInsights {
  const arr = (k: string) =>
    Array.isArray(ins[k]) ? (ins[k] as unknown[]).map((x) => String(x).trim()).filter(Boolean) : [];
  const rawScore = ins.ats_score ?? ins.score;
  const num = typeof rawScore === "number" ? rawScore : Number(rawScore);
  return {
    skills: arr("skills"),
    projects: arr("projects"),
    certificates: arr("certificates"),
    summary: typeof ins.summary === "string" ? ins.summary : "",
    strengths: arr("strengths"),
    improvements: arr("improvements"),
    keywords_missing: arr("keywords_missing"),
    score: Number.isFinite(num) ? Math.min(100, Math.max(0, Math.round(num))) : 72,
  };
}

/** Calls /api/gemini; merges archive reference data into lists. */
export async function fetchResumeInsights(resumeText: string): Promise<ResumeInsights> {
  const trimmed = resumeText.slice(0, 12_000);
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userPrompt: `Resume text:\n\n${trimmed}`,
      systemPrompt: `You extract structured resume data for a job seeker dashboard. Return ONLY valid JSON (no markdown):
{
  "ats_score": <number 0-100 estimate>,
  "summary": "<2 sentence overview of the candidate>",
  "skills": ["<skill1>", "<skill2>", ...],
  "projects": ["<project or portfolio line 1>", ...],
  "certificates": ["<certification or course 1>", ...],
  "strengths": ["<strength 1>", ...],
  "improvements": ["<improvement 1>", ...],
  "keywords_missing": ["<keyword often expected in target roles 1>", ...]
}
Use empty arrays if unknown. Be specific; infer from text only where reasonable.`,
    }),
  });
  const data = (await res.json()) as { text?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  const raw = data.text ?? "";
  const parsed = parseJson(raw) as Record<string, unknown>;
  const base = normalize(parsed);
  return {
    ...base,
    skills: mergeArchiveSkills(base.skills),
    projects: mergeArchiveProjects(base.projects),
    certificates: mergeArchiveCertificates(base.certificates),
  };
}

export function insightsToAnalyzeInput(ins: ResumeInsights): AnalyzeInput {
  return {
    score: ins.score,
    summary: ins.summary,
    strengths: ins.strengths,
    improvements: ins.improvements,
    keywords_missing: ins.keywords_missing,
  };
}
