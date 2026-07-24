/**
 * Heuristic: reject study / DSA / problem-set PDFs that are not CVs.
 * Looks for resume sections (experience, skills, projects, education) vs notes patterns.
 */

const MAX_SCAN = 200_000;

function scoreResumeSignals(t: string): number {
  let s = 0;
  const patterns = [
    /\b(work experience|professional experience|employment history|employment|internship)\b/i,
    /\b(relevant experience|work history)\b/i,
    /\b(skills?|technical skills?|key skills?|core competencies?|programming languages?)\b/i,
    /\bprojects?\b/i,
    /\b(education|academic|university|college|qualification|degree|b\.?tech|b\.?e\.?|m\.?tech|mba|bachelor|master|cgpa|gpa)\b/i,
    /\b(summary|objective|career objective|about me|professional summary)\b/i,
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    /\b(responsibilities|achievements|deliverables)\b/i,
    /\b(certifications?|certificates?)\b/i,
    /\b(linkedin\.com|github\.com)\b/i,
  ];
  for (const p of patterns) {
    if (p.test(t)) s++;
  }
  return s;
}

function scoreNotesLikeSignals(t: string): number {
  let s = 0;
  const patterns = [
    /\btime complexity\b/i,
    /\bspace complexity\b/i,
    /\bO\(\s*n\b/i,
    /\bO\(\s*1\b/i,
    /\bO\(\s*log\b/i,
    /\bsample input\b/i,
    /\bsample output\b/i,
    /\bconstraints:\b/i,
    /\bproblem statement\b/i,
    /\bpractice problem\b/i,
    /\bleetcode\b/i,
    /\bgeeksforgeeks\b|\bgeeks for geeks\b|\bgfg\b/i,
    /\bdsa\b|\bdata structures and algorithms\b/i,
    /\bcompetitive programming\b/i,
  ];
  for (const p of patterns) {
    if (p.test(t)) s++;
  }
  return s;
}

export function looksLikeResumeText(text: string): boolean {
  const t = text.slice(0, MAX_SCAN);
  const len = t.trim().length;
  if (len < 80) return true;

  const r = scoreResumeSignals(t);
  const n = scoreNotesLikeSignals(t);

  if (r >= 4) return true;
  if (n >= 5 && r <= 2) return false;
  if (n >= 4 && r <= 1) return false;
  if (r < 2 && len >= 500) return false;
  if (n >= 5 && r <= 3 && n >= r + 2) return false;
  if (r >= 3 && n < 4) return true;
  if (r >= 2 && n <= 3) return true;
  if (n >= 4 && r <= 2) return false;
  return r >= 2;
}

export const RESUME_LIKENESS_ERROR =
"Please upload a valid resume.";
