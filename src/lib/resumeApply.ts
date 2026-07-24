import { joinResumeSections, splitResumeIntoSections, type ResumeSections } from "@/lib/resumeSections";

function same(a: ResumeSections, b: ResumeSections): boolean {
  return (
    a.summary === b.summary &&
    a.experience === b.experience &&
    a.skills === b.skills &&
    a.projects === b.projects
  );
}

export function applySkillKeyword(content: string, keyword: string): { next: string; changed: boolean } {
  const k = keyword.trim();
  if (!k) return { next: content, changed: false };
  const s = splitResumeIntoSections(content);
  const sk = s.skills.trim();
  if (sk.toLowerCase().includes(k.toLowerCase())) return { next: content, changed: false };
  const nextS = { ...s, skills: sk ? `${sk}\n${k}` : k };
  return { next: joinResumeSections(nextS), changed: true };
}

export function applyLearningLine(content: string, line: string): { next: string; changed: boolean } {
  const clean = line.replace(/^Address gap:\s*/i, "").trim();
  if (!clean) return { next: content, changed: false };
  const s = splitResumeIntoSections(content);
  const bullet = clean.startsWith("-") ? clean : `- ${clean}`;
  const ex = s.experience.trim();
  const nextS = { ...s, experience: ex ? `${ex}\n${bullet}` : bullet };
  return { next: joinResumeSections(nextS), changed: !same(s, nextS) };
}

export function applyResumeImprovement(content: string, line: string): { next: string; changed: boolean } {
  const clean = line.replace(/^Apply to resume:\s*/i, "").trim();
  if (!clean) return { next: content, changed: false };
  const s = splitResumeIntoSections(content);
  const sum = s.summary.trim();
  const addition = clean.startsWith("-") ? clean : `• ${clean}`;
  const nextS = { ...s, summary: sum ? `${sum}\n${addition}` : addition };
  return { next: joinResumeSections(nextS), changed: !same(s, nextS) };
}

export function applyProjectLine(content: string, line: string): { next: string; changed: boolean } {
  const clean = line.trim();
  if (!clean) return { next: content, changed: false };
  const s = splitResumeIntoSections(content);
  const bullet = clean.startsWith("-") ? clean : `- ${clean}`;
  const pr = s.projects.trim();
  const nextS = { ...s, projects: pr ? `${pr}\n${bullet}` : bullet };
  return { next: joinResumeSections(nextS), changed: !same(s, nextS) };
}
