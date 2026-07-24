/**
 * Role → canonical skill phrases (lowercase). Used for ATS-style matching.
 * Synonyms map user bullets → these canonical forms.
 */

export const ROLE_SKILLS = {
  ENGINEERING: [
    "javascript",
    "typescript",
    "react",
    "node.js",
    "api",
    "rest",
    "mongodb",
    "postgresql",
    "system design",
    "docker",
    "kubernetes",
    "git",
    "ci/cd",
    "aws",
  ],
  FRONTEND: [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "next.js",
    "tailwind",
    "responsive design",
    "accessibility",
    "webpack",
    "git",
  ],
  BACKEND: [
    "node.js",
    "express",
    "api",
    "rest",
    "graphql",
    "database",
    "postgresql",
    "redis",
    "authentication",
    "microservices",
    "docker",
    "git",
  ],
  DATA: [
    "python",
    "sql",
    "pandas",
    "machine learning",
    "data visualization",
    "etl",
    "statistics",
    "tensorflow",
    "jupyter",
    "git",
  ],
  PRODUCT: [
    "roadmap",
    "stakeholders",
    "user research",
    "metrics",
    "prioritization",
    "agile",
    "jira",
    "prd",
    "analytics",
    "a/b testing",
  ],
  FINANCE: [
    "gaap",
    "financial reporting",
    "excel",
    "budgeting",
    "forecasting",
    "audit",
    "reconciliation",
    "quickbooks",
    "accounts payable",
    "tax",
  ],
  DESIGN: [
    "figma",
    "ui",
    "ux",
    "prototyping",
    "wireframes",
    "design systems",
    "user research",
    "accessibility",
    "branding",
    "illustration",
  ],
} as const;

export type RoleCategory = keyof typeof ROLE_SKILLS;

/** Map common aliases → canonical skill token (must exist in some ROLE_SKILLS list). */
export const SKILL_SYNONYMS: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  k8s: "kubernetes",
  kube: "kubernetes",
  mongodb: "mongodb",
  mongo: "mongodb",
  postgres: "postgresql",
  psql: "postgresql",
  node: "node.js",
  expressjs: "express",
  reactjs: "react",
  nextjs: "next.js",
  tailwindcss: "tailwind",
  ml: "machine learning",
  ai: "machine learning",
  deeplearning: "machine learning",
  powerbi: "data visualization",
  tableau: "data visualization",
  pm: "prioritization",
  "a/b": "a/b testing",
  abtest: "a/b testing",
  ap: "accounts payable",
  bookkeeping: "reconciliation",
};

/** Longest-first list of all canonical skills for substring scans. */
export function getAllCanonicalSkills(): string[] {
  const s = new Set<string>();
  (Object.keys(ROLE_SKILLS) as RoleCategory[]).forEach((cat) => {
    ROLE_SKILLS[cat].forEach((x) => s.add(x));
  });
  return [...s].sort((a, b) => b.length - a.length);
}

export function normalizeToken(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Expand one user skill token to canonical form if known. */
export function canonicalizeSkillToken(raw: string): string {
  const n = normalizeToken(raw).replace(/^[-•*]\s*/, "");
  if (!n) return "";
  const syn = SKILL_SYNONYMS[n];
  if (syn) return syn;
  return n;
}
