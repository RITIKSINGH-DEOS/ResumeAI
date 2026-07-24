/** Shape returned by Gemini for the career advisor prompt (strict JSON). */

export type GeminiJobOption = {
  title: string;
  responsibilities: string;
  why: string;
};

export type GeminiSkillToLearn = {
  title: string;
  why: string;
  how: string;
};

export type GeminiSkillCategory = {
  category: string;
  skills: GeminiSkillToLearn[];
};

export type GeminiCareerGuide = {
  summary: string;
  jobOptions: GeminiJobOption[];
  skillsToLearn: GeminiSkillCategory[];
  learningApproach: {
    title: string;
    points: string[];
  };
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export function parseGeminiCareerGuideJson(raw: string): GeminiCareerGuide {
  let text = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const fenced = text.match(fence);
  if (fenced?.[1]) text = fenced[1].trim();
  else {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) text = text.slice(start, end + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Could not parse career guide JSON from the model response.");
  }

  if (!isRecord(parsed)) throw new Error("Invalid career guide: root must be an object.");

  const summary = typeof parsed.summary === "string" ? parsed.summary : "";
  const jobOptions = Array.isArray(parsed.jobOptions) ? parsed.jobOptions : [];
  const skillsToLearn = Array.isArray(parsed.skillsToLearn) ? parsed.skillsToLearn : [];
  const la = parsed.learningApproach;

  const learningApproach =
    isRecord(la) && typeof la.title === "string" && Array.isArray(la.points)
      ? { title: la.title, points: la.points.filter((p): p is string => typeof p === "string") }
      : { title: "How to Approach Learning", points: [] as string[] };

  return {
    summary,
    jobOptions: jobOptions.filter(isRecord).map((j) => ({
      title: typeof j.title === "string" ? j.title : "",
      responsibilities: typeof j.responsibilities === "string" ? j.responsibilities : "",
      why: typeof j.why === "string" ? j.why : "",
    })),
    skillsToLearn: skillsToLearn.filter(isRecord).map((c) => ({
      category: typeof c.category === "string" ? c.category : "",
      skills: Array.isArray(c.skills)
        ? c.skills.filter(isRecord).map((s) => ({
            title: typeof s.title === "string" ? s.title : "",
            why: typeof s.why === "string" ? s.why : "",
            how: typeof s.how === "string" ? s.how : "",
          }))
        : [],
    })),
    learningApproach,
  };
}

export function buildCareerAdvisorPrompt(skills: string): string {
  return `
Based on the following skills: ${skills}.

Please act as a career advisor and generate a career path suggestion.
Your entire response must be in a valid JSON format. Do not include any text or markdown
formatting outside of the JSON structure.

The JSON object should have the following structure:
{
 "summary": "A brief, encouraging summary of the user's skill set and their general job
title.",
 "jobOptions": [
 {
"title": "The name of the job role.",
"responsibilities": "A description of what the user would do in this role.",
"why": "An explanation of why this role is a good fit for their skills."
 }
 ],
 "skillsToLearn": [
 {
"category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
Mastery', 'DevOps & Cloud').",
"skills": [
 {
 "title": "The name of the skill to learn.",
 "why": "Why learning this skill is important.",
 "how": "Specific examples of how to learn or apply this skill."
 }
]
 }
 ],
 "learningApproach": {
"title": "How to Approach Learning",
"points": ["A bullet point list of actionable advice for learning."]
 }
}
`.trim();
}
