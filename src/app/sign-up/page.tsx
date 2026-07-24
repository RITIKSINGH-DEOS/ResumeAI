import type { Metadata } from "next";
import { SignUpPageClient } from "./SignUpPageClient";

export const metadata: Metadata = {
  title: "Sign up · ResumeAI",
  description: "Create your ResumeAI account with Google to analyze your resume and edit with AI.",
};

export default function SignUpPage() {
  return <SignUpPageClient />;
}
