/**
 * Reference archive for merging with AI-extracted resume insights.
 * Used to enrich suggestions (skills, projects, certificates) when relevant.
 */

export const ARCHIVE_RELATED_SKILLS = [
  "TypeScript",
  "React",
  "Node.js",
  "REST APIs",
  "Git",
  "SQL",
  "System design",
  "CI/CD",
  "Docker",
  "AWS basics",
] as const;

export const ARCHIVE_PROJECT_IDEAS = [
  "Full-stack CRUD app with auth & deployed API",
  "REST + OpenAPI service with tests and README metrics",
  "Real-time dashboard (WebSockets or SSE) with charts",
  "CLI tool published to npm with usage docs",
] as const;

export const ARCHIVE_CERTIFICATE_EXAMPLES = [
  "AWS Cloud Practitioner / Solutions Associate",
  "Google Associate Cloud Engineer",
  "Meta Front-End Developer Professional Certificate",
  "freeCodeCamp Responsive Web Design / JS Algorithms",
  "Kubernetes (CKA) fundamentals",
] as const;

export function mergeArchiveSkills(aiSkills: string[]): string[] {
  const set = new Set(aiSkills.map((s) => s.trim()).filter(Boolean));
  for (const s of ARCHIVE_RELATED_SKILLS) {
    if (set.size >= 24) break;
    const lower = s.toLowerCase();
    if (![...set].some((x) => x.toLowerCase() === lower)) {
      set.add(s);
    }
  }
  return [...set];
}

export function mergeArchiveProjects(aiProjects: string[]): string[] {
  const out = [...aiProjects.map((p) => p.trim()).filter(Boolean)];
  const seen = new Set(out.map((p) => p.toLowerCase()));
  for (const p of ARCHIVE_PROJECT_IDEAS) {
    if (out.length >= 12) break;
    if (!seen.has(p.toLowerCase())) {
      out.push(p);
      seen.add(p.toLowerCase());
    }
  }
  return out;
}

export function mergeArchiveCertificates(aiCerts: string[]): string[] {
  const out = [...aiCerts.map((c) => c.trim()).filter(Boolean)];
  const seen = new Set(out.map((c) => c.toLowerCase()));
  for (const c of ARCHIVE_CERTIFICATE_EXAMPLES) {
    if (out.length >= 10) break;
    if (!seen.has(c.toLowerCase())) {
      out.push(c);
      seen.add(c.toLowerCase());
    }
  }
  return out;
}
