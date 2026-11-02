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


export function generateFallbackCareerGuide(skillsInput: string): GeminiCareerGuide {
  const s = skillsInput.toLowerCase();
  const isData = /python|sql|data|machine learning|pandas|numpy|ai|ml/.test(s);
  const isBackend = /backend|node|express|java|spring|c#|\.net|go|golang|django|database|api/.test(s);

  if (isData) {
    return {
      summary: `Your background in ${skillsInput.trim()} provides a strong foundation for Data Science, Analytics, and ML Engineering paths.`,
      jobOptions: [
        {
          title: "Data Analyst / Analytics Engineer",
          responsibilities: "Transform raw data into actionable dashboards, KPIs, and statistical insights for product and business teams.",
          why: "Directly aligns with your data analysis and analytical mindset."
        },
        {
          title: "Machine Learning Engineer",
          responsibilities: "Develop, train, and deploy predictive models and data pipelines into production systems.",
          why: "Natural progression from core data fundamentals to production AI and ML infrastructure."
        }
      ],
      skillsToLearn: [
        {
          category: "Advanced Data & ML Engineering",
          skills: [
            { title: "SQL & Data Warehousing", why: "Crucial for querying enterprise datasets at scale.", how: "Practice complex CTEs, window functions, and tools like Snowflake or BigQuery." },
            { title: "MLOps & Model Deployment", why: "Companies need models deployed via production APIs.", how: "Build FastAPI endpoints and containerize ML models using Docker." }
          ]
        }
      ],
      learningApproach: {
        title: "Recommended Roadmap",
        points: [
          "Build 2 end-to-end data pipelines with clean visual dashboards.",
          "Work with real-world messy datasets from Kaggle to showcase data cleaning and exploration.",
          "Write technical READMEs explaining problem statements, methodology, and measurable business impact."
        ]
      }
    };
  }

  if (isBackend) {
    return {
      summary: `Your skills in ${skillsInput.trim()} position you well for Backend and Distributed Systems Engineering roles.`,
      jobOptions: [
        {
          title: "Backend Engineer / API Developer",
          responsibilities: "Design, build, and optimize scalable server-side APIs, microservices, and database architectures.",
          why: `Directly matches your hands-on proficiency in ${skillsInput.trim()}.`
        },
        {
          title: "Full-Stack Software Engineer",
          responsibilities: "Deliver end-to-end features across both the frontend presentation layer and backend database services.",
          why: "Expands your market reach and gives you complete ownership over product development."
        }
      ],
      skillsToLearn: [
        {
          category: "Distributed Systems & Cloud Architecture",
          skills: [
            { title: "Database Optimization & Indexing", why: "Essential for scaling high-throughput queries.", how: "Learn PostgreSQL query execution plans, indexing strategies, and caching with Redis." },
            { title: "Docker & CI/CD Pipelines", why: "Standard for modern containerized microservice deployments.", how: "Containerize applications with Docker and setup GitHub Actions for automated testing." }
          ]
        }
      ],
      learningApproach: {
        title: "Recommended Roadmap",
        points: [
          "Build a high-performance REST/GraphQL backend with JWT auth and rate limiting.",
          "Implement background worker queues (BullMQ/Redis) for asynchronous tasks.",
          "Document APIs using Swagger/OpenAPI specifications."
        ]
      }
    };
  }

  // Default: Frontend / Web / React
  return {
    summary: `Your experience with ${skillsInput.trim()} gives you a high-demand skillset in modern web and frontend software development.`,
    jobOptions: [
      {
        title: "Frontend Developer / React Engineer",
        responsibilities: "Build high-performance, responsive user interfaces and component libraries with modern JavaScript frameworks.",
        why: `Directly matches your hands-on proficiency in ${skillsInput.trim()}.`
      },
      {
        title: "Full-Stack Software Engineer",
        responsibilities: "Develop end-to-end web applications, integrating responsive client UIs with robust serverless APIs and databases.",
        why: "Expanding your current skillset to full-stack maximizes your hiring opportunities and project impact."
      }
    ],
    skillsToLearn: [
      {
        category: "Deepen Your Modern Stack",
        skills: [
          { title: "TypeScript & Next.js", why: "Industry standard for production React apps with SSR and type safety.", how: "Convert existing React components to strict TypeScript with Next.js App Router." },
          { title: "State Management & Data Fetching", why: "Essential for handling complex asynchronous client states.", how: "Master TanStack Query (React Query) and Zustand for lightweight state handling." }
        ]
      },
      {
        category: "Backend & Systems Foundations",
        skills: [
          { title: "REST APIs & Database Integration", why: "Allows you to build independent end-to-end products.", how: "Build backend routes using Next.js API Routes connected to Supabase or PostgreSQL." }
        ]
      }
    ],
    learningApproach: {
      title: "Strategic Career Action Plan",
      points: [
        "Develop 2 comprehensive full-stack portfolio projects showcasing real-world auth, database, and payments.",
        "Ensure all projects have live deployments with clean Git commits and clear documentation.",
        "Practice core JavaScript/TypeScript concepts and algorithmic problem solving for technical interviews."
      ]
    }
  };
}