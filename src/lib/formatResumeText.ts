/**
 * Clean PDF/OCR resume text and split into sections for readable UI.
 */

const OCR_JUNK = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u0080-\u009F\uFFFDï§ü¶]/g;

/** Known section titles (single line, short). */
const SECTION_TITLE =
  /^(#{1,3}\s*)?(Summary|Objective|Contact|Experience|Work Experience|Professional Experience|Internship|Education|Skills|Technical Skills|Projects|Achievements|Certifications?|Publications|References)\s*$/i;

/**
 * Normalize extracted resume: strip OCR noise, fix glued bullets, soft line breaks.
 */
export function normalizeResumeText(raw: string): string {
  let t = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  t = t.replace(OCR_JUNK, " ");
  t = t.replace(/\s*--\s*\d+\s+of\s+\d+\s*--\s*/gi, "\n");
  t = t.replace(/^#{1,3}\s+/gm, "");
  t = t.replace(/[·▪‣⁃]/g, "•");
  if (/linkedin|github|medium|gmail|phone/i.test(t)) {
    t = t.replace(/\s*#\s*/g, " · ");
    t = t.replace(/\s*ï\s*/gi, " ");
    t = t.replace(/\s*§\s*/g, " · ");
    t = t.replace(/\s*ü\s*/g, " · ");
  }
  t = t.replace(/([^\n\s])(•)/g, "$1\n$2");
  t = t.replace(/([.!?])\s*([A-Z][a-z]+ \|)/g, "$1\n$2");
  const lineArr = t.split("\n").map((line) => line.trimEnd());
  const out: string[] = [];
  for (let i = 0; i < lineArr.length; i++) {
    const line = lineArr[i];
    if (SECTION_TITLE.test(line.trim()) && i > 0 && lineArr[i - 1]?.trim() !== "") {
      out.push("");
    }
    out.push(line);
  }
  t = out.join("\n");
  t = t.replace(/\n{4,}/g, "\n\n\n");
  t = t.replace(/\n(Skills|Experience|Education|Projects)\s*\n\1\s*\n/gi, "\n$1\n");
  return t.trim();
}

export type ResumeSection = {
  title: string;
  lines: string[];
};

/**
 * Split normalized text into sections for card UI. Lines before first heading → "Overview".
 */
export function parseResumeSections(text: string): ResumeSection[] {
  const lines = text.split("\n").map((l) => l.trim());
  const sections: ResumeSection[] = [];
  let current: ResumeSection = { title: "Overview", lines: [] };

  for (const line of lines) {
    if (!line) {
      if (current.lines.length) current.lines.push("");
      continue;
    }
    const short = line.length < 90 && !line.includes("•");
    if (short && SECTION_TITLE.test(line)) {
      if (current.lines.length || current.title !== "Overview") {
        sections.push(current);
      }
      current = { title: line.replace(/^#{1,3}\s*/, "").trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  const filtered = sections.filter((s) => s.lines.some((l) => l.length > 0) || s.title !== "Overview");
  if (filtered.length === 0 && text.trim()) {
    return [{ title: "Resume", lines: text.split("\n").map((l) => l.trimEnd()) }];
  }
  return filtered;
}
