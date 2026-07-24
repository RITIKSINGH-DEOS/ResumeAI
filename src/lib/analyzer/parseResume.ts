import { cleanText } from "./extractText";

export type ParsedResume = {
  summary: string;
  skills: string[];
  experience: string;
};

function splitSkillsBlock(block: string): string[] {
  const parts = block.split(/[,\n;|]+/);
  return parts
    .map((p) => p.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

/**
 * Parse cleaned (lowercase) resume text into summary, skills list, experience body.
 */
export function parseResume(cleanedText: string): ParsedResume {
  const text = cleanedText.trim();
  if (!text) {
    return { summary: "", skills: [], experience: "" };
  }

  const lines = text.split("\n");
  type Section = "none" | "summary" | "skills" | "experience";
  let section: Section = "none";
  const summaryLines: string[] = [];
  const skillLines: string[] = [];
  const expLines: string[] = [];

  const header = (line: string): Section | null => {
    const t = line.trim();
    if (
      /^(summary|professional summary|profile|objective|about(\s+me)?|overview|highlights)\b/.test(t)
    )
      return "summary";
    if (
      /^(skills|technical skills|core competencies|technologies|tech stack|tools|expertise|key skills)\b/.test(
        t
      )
    )
      return "skills";
    if (
      /^(experience|work experience|employment|professional experience|career history|relevant experience)\b/.test(
        t
      )
    )
      return "experience";
    return null;
  };

  for (const line of lines) {
    const h = header(line);
    if (h) {
      section = h;
      const afterColon = line.replace(/^[^:]+:\s*/, "").trim();
      if (afterColon && afterColon.length < line.length) {
        if (section === "summary") summaryLines.push(afterColon);
        if (section === "skills") skillLines.push(afterColon);
        if (section === "experience") expLines.push(afterColon);
      }
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    if (section === "summary") summaryLines.push(trimmed);
    else if (section === "skills") skillLines.push(trimmed);
    else if (section === "experience") expLines.push(trimmed);
  }

  const summary = summaryLines.join(" ").replace(/\s+/g, " ").trim();
  const skillsRaw = skillLines.join("\n");
  const skills = splitSkillsBlock(skillsRaw);
  let experience = expLines.join("\n").trim();

  if (!summary && skills.length === 0 && !experience) {
    experience = text;
  }

  return { summary, skills, experience };
}

/** Convenience: clean then parse */
export function parseResumeRaw(rawText: string): ParsedResume {
  return parseResume(cleanText(rawText));
}
