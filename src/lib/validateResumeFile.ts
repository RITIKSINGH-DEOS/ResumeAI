const MAX_BYTES = 10 * 1024 * 1024;

/** Allowed for home analyze pipeline (matches `extractResumeText` + upload UX). */
export function isValidResumeFile(file: File): boolean {
  if (file.size === 0 || file.size > MAX_BYTES) return false;

  const name = file.name.toLowerCase();
  const extOk =
    name.endsWith(".pdf") ||
    name.endsWith(".docx") ||
    name.endsWith(".doc") ||
    name.endsWith(".txt");

  const t = file.type;
  const mimeOk =
    t === "application/pdf" ||
    t === "application/msword" ||
    t === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    t.startsWith("text/");

  return extOk || mimeOk;
}
