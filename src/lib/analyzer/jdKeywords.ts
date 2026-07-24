import { getAllCanonicalSkills } from "./skillDataset";

const STOP = new Set([
  "and",
  "the",
  "for",
  "with",
  "you",
  "your",
  "our",
  "are",
  "this",
  "that",
  "from",
  "have",
  "has",
  "will",
  "must",
  "able",
  "work",
  "team",
  "years",
  "year",
  "using",
  "including",
  "such",
  "into",
  "about",
  "their",
  "they",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "how",
  "all",
  "any",
  "but",
  "not",
  "can",
  "may",
  "etc",
]);

/**
 * Find canonical skills mentioned in JD; split into present vs missing on resume.
 */
export function jdSkillGaps(resumeLower: string, jdRaw: string): {
  jdMatchedSkills: string[];
  jdMissingSkills: string[];
  jdCoverage: number;
} {
  const jd = jdRaw.trim().toLowerCase();
  if (!jd) {
    return { jdMatchedSkills: [], jdMissingSkills: [], jdCoverage: 1 };
  }

  const master = getAllCanonicalSkills();
  const jdMatchedSkills: string[] = [];
  const jdMissingSkills: string[] = [];

  for (const term of master) {
    if (term.length < 2) continue;
    if (!jd.includes(term)) continue;
    if (resumeLower.includes(term)) jdMatchedSkills.push(term);
    else jdMissingSkills.push(term);
  }

  const hit = jdMatchedSkills.length + jdMissingSkills.length;
  const jdCoverage = hit === 0 ? 1 : jdMatchedSkills.length / hit;

  return { jdMatchedSkills, jdMissingSkills, jdCoverage };
}

/**
 * Extra multi-word phrases from JD (simple) — tech-ish tokens not in master list.
 */
export function extraJdPhrases(jdRaw: string, max = 12): string[] {
  const jd = jdRaw.toLowerCase();
  const words = jd.split(/[^a-z0-9+/]+/).filter((w) => w.length >= 5 && !STOP.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}
