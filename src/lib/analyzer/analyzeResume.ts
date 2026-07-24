import { cleanText } from "./extractText";
import { parseResume } from "./parseResume";
import { jdSkillGaps, extraJdPhrases } from "./jdKeywords";
import {
  ROLE_SKILLS,
  canonicalizeSkillToken,
  getAllCanonicalSkills,
  type RoleCategory,
} from "./skillDataset";

export type AnalyzeOptions = {
  jobTitle?: string;
  jobDescription?: string;
};

export type AnalyzeResult = {
  score: number;
  category: RoleCategory;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  jdMatchedKeywords?: string[];
  jdMissingKeywords?: string[];
  jdCoverage?: number;
  scanMode?: "rule" | "rule+gemini" | "rule+huggingface";
  aiSuggestions?: string[];
  /** Set by /api/analyze: concise output for free, full rule+optional Gemini for Pro */
  analysisTier?: "free" | "pro";
};

function normalizeSkill(s: string): string {
  return s.trim().toLowerCase();
}

function categoryFromJobTitle(title: string): RoleCategory | null {
  const t = title.toLowerCase();
  if (/finance|accountant|cpa|audit|bookkeeper|ledger|tax|controller|gaap|payroll/.test(t)) return "FINANCE";
  if (/designer|ux\b|ui\b|figma|brand|creative|visual/.test(t)) return "DESIGN";
  if (/data scientist|ml engineer|data engineer|machine learning|analyst|bi developer|analytics engineer/.test(t))
    return "DATA";
  if (/product manager|product owner|\bpm\b/.test(t)) return "PRODUCT";
  if (/frontend|front-end|react developer|ui engineer/.test(t)) return "FRONTEND";
  if (/backend|back-end|server|api engineer/.test(t)) return "BACKEND";
  if (/software|engineer|developer|swe|fullstack|full-stack|devops|programmer/.test(t)) return "ENGINEERING";
  return null;
}

function skillsFromFullText(cleanedText: string): Set<string> {
  const set = new Set<string>();
  for (const term of getAllCanonicalSkills()) {
    if (term.length >= 2 && cleanedText.includes(term)) set.add(term);
  }
  return set;
}

function buildUserSkillSet(
  parsedSkills: string[],
  cleanedText: string
): Set<string> {
  const set = new Set<string>();
  for (const s of parsedSkills) {
    const c = canonicalizeSkillToken(s);
    if (c) set.add(normalizeSkill(c));
  }
  skillsFromFullText(cleanedText).forEach((x) => set.add(x));
  return set;
}

function detectCategory(userSkills: Set<string>, jobTitle?: string): RoleCategory {
  let best: RoleCategory = "ENGINEERING";
  let max = -1;
  (Object.keys(ROLE_SKILLS) as RoleCategory[]).forEach((cat) => {
    const required = ROLE_SKILLS[cat];
    const n = required.filter((skill) => userSkills.has(skill)).length;
    if (n > max) {
      max = n;
      best = cat;
    }
  });

  const fromTitle = jobTitle?.trim() ? categoryFromJobTitle(jobTitle) : null;
  if (fromTitle) {
    const req = ROLE_SKILLS[fromTitle];
    const matched = req.filter((s) => userSkills.has(s)).length;
    if (matched >= 1 || max <= 2) return fromTitle;
  }
  return best;
}

function summaryScore(summary: string): number {
  const len = summary.trim().length;
  if (len < 50) return 0.3;
  if (len < 100) return 0.6;
  return 1;
}

function experienceScore(experience: string): number {
  const exp = experience.trim();
  if (!exp) return 0.2;
  if (
    /\d+\s*%/.test(exp) ||
    /\d+\s*(years?|yrs?|months?|mos?)\b/.test(exp) ||
    /\d{4}\s*[-–]\s*\d{4}/.test(exp)
  ) {
    return 1;
  }
  return 0.6;
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr.map((x) => x.trim()).filter(Boolean))];
}

/**
 * Rule-based ATS-style analysis (no external APIs in core logic).
 */
