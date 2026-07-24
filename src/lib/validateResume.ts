import { z } from "zod";

/**
 * Zod schema: trimmed string, min length, required section keywords (case-insensitive).
 */
export const resumeTextSchema = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : ""),
  z
    .string()
    .min(1, "Resume text is empty.")
    .min(200, "Resume must be at least 200 characters.")
    .superRefine((val, ctx) => {
      const lower = val.toLowerCase();
      const missing: string[] = [];
      if (!lower.includes("skills")) missing.push("skills");
      if (!lower.includes("experience") && !lower.includes("projects")) {
        missing.push("experience or projects");
      }
      if (!lower.includes("education")) missing.push("education");
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing required sections: ${missing.join(", ")}.`,
        });
      }
    })
);

export type ResumeValidationResult = { isValid: boolean; message: string };

/**
 * Validates resume text using the same rules as the Zod schema.
 */
export function validateResume(text: unknown): ResumeValidationResult {
  const result = resumeTextSchema.safeParse(text);
  if (result.success) {
    return { isValid: true, message: "Resume passes basic checks." };
  }
  const first = result.error.issues[0];
  return { isValid: false, message: first?.message ?? "Invalid resume text." };
}
