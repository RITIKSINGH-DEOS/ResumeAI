import type { Metadata } from "next";
import { PostAnalysisEditorClient } from "@/components/editor/PostAnalysisEditorClient";

export const metadata: Metadata = {
  title: "Career guide · ResumeAI",
  description: "Enter skills and get a structured AI career path—milestones and guidance powered by Gemini.",
};

export default function EditorPage() {
  return <PostAnalysisEditorClient />;
}
