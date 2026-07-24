import type { Metadata } from "next";
import { ResumeBuilderClient } from "@/components/builder/ResumeBuilderClient";

export const metadata: Metadata = {
  title: "Resume Builder · ResumeAI",
  description: "Build and export a resume PDF with ResumeAI templates.",
};

export default function BuilderPage() {
  return <ResumeBuilderClient />;
}
