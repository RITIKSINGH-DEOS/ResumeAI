export type ResumeData = {
  personal: {
    name: string;
    address: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    duration: string;
    location: string;
    points: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    title: string;
    tech: string;
    link: string;
    date: string;
    points: string[];
  }[];
  achievements: {
    title: string;
    description: string;
  }[];
  education: {
    institute: string;
    degree: string;
    cgpa: string;
    duration: string;
    location: string;
  }[];
};

export const EMPTY_RESUME: ResumeData = {
  personal: {
    name: "",
    address: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    portfolio: "",
  },
  summary: "",
  experience: [{ company: "", role: "", duration: "", location: "", points: [""] }],
  skills: [{ category: "", items: [""] }],
  projects: [{ title: "", tech: "", link: "", date: "", points: [""] }],
  achievements: [{ title: "", description: "" }],
  education: [{ institute: "", degree: "", cgpa: "", duration: "", location: "" }],
};
