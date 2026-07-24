export type ResumeSections = {
  summary: string;
  experience: string;
  skills: string;
  projects: string;
};

/** Split pasted resume into sections; fallback heuristics if no ## headers */
export function splitResumeIntoSections(text: string): ResumeSections {
  const raw = text.replace(/\r\n/g, "\n").trim();
  if (!raw) return { summary: "", experience: "", skills: "", projects: "" };

  const hasHeaders = /^#+\s*(summary|experience|skills|work|employment|project)/im.test(raw);

  if (!hasHeaders) {
    const mid = Math.floor(raw.length / 2);
    return {
      summary: raw.slice(0, Math.min(800, mid)).trim(),
      experience: raw.slice(Math.min(800, mid)).trim(),
      skills: "",
      projects: "",
    };
  }

  const blocks: Record<string, string> = {};
  const re = /^#+\s*([^\n]+)\n([\s\S]*?)(?=^#+\s|\Z)/gim;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw + "\n")) !== null) {
    const title = m[1].trim().toLowerCase();
    const body = m[2].trim();
    if (title.includes("summary") || title.includes("objective") || title.includes("profile")) {
      blocks.summary = (blocks.summary ? blocks.summary + "\n\n" : "") + body;
    } else if (
      title.includes("experience") ||
      title.includes("employment") ||
      title.includes("work")
    ) {
      blocks.experience = (blocks.experience ? blocks.experience + "\n\n" : "") + body;
    } else if (title.includes("skill") || title.includes("technologies")) {
      blocks.skills = (blocks.skills ? blocks.skills + "\n\n" : "") + body;
    } else if (title.includes("project")) {
      blocks.projects = (blocks.projects ? blocks.projects + "\n\n" : "") + body;
    }
  }

  if (!blocks.summary && !blocks.experience && !blocks.skills && !blocks.projects) {
    return {
      summary: raw.slice(0, 600).trim(),
      experience: raw.slice(600).trim(),
      skills: "",
      projects: "",
    };
  }

  return {
    summary: blocks.summary ?? "",
    experience: blocks.experience ?? "",
    skills: blocks.skills ?? "",
    projects: blocks.projects ?? "",
  };
}

export function joinResumeSections(s: ResumeSections): string {
  const lines = [
    "## Summary",
    s.summary.trim(),
    "",
    "## Experience",
    s.experience.trim(),
    "",
    "## Skills",
    s.skills.trim(),
  ];
  if (s.projects.trim()) {
    lines.push("", "## Projects", s.projects.trim());
  }
  return lines.join("\n").trim();
}