export function analyzeResume(text: string, options?: AnalyzeOptions): AnalyzeResult {
  const cleaned = cleanText(text);
  const parsed = parseResume(cleaned);
  const userSkills = buildUserSkillSet(parsed.skills, cleaned);

  const category = detectCategory(userSkills, options?.jobTitle);
  const requiredSkills = [...ROLE_SKILLS[category]];

  const matchedSkills = requiredSkills.filter((skill) => userSkills.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !userSkills.has(skill));

  const reqLen = requiredSkills.length;
  const skillScore = reqLen > 0 ? matchedSkills.length / reqLen : 0;

  const sumScore = summaryScore(parsed.summary);
  const expScore = experienceScore(parsed.experience);

  let raw = skillScore * 0.5 + sumScore * 0.2 + expScore * 0.3;

  const jd = options?.jobDescription?.trim() ?? "";
  let jdMatchedKeywords: string[] | undefined;
  let jdMissingKeywords: string[] | undefined;
  let jdCoverage = 1;

  if (jd) {
    const gaps = jdSkillGaps(cleaned, jd);
    jdMatchedKeywords = dedupe(gaps.jdMatchedSkills);
    jdMissingKeywords = dedupe(gaps.jdMissingSkills);
    jdCoverage = gaps.jdCoverage;
    raw = raw * 0.82 + jdCoverage * 0.18;
  }

  const score = Math.round(Math.min(100, Math.max(0, raw * 100)));

  const weaknesses: string[] = [];
  if (sumScore < 0.5) weaknesses.push("Weak summary section");
  if (expScore < 0.5) weaknesses.push("Experience lacks impact");
  if (missingSkills.length > 0) weaknesses.push("Missing key skills for target role");
  if (jd && (jdMissingKeywords?.length ?? 0) > 0) {
    weaknesses.push("Job description keywords not fully reflected on resume");
  }

  const suggestions: string[] = [];
  const roleLabel = options?.jobTitle?.trim() || category.replace(/_/g, " ");

  if (missingSkills.length > 0) {
    const sample = missingSkills.slice(0, 5).join(", ");
    suggestions.push(
      `Skills line: add "${sample}" (only what you truly know) under a Technical Skills or Skills section.`
    );
  }
  if (jdMissingKeywords && jdMissingKeywords.length > 0) {
    const top = jdMissingKeywords.slice(0, 5).join(", ");
    suggestions.push(
      `JD fit: weave these terms naturally into Experience or Skills if accurate → ${top}`
    );
    const extra = extraJdPhrases(jd, 6);
    if (extra.length) {
      suggestions.push(
        `JD vocabulary: consider mirroring recurring themes (e.g. ${extra.slice(0, 4).join(", ")}) in one bullet.`
      );
    }
  }
  if (sumScore < 0.6) {
    suggestions.push(
      `Summary template: "${roleLabel} with [X] years in [domain]. Impact: [metric]. Stack: [2–3 skills]."`
    );
  }
  if (expScore < 1) {
    suggestions.push(
      `Experience bullet pattern: "Verb + metric + tool" → e.g. "Reduced latency by 35% using Node.js and Redis."`
    );
  }
  suggestions.push(
    `Projects: add 1 repo or case study link (README with problem → approach → result).`
  );

  const strengths: string[] = [];
  if (matchedSkills.length > 0) {
    strengths.push(`Aligned with ${category} profile: ${matchedSkills.join(", ")}`);
  }
  if (jdMatchedKeywords && jdMatchedKeywords.length > 0) {
    strengths.push(`JD overlap: ${jdMatchedKeywords.slice(0, 8).join(", ")}`);
  }
  if (sumScore >= 0.6) strengths.push("Summary section has reasonable length");
  if (expScore >= 0.6) strengths.push("Experience section shows measurable or dated impact");

  const result: AnalyzeResult = {
    score,
    category,
    matchedSkills,
    missingSkills,
    strengths,
    weaknesses,
    suggestions,
    scanMode: "rule",
  };

  if (jd) {
    result.jdMatchedKeywords = jdMatchedKeywords;
    result.jdMissingKeywords = jdMissingKeywords;
    result.jdCoverage = jdCoverage;
  }

  return result;
}
