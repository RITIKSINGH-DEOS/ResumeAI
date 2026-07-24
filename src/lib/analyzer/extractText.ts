/**
 * Normalize raw resume text for rule-based parsing.
 */
export function cleanText(text: string): string {
  if (!text) return "";
  let s = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  s = s.toLowerCase();
  s = s.replace(/,\s*/g, ", ");
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}
